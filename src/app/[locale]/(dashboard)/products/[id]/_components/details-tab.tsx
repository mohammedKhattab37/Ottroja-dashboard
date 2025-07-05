"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { z } from "zod";
import type { Product } from "@/lib/schemas/product";

const productDetailsSchema = z.object({
  id: z.string(),
  brief_title_en: z.string().optional(),
  brief_title_ar: z.string().optional(),
  brief_text_en: z.string().optional(),
  brief_text_ar: z.string().optional(),
  warnings_en: z.array(z.string()).optional(),
  warnings_ar: z.array(z.string()).optional(),
  benefits_en: z.array(z.string()).optional(),
  benefits_ar: z.array(z.string()).optional(),
  ingredients_en: z.array(z.string()).optional(),
  ingredients_ar: z.array(z.string()).optional(),
});

type ProductDetails = z.infer<typeof productDetailsSchema>;

interface DetailsTabProps {
  product: Product;
}

export function DetailsTab({ product }: DetailsTabProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductDetails>({
    resolver: zodResolver(productDetailsSchema),
    defaultValues: {
      id: product.id,
      brief_title_en: product.brief_title_en || "",
      brief_title_ar: product.brief_title_ar || "",
      brief_text_en: product.brief_text_en || "",
      brief_text_ar: product.brief_text_ar || "",
      warnings_en: product.warnings_en || [],
      warnings_ar: product.warnings_ar || [],
      benefits_en: product.benefits_en || [],
      benefits_ar: product.benefits_ar || [],
      ingredients_en: product.ingredients_en || [],
      ingredients_ar: product.ingredients_ar || [],
    },
  });

  const onSubmit = async (data: ProductDetails) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product details");
      }

      toast.success("Product details updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const addArrayItem = (fieldName: keyof ProductDetails, value: string) => {
    if (!value.trim()) return;
    
    const currentArray = form.getValues(fieldName) as string[] || [];
    const newArray = [...currentArray, value.trim()];
    form.setValue(fieldName, newArray as any, { shouldValidate: true, shouldDirty: true });
  };

  const removeArrayItem = (fieldName: keyof ProductDetails, index: number) => {
    const currentArray = form.getValues(fieldName) as string[] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    form.setValue(fieldName, newArray as any, { shouldValidate: true, shouldDirty: true });
  };

  const ArrayFieldComponent = ({ 
    fieldName, 
    label, 
    placeholder 
  }: { 
    fieldName: keyof ProductDetails; 
    label: string; 
    placeholder: string; 
  }) => {
    const [inputValue, setInputValue] = useState("");
    const items = form.watch(fieldName) as string[] || [];

    return (
      <div className="space-y-2">
        <FormLabel>{label}</FormLabel>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArrayItem(fieldName, inputValue);
                setInputValue("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              addArrayItem(fieldName, inputValue);
              setInputValue("");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              <span>{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeArrayItem(fieldName, index);
                }}
              >
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Marketing Content */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing Content</CardTitle>
            <CardDescription>
              Brief titles and marketing text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brief_title_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Title (English)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brief_title_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Title (Arabic)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brief_text_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Text (English)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brief_text_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Text (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Benefits, warnings, and ingredients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <ArrayFieldComponent
                fieldName="benefits_en"
                label="Benefits (English)"
                placeholder="Add benefit..."
              />
              <ArrayFieldComponent
                fieldName="benefits_ar"
                label="Benefits (Arabic)"
                placeholder="أضف فائدة..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <ArrayFieldComponent
                fieldName="warnings_en"
                label="Warnings (English)"
                placeholder="Add warning..."
              />
              <ArrayFieldComponent
                fieldName="warnings_ar"
                label="Warnings (Arabic)"
                placeholder="أضف تحذير..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <ArrayFieldComponent
                fieldName="ingredients_en"
                label="Ingredients (English)"
                placeholder="Add ingredient..."
              />
              <ArrayFieldComponent
                fieldName="ingredients_ar"
                label="Ingredients (Arabic)"
                placeholder="أضف مكون..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Details"}
          </Button>
        </div>
      </form>
    </Form>
  );
}