import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import CustomDataTable from "./table/data-table";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import { CreateProjectTranslationForm } from "./forms/create-prtr-form";
import { sdk } from "../../lib/sdk";
import { useQuery } from "@tanstack/react-query";

export type Translation = {
  id: string;
  product_id: string;
  language_code: string;
  title: string;
  sub_title?: string;
  description: string;
};

export const ProductTranslationsWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const {
    data: translations,
    isLoading,
    refetch,
  } = useQuery<Translation[]>({
    queryFn: () =>
      sdk.client.fetch(`/admin/products/${data.id}/translations`, {
        method: "GET",
      }),
    queryKey: ["translations", data.id],
  });

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between p-4">
        <Heading level="h2">Translations</Heading>
        <CreateProjectTranslationForm productId={data.id} refetch={refetch} />
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
  zone: "product.details.after",
});

export default ProductTranslationsWidget;
