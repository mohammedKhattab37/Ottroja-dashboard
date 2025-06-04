import { Pencil, Trash } from "@medusajs/icons";
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
  const [modalProduct, setModalProduct] = useState<Translation | undefined>(
    undefined
  );

  const columnHelper = createDataTableColumnHelper<Translation>();
  const columns = [
    columnHelper.accessor("language_code", { header: "Language" }),
    columnHelper.accessor("title", { header: "Title" }),
    columnHelper.accessor("sub_title", { header: "Subtitle" }),
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
                    onClick: () => {
                      setOpenModal(true);
                      setModalProduct(row.original);
                    },
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
      {modalProduct && (
        <UpdateProjectTranslationForm
          isOpen={openModal}
          onOpenChange={setOpenModal}
          initialTranslation={modalProduct}
          refetch={refetch}
        />
      )}
      <DataTable.Table />
    </DataTable>
  );
};

export default ProductTranslationDataTable;
