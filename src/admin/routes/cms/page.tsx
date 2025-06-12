import { defineRouteConfig } from "@medusajs/admin-sdk";
import { PenPlus } from "@medusajs/icons";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  createDataTableColumnHelper,
  DataTable,
  Heading,
  useDataTable,
} from "@medusajs/ui";
import { CreateCMSItemForm } from "../../components/create-cms-item-form";
import { sdk } from "../../lib/sdk";

export type CMSItem = {
  id: string;
  name: string;
  title: string | null;
  content: string | null;
  updated_at: Date;
};

const CMSPage = () => {
  const columnHelper = createDataTableColumnHelper<CMSItem>();
  const columns = [
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("title", { header: "Title" }),
    columnHelper.accessor("updated_at", { header: "Updated At" }),
    columnHelper.accessor("id", {
      header: "Details",
      cell: ({ row }) => {
        return <Link to={`/cms/${row.original?.id}`}>View Details</Link>;
      },
    }),
  ];

  const { data, isLoading } = useQuery<{
    cms_items: CMSItem[];
  }>({
    queryKey: ["cms-items"],
    queryFn: () =>
      sdk.client.fetch("/admin/cms", {
        method: "GET",
      }),
  });

  const table = useDataTable({
    columns,
    data: data?.cms_items || [],
    getRowId: (row) => row.id,
    rowCount: data?.cms_items?.length || 0,
    isLoading,
  });

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between p-4">
        <Heading level="h2">CMS Items</Heading>
        <CreateCMSItemForm />
      </div>
      <DataTable instance={table}>
        <DataTable.Table />
      </DataTable>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "CMS",
  icon: PenPlus,
});

export default CMSPage;
