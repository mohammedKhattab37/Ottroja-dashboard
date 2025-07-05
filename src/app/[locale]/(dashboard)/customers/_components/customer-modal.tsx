"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerWithUser {
  customerId: number;
  userId: string;
  dateOfBirth: Date | null;
  gender: string | null;
  lastLogin: Date | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    emailVerified: boolean;
  };
}

interface CustomerModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  customer?: CustomerWithUser;
  mode?: "create" | "edit";
}

export function CustomerModal({
  onSuccess,
  trigger,
  customer,
  mode = "create",
}: CustomerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const form = useForm({
    defaultValues: {
      userId: customer?.userId || "",
      dateOfBirth: customer?.dateOfBirth 
        ? new Date(customer.dateOfBirth).toISOString().split('T')[0] 
        : "",
      gender: customer?.gender || "",
    },
  });

  // Fetch available users for customer creation
  useEffect(() => {
    if (mode === "create" && isOpen) {
      fetchAvailableUsers();
    }
  }, [mode, isOpen]);

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/users?role=CUSTOMER&perPage=1000");
      if (response.ok) {
        const data = await response.json();
        // Filter out users who already have customer profiles
        const customersResponse = await fetch("/api/customers?perPage=1000");
        const customersData = customersResponse.ok ? await customersResponse.json() : { data: [] };
        
        const existingCustomerUserIds = new Set(
          customersData.data?.map((c: any) => c.userId) || []
        );
        
        const availableUsers = data.data?.filter(
          (user: any) => user.role === "CUSTOMER" && !existingCustomerUserIds.has(user.id)
        ) || [];
        
        setUsers(availableUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Validate the data manually
      if (mode === "create" && !data.userId) {
        toast.error("User selection is required");
        return;
      }

      // Transform the data
      const submitData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
        gender: data.gender || null,
      };

      const url =
        mode === "edit" 
          ? `/api/customers/${customer?.customerId}` 
          : "/api/customers";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle validation errors with specific messages
        if (error.issues && Array.isArray(error.issues)) {
          const errorMessages = error.issues
            .map((issue: any) => issue.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        throw new Error(error.error || `Failed to ${mode} customer`);
      }

      toast.success(
        `Customer ${mode === "edit" ? "updated" : "created"} successfully`
      );
      form.reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Customer" : "Create Customer Profile"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the customer profile information."
              : "Create a customer profile for an existing user."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="userId">Select User</Label>
              <Select
                value={form.watch("userId")}
                onValueChange={(value) => form.setValue("userId", value)}
                disabled={loadingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingUsers ? "Loading users..." : "Select a customer user"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.userId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.userId.message}
                </p>
              )}
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-2">
              <Label>Customer</Label>
              <div className="rounded-md bg-muted p-3">
                <p className="font-medium">{customer?.user.name}</p>
                <p className="text-sm text-muted-foreground">{customer?.user.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              {...form.register("dateOfBirth")}
              placeholder="YYYY-MM-DD"
              type="date"
            />
            {form.formState.errors.dateOfBirth && (
              <p className="text-sm text-red-600">
                {form.formState.errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={form.watch("gender")}
              onValueChange={(value) => form.setValue("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not specified</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.gender && (
              <p className="text-sm text-red-600">
                {form.formState.errors.gender.message}
              </p>
            )}
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <div className="rounded-md bg-muted p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Total Orders</p>
                    <p className="text-muted-foreground">{customer?.totalOrders}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Spent</p>
                    <p className="text-muted-foreground">${customer?.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Order metrics are automatically calculated
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (mode === "create" && loadingUsers)}>
              {isLoading
                ? `${mode === "edit" ? "Updating" : "Creating"}...`
                : `${mode === "edit" ? "Update" : "Create"} Customer`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteCustomerModalProps {
  customer: CustomerWithUser;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteCustomerModal({
  customer,
  onSuccess,
  trigger,
}: DeleteCustomerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customers/${customer.customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete customer");
      }

      toast.success("Customer deleted successfully");
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete customer"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canDelete = customer.totalOrders === 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the customer profile for "{customer.user.name}"?
          </DialogDescription>
        </DialogHeader>
        
        {!canDelete && (
          <div className="rounded-md bg-destructive/15 p-3">
            <p className="text-sm text-destructive">
              Cannot delete customer with order history ({customer.totalOrders} orders). 
              Consider anonymizing the data instead for GDPR compliance.
            </p>
          </div>
        )}
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || !canDelete}
          >
            {isLoading ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}