"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BasicInfoTab } from "../_components/basic-info-tab";
import { DetailsTab } from "../_components/details-tab";
import { VariantsTab } from "../_components/variants-tab";
import type { Product } from "@/lib/schemas/product";
import type { Category } from "@/lib/schemas/category";

interface ProductEditPageClientProps {
  product: Product & {
    category: {
      id: string;
      name: string;
      slug: string;
    };
    variants: any[];
  };
  categories: Category[];
}

export function ProductEditPageClient({ 
  product, 
  categories 
}: ProductEditPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic-info");

  const handleBack = () => {
    router.push("/products");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name_en}</h1>
            <p className="text-sm text-muted-foreground">
              Edit product details and manage variants
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-4">
          <BasicInfoTab product={product} categories={categories} />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <DetailsTab product={product} />
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <VariantsTab product={product} />
        </TabsContent>
      </Tabs>
    </div>
  );
}