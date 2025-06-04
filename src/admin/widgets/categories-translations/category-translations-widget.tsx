import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import CustomDataTable from "./table/data-table";
import {
  DetailWidgetProps,
  AdminProductCategory,
} from "@medusajs/framework/types";
import { CreateCategoryTranslationForm } from "./forms/create-cattr-form";
import { sdk } from "../../lib/sdk";
import { useQuery } from "@tanstack/react-query";

export type Translation = {
  id: string;
  category_id: string;
  language_code: string;
  name: string;
  description: string;
};

export const CategoryTranslationsWidget = ({
  data,
}: DetailWidgetProps<AdminProductCategory>) => {
  const {
    data: translations,
    isLoading,
    refetch,
  } = useQuery<Translation[]>({
    queryFn: () =>
      sdk.client.fetch(`/admin/categories/${data.id}/translations`, {
        method: "GET",
      }),
    queryKey: ["translations", data.id],
  });
  console.log(data.id);
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between p-4">
        <Heading level="h2">Translations</Heading>
        <CreateCategoryTranslationForm categoryId={data.id} refetch={refetch} />
      </div>
      <CustomDataTable
        data={translations}
        refetch={refetch}
        isLoading={isLoading}
      />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.after",
});

export default CategoryTranslationsWidget;
