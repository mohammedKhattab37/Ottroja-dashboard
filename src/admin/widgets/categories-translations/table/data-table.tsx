import { Pencil, Trash } from "@medusajs/icons";
import {
  createDataTableColumnHelper,
  DataTable,
  toast,
  useDataTable,
} from "@medusajs/ui";
import { sdk } from "../../../lib/sdk";
import { UpdateCategoryTranslationForm } from "../forms/update-cattr-from";
import { ActionMenu } from "../../components/action-menu";
import { useState } from "react";
import { Translation } from "../category-translations-widget";
import { QueryObserverResult } from "@tanstack/react-query";

const CategoryTranslationDataTable = ({
  data,
  refetch,
  isLoading,
}: {
  data: Translation[] | undefined;
  refetch: () => Promise<QueryObserverResult<Translation[], Error>>;
  isLoading: boolean;
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [modalCategory, setModalCategory] = useState<Translation | undefined>(
    undefined
  );

  const columnHelper = createDataTableColumnHelper<Translation>();
  const columns = [
    columnHelper.accessor("language_code", { header: "Language" }),
    columnHelper.accessor("name", { header: "Name" }),
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
                      setModalCategory(row.original);
                    },
                  },
                  {
                    icon: <Trash />,
                    label: "Delete",
                    onClick: () => {
                      sdk.client
                        .fetch(
                          `/admin/category-translations/${row.original.id}`,
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
      {modalCategory && (
        <UpdateCategoryTranslationForm
          isOpen={openModal}
          onOpenChange={setOpenModal}
          initialTranslation={modalCategory}
          refetch={refetch}
        />
      )}
      <DataTable.Table />
    </DataTable>
  );
};

export default CategoryTranslationDataTable;
