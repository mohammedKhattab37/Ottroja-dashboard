import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight, ExclamationCircle } from "@medusajs/icons";
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
            return row.original.product ? (
                <Link to={`/products/${row.original.product_id}`}>
                    {row.original.product.title}
                </Link>
            ) : (
                <span className="text-ui-fg-muted">Product deleted</span>
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
        queryKey: ["reviews", offset, limit],
        queryFn: () =>
            sdk.client.fetch("/admin/reviews", {
                query: {
                    offset: pagination.pageIndex * pagination.pageSize,
                    limit: pagination.pageSize,
                    order: "-created_at", // Default server-side sorting
                },
            }),
        staleTime: 30000, // Cache for 30 seconds to reduce flashing
        refetchOnWindowFocus: false, // Prevent unnecessary re-fetches
    });

    // Client-side filtering and sorting
    const filteredAndSortedReviews = useMemo(() => {
        if (!data?.reviews) return [];

        // First, filter the reviews
        let filtered = data.reviews.filter((review) => {
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
                    case "product_id":
                        aVal = a.product_id;
                        bVal = b.product_id;
                        break;
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
    }, [data?.reviews, filtering, sorting]);

    // Reset pagination when filtering changes the number of results
    const filteredCount = filteredAndSortedReviews.length;
    const maxPage = Math.max(
        0,
        Math.ceil(filteredCount / pagination.pageSize) - 1
    );

    // Auto-reset pagination if current page is beyond available pages
    useMemo(() => {
        if (pagination.pageIndex > maxPage) {
            setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
            }));
        }
    }, [filteredCount, maxPage, pagination.pageIndex]);

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
                {filteredAndSortedReviews &&
                filteredAndSortedReviews.length > 0 ? (
                    <>
                        <DataTable.Table />
                        <DataTable.Pagination />
                        <DataTable.CommandBar
                            selectedLabel={(count) => `${count} selected`}
                        />
                    </>
                ) : (
                    <div className="flex h-[150px] w-full flex-col items-center justify-center gap-y-4">
                        <ExclamationCircle className="text-ui-fg-subtle" />
                        <div className="text-center">
                            <p className="font-medium txt-compact-small">
                                No reviews
                            </p>
                            <p className="font-normal txt-small text-ui-fg-muted">
                                There are no reviews to show
                            </p>
                        </div>
                    </div>
                )}
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
