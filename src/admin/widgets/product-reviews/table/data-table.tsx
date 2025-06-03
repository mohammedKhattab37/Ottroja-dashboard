import {
    createDataTableColumnHelper,
    DataTable,
    useDataTable,
    StatusBadge,
    DataTablePaginationState,
    createDataTableCommandHelper,
    DataTableRowSelectionState,
    DataTableSortingState,
    toast,
    createDataTableFilterHelper,
    DataTableFilteringState,
} from "@medusajs/ui";
import { useMemo, useState } from "react";
import { sdk } from "../../../lib/sdk";

type Review = {
    id: string;
    title?: string;
    content: string;
    rating: number;
    first_name: string;
    last_name: string;
    product_id: string;
    customer_id?: string;
    status: "pending" | "approved" | "rejected";
    created_at: Date;
    updated_at: Date;
};

interface ReviewDataTableProps {
    data: Review[] | undefined;
    isLoading: boolean;
    refetch: () => void;
}

const columnHelper = createDataTableColumnHelper<Review>();
const filterHelper = createDataTableFilterHelper<Review>();
const commandHelper = createDataTableCommandHelper();

const useCommands = (refetch: () => void) => {
    return [
        commandHelper.command({
            label: "Approve",
            shortcut: "A",
            action: async (selection) => {
                const reviewsToApproveIds = Object.keys(selection);

                sdk.client
                    .fetch("/admin/reviews/status", {
                        method: "POST",
                        body: {
                            ids: reviewsToApproveIds,
                            status: "approved",
                        },
                    })
                    .then(() => {
                        toast.success("Reviews approved");
                        refetch();
                    })
                    .catch(() => {
                        toast.error("Failed to approve reviews");
                    });
            },
        }),
        commandHelper.command({
            label: "Reject",
            shortcut: "R",
            action: async (selection) => {
                const reviewsToRejectIds = Object.keys(selection);

                sdk.client
                    .fetch("/admin/reviews/status", {
                        method: "POST",
                        body: {
                            ids: reviewsToRejectIds,
                            status: "rejected",
                        },
                    })
                    .then(() => {
                        toast.success("Reviews rejected");
                        refetch();
                    })
                    .catch(() => {
                        toast.error("Failed to reject reviews");
                    });
            },
        }),
    ];
};

const filters = [
    filterHelper.accessor("status", {
        type: "select",
        label: "Status",
        options: [
            {
                label: "Pending",
                value: "pending",
            },
            {
                label: "Approved",
                value: "approved",
            },
            {
                label: "Rejected",
                value: "rejected",
            },
        ],
    }),
];

const columns = [
    columnHelper.select(),
    columnHelper.accessor("title", {
        header: "Title",
        cell: ({ row }) => row.original.title || "No title",
    }),
    columnHelper.accessor("content", {
        header: "Content",
        cell: ({ row }) => {
            const content = row.original.content;
            return content.length > 100
                ? `${content.substring(0, 100)}...`
                : content;
        },
    }),
    columnHelper.accessor("rating", {
        header: "Rating",
        enableSorting: true,
        sortLabel: "Rating",
        sortAscLabel: "Low to High",
        sortDescLabel: "High to Low",
        cell: ({ row }) => {
            const rating = row.original.rating;
            return (
                <div className="flex items-center gap-1">
                    <span>{rating}</span>
                    <span className="text-yellow-500">
                        {"★".repeat(rating)}
                    </span>
                </div>
            );
        },
    }),
    columnHelper.accessor("status", {
        header: "Status",
        enableSorting: true,
        sortLabel: "Status",
        sortAscLabel: "A-Z",
        sortDescLabel: "Z-A",
        cell: ({ row }) => {
            const color =
                row.original.status === "approved"
                    ? "green"
                    : row.original.status === "rejected"
                    ? "red"
                    : "grey";
            return (
                <StatusBadge color={color}>
                    {row.original.status.charAt(0).toUpperCase() +
                        row.original.status.slice(1)}
                </StatusBadge>
            );
        },
    }),
    columnHelper.display({
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
            const firstName = row.original.first_name;
            const lastName = row.original.last_name;
            return `${firstName} ${lastName}`.trim() || "Guest";
        },
    }),
    columnHelper.accessor("created_at", {
        header: "Created At",
        enableSorting: true,
        sortLabel: "Created At",
        sortAscLabel: "Oldest First",
        sortDescLabel: "Newest First",
        cell: ({ row }) => {
            return new Date(row.original.created_at).toLocaleDateString();
        },
    }),
];

