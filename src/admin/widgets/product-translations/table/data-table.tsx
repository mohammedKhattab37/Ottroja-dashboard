import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight, Pencil, Trash } from "@medusajs/icons";
import {
  createDataTableColumnHelper,
  DataTable,
  toast,
  useDataTable,
} from "@medusajs/ui";
import { sdk } from "../../../lib/sdk";
import { UpdateProjectTranslationForm } from "../forms/update-prtr-from";
import { ActionMenu } from "../../components/action-menu";
import { useState } from "react";
import { Translation } from "../product-translations-widget";
import { QueryObserverResult } from "@tanstack/react-query";

const ProductTranslationDataTable = ({
  data,
  refetch,
  isLoading,
}: {
  data: Translation[] | undefined;
  refetch: () => Promise<QueryObserverResult<Translation[], Error>>;
  isLoading: boolean;
}) => {
  const [openModal, setOpenModal] = useState(false);

  const columnHelper = createDataTableColumnHelper<Translation>();
  const columns = [
    columnHelper.accessor("language_code", { header: "Language" }),
    columnHelper.accessor("title", { header: "Title" }),
    columnHelper.accessor("description", { header: "Description" }),
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
                    onClick: () => setOpenModal(true),
                  },
                  {
                    icon: <Trash />,
                    label: "Delete",
                    onClick: () => {
                      sdk.client
                        .fetch(
                          `/admin/product-translations/${row.original.id}`,
                          {
                            method: "DELETE",
                          }
                        )
                        .then(() => {
                          toast.success("Translation Deleted");
                          refetch();
                        })
                        .catch(() => {
                          toast.error("Failed to delete translation");
                        });
                    },
                  },
                ],
              },
            ]}
          />
          <UpdateProjectTranslationForm
            isOpen={openModal}
            onOpenChange={setOpenModal}
            initialTranslation={row.original}
            refetch={refetch}
          />
        </div>
      ),
    }),
  ];

  const table = useDataTable({
    columns,
    data: data || [],
    getRowId: (row) => row.id,
    rowCount: data?.length || 0,
    isLoading,
  });

  return (
    <DataTable instance={table}>
      <DataTable.Table />
    </DataTable>
  );
};

export const config = defineRouteConfig({
  label: "Custom",
  icon: ChatBubbleLeftRight,
});

export default ProductTranslationDataTable;
