"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/generated/prisma";

interface UserModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  user?: User;
  mode?: "create" | "edit";
}

export function UserModal({
  onSuccess,
  trigger,
  user,
  mode = "create",
}: UserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "CUSTOMER",
      emailVerified: user?.emailVerified ?? false,
      image: user?.image || "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Validate the data manually
      if (!data.name || !data.email) {
        toast.error("Name and email are required");
        return;
      }

      // For create mode, password is required
      if (mode === "create" && !data.password) {
        toast.error("Password is required");
        return;
      }

      // Transform empty image to undefined
      const submitData = {
        ...data,
        image: data.image === "" ? undefined : data.image,
        // Don't include password for edit mode
        ...(mode === "edit" && { password: undefined }),
      };

      const url = mode === "edit" ? `/api/users/${user?.id}` : "/api/users";
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

        throw new Error(error.error || `Failed to ${mode} user`);
      }

      toast.success(
        `User ${mode === "edit" ? "updated" : "created"} successfully`
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
            Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit User" : "Create User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the user information."
              : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="User name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...form.register("email")}
              placeholder="user@example.com"
              type="email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                {...form.register("password")}
                placeholder="Password (minimum 8 characters)"
                type="password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Password will be securely hashed before storage
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) => form.setValue("role", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="MARKETER">Marketer</SelectItem>
                <SelectItem value="DESIGNER">Designer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-600">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              {...form.register("image")}
              placeholder="https://example.com/image.jpg (optional)"
              type="url"
            />
            {form.formState.errors.image && (
              <p className="text-sm text-red-600">
                {form.formState.errors.image.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="emailVerified"
              checked={form.watch("emailVerified")}
              onCheckedChange={(checked: boolean) =>
                form.setValue("emailVerified", checked)
              }
            />
            <Label htmlFor="emailVerified">Email Verified</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? `${mode === "edit" ? "Updating" : "Creating"}...`
                : `${mode === "edit" ? "Update" : "Create"} User`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteUserModalProps {
  user: User;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteUserModal({
  user,
  onSuccess,
  trigger,
}: DeleteUserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{user.name}"? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
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
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