function ReviewDataTable({ data, isLoading, refetch }: ReviewDataTableProps) {
    const [sorting, setSorting] = useState<DataTableSortingState | null>(null);
    const [filtering, setFiltering] = useState<DataTableFilteringState>({});
    const [rowSelection, setRowSelection] =
        useState<DataTableRowSelectionState>({});
    const [pagination, setPagination] = useState<DataTablePaginationState>({
        pageSize: 10,
        pageIndex: 0,
    });

    const reviews = useMemo(() => data || [], [data]);

    // Client-side filtering and sorting
    const filteredAndSortedReviews = useMemo(() => {
        if (!reviews.length) return [];

        // First, filter the reviews
        let filtered = reviews.filter((review) => {
            return Object.entries(filtering).every(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    return true;
                }

                if (key === "status" && Array.isArray(value)) {
                    return value.includes(review.status);
                }

                return true;
            });
        });

        // Then, apply client-side sorting
        if (sorting) {
            filtered = filtered.slice().sort((a, b) => {
                let aVal: any;
                let bVal: any;

                // Handle different sort fields
                switch (sorting.id) {
                    case "status":
                        aVal = a.status;
                        bVal = b.status;
                        break;
                    case "rating":
                        aVal = a.rating;
                        bVal = b.rating;
                        break;
                    case "created_at":
                        aVal = new Date(a.created_at);
                        bVal = new Date(b.created_at);
                        break;
                    default:
                        // @ts-ignore
                        aVal = a[sorting.id];
                        // @ts-ignore
                        bVal = b[sorting.id];
                }

                // Handle null/undefined values
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return sorting.desc ? 1 : -1;
                if (bVal == null) return sorting.desc ? -1 : 1;

                // Compare values
                if (aVal < bVal) return sorting.desc ? 1 : -1;
                if (aVal > bVal) return sorting.desc ? -1 : 1;
                return 0;
            });
        }

        return filtered;
    }, [reviews, filtering, sorting]);

    const commands = useCommands(refetch);

    const table = useDataTable({
        columns,
        data: filteredAndSortedReviews,
        rowCount: filteredAndSortedReviews.length,
        isLoading,
        pagination: {
            state: pagination,
            onPaginationChange: setPagination,
        },
        sorting: {
            state: sorting,
            onSortingChange: setSorting,
        },
        filtering: {
            state: filtering,
            onFilteringChange: setFiltering,
        },
        filters,
        getRowId: (row) => row.id,
        commands,
        rowSelection: {
            state: rowSelection,
            onRowSelectionChange: setRowSelection,
        },
    });

    if (isLoading) {
        return <div className="p-4 text-center">Loading reviews...</div>;
    }

    if (!reviews.length) {
        return (
            <div className="p-4 text-center text-gray-500">
                No reviews found for this product.
            </div>
        );
    }

    return (
        <div>
            <DataTable instance={table}>
                <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                    <div className="ml-auto flex gap-2">
                        <DataTable.FilterMenu tooltip="Filter" />
                        <DataTable.SortingMenu tooltip="Sort" />
                    </div>
                </DataTable.Toolbar>
                <DataTable.Table />
                <DataTable.Pagination />
                <DataTable.CommandBar
                    selectedLabel={(count) => `${count} selected`}
                />
            </DataTable>
        </div>
    );
}

export default ReviewDataTable;
