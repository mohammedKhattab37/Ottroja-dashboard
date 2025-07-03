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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Category } from "@/generated/prisma";

interface CategoryModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  category?: Category;
  mode?: "create" | "edit";
}

export function CategoryModal({
  onSuccess,
  trigger,
  category,
  mode = "create",
}: CategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      imageUrl: category?.imageUrl || "",
      isActive: category?.isActive ?? true,
      sortOrder: category?.sortOrder || 0,
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Validate the data manually
      if (!data.name || !data.slug) {
        toast.error("Name and slug are required");
        return;
      }

      // Transform empty imageUrl to undefined
      const submitData = {
        ...data,
        imageUrl: data.imageUrl === "" ? undefined : data.imageUrl,
      };

      const url =
        mode === "edit" ? `/api/categories/${category?.id}` : "/api/categories";
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

        throw new Error(error.error || `Failed to ${mode} category`);
      }

      toast.success(
        `Category ${mode === "edit" ? "updated" : "created"} successfully`
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

  // Auto-generate slug from name (only for create mode)
  const handleNameChange = (value: string) => {
    form.setValue("name", value);
    if (mode === "create" && !form.getValues("slug")) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the category information."
              : "Add a new category to organize your products."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Category name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              placeholder="category-slug"
              disabled={mode === "edit"} // Don't allow editing slug
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-red-600">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Category description (optional)"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
              placeholder="https://example.com/image.jpg (optional)"
              type="url"
            />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-red-600">
                {form.formState.errors.imageUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              {...form.register("sortOrder", { valueAsNumber: true })}
              placeholder="0"
              type="number"
              min="0"
            />
            {form.formState.errors.sortOrder && (
              <p className="text-sm text-red-600">
                {form.formState.errors.sortOrder.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked: boolean) =>
                form.setValue("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Active</Label>
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
                : `${mode === "edit" ? "Update" : "Create"} Category`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteCategoryModalProps {
  category: Category;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteCategoryModal({
  category,
  onSuccess,
  trigger,
}: DeleteCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
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
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{category.name}"? This action
            cannot be undone.
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
            {isLoading ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
