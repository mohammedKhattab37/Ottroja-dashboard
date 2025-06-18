import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Pencil, PenPlus, Trash } from "@medusajs/icons";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  createDataTableColumnHelper,
  DataTable,
  Heading,
  toast,
  useDataTable,
  usePrompt,
} from "@medusajs/ui";
import { CreateCMSItemForm } from "../../components/create-cms-item-form";
import { sdk } from "../../lib/sdk";
import { ActionMenu } from "../../widgets/components/action-menu";
import { useState } from "react";
import { UpdateCMSItemForm } from "../../components/update-cms-item-form";
import { CMSItem } from "./[itemId]/page";

const CMSPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalItem, setModalItem] = useState<CMSItem | undefined>(undefined);
  const queryClient = useQueryClient();
  const prompt = usePrompt();

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
    columnHelper.accessor("id", {
      header: "",
      cell: ({ row }) => (
        <div className="text-end">
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    icon: <Pencil />,
                    label: "Edit",
                    onClick: () => {
                      setOpenModal(true);
                      setModalItem(row.original);
                    },
                  },
                  {
                    icon: <Trash />,
                    label: "Delete",
                    onClick: onDelete(row.original.id),
                  },
                ],
              },
            ]}
          />
        </div>
      ),
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

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) =>
      sdk.client.fetch(`/admin/cms/${itemId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-items"] });
      toast.success("Translation Deleted");
    },
  });

  const onDelete = (itemId: string) => async () => {
    const confirmed = await prompt({
      title: "Are you sure?",
      description: "This action will delete the cms item.",
    });
    if (confirmed) {
      deleteMutation.mutate(itemId);
    }
  };

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
        <CreateCMSItemForm
          refetch={() =>
            queryClient.invalidateQueries({ queryKey: ["cms-items"] })
          }
        />
      </div>
      {modalItem && (
        <UpdateCMSItemForm
          isOpen={openModal}
          onOpenChange={setOpenModal}
          initialItemData={modalItem}
          refetch={() =>
            queryClient.invalidateQueries({ queryKey: ["cms-items"] })
          }
        />
      )}
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
