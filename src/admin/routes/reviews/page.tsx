import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
import {
    createDataTableCommandHelper,
    DataTableRowSelectionState,
    DataTableSortingState,
    toast,
    createDataTableFilterHelper,
    DataTableFilteringState,
} from "@medusajs/ui";
import {
    createDataTableColumnHelper,
    Container,
    DataTable,
    useDataTable,
    Heading,
    StatusBadge,
    Toaster,
    DataTablePaginationState,
} from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { sdk } from "../../lib/sdk";
import { HttpTypes } from "@medusajs/framework/types";
import { Link } from "react-router-dom";

type Review = {
    id: string;
    title?: string;
    content: string;
    rating: number;
    product_id: string;
    customer_id?: string;
    status: "pending" | "approved" | "rejected";
    created_at: Date;
    updated_at: Date;
    product?: HttpTypes.AdminProduct;
    customer?: HttpTypes.AdminCustomer;
};

const columnHelper = createDataTableColumnHelper<Review>();
const filterHelper = createDataTableFilterHelper<Review>();

const columns = [
    columnHelper.select(),
    columnHelper.accessor("id", {
        header: "ID",
    }),
    columnHelper.accessor("title", {
        header: "Title",
    }),
    columnHelper.accessor("rating", {
        header: "Rating",
        enableSorting: true,
        sortLabel: "Rating",
        sortAscLabel: "Low to High",
        sortDescLabel: "High to Low",
    }),
    columnHelper.accessor("content", {
        header: "Content",
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
    columnHelper.accessor("product", {
        header: "Product",
        enableSorting: true,
        sortLabel: "Product",
        sortAscLabel: "A-Z",
        sortDescLabel: "Z-A",
        id: "product_id",
        cell: ({ row }) => {
            return (
                <Link to={`/products/${row.original.product_id}`}>
                    {row.original.product?.title}
                </Link>
            );
        },
    }),
];
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

const limit = 15;

const ReviewsPage = () => {
    const [sorting, setSorting] = useState<DataTableSortingState | null>(null);
    const [filtering, setFiltering] = useState<DataTableFilteringState>({});

    const [rowSelection, setRowSelection] =
        useState<DataTableRowSelectionState>({});
    const [pagination, setPagination] = useState<DataTablePaginationState>({
        pageSize: limit,
        pageIndex: 0,
    });

    const offset = useMemo(() => {
        return pagination.pageIndex * limit;
    }, [pagination]);

    const { data, isLoading, refetch } = useQuery<{
        reviews: Review[];
        count: number;
        limit: number;
        offset: number;
    }>({
        queryKey: ["reviews", offset, limit, sorting?.id, sorting?.desc],
        queryFn: () =>
            sdk.client.fetch("/admin/reviews", {
                query: {
                    offset: pagination.pageIndex * pagination.pageSize,
                    limit: pagination.pageSize,
                    order: sorting
                        ? `${sorting.desc ? "-" : ""}${sorting.id}`
                        : "-created_at",
                },
            }),
    });

    // Client-side filtering for status
    const filteredReviews = useMemo(() => {
        if (!data?.reviews) return [];

        return data.reviews.filter((review) => {
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
    }, [data?.reviews, filtering]);

    const commands = useCommands(refetch);

    const table = useDataTable({
        columns,
        data: filteredReviews,
        rowCount: filteredReviews.length,
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

    return (
        <Container>
            <DataTable instance={table}>
                <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                    <Heading>Reviews</Heading>
                    <div className="flex gap-2">
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
            <Toaster />
        </Container>
    );
};

export const config = defineRouteConfig({
    label: "Reviews",
    icon: ChatBubbleLeftRight,
});

export default ReviewsPage;
