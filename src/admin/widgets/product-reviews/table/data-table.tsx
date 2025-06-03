import {
    createDataTableColumnHelper,
    DataTable,
    useDataTable,
    StatusBadge,
    DataTablePaginationState,
} from "@medusajs/ui";
import { useMemo, useState } from "react";

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

interface CustomDataTableProps {
    data: Review[] | undefined;
    isLoading: boolean;
    refetch: () => void;
}

const columnHelper = createDataTableColumnHelper<Review>();

const columns = [
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
        cell: ({ row }) => {
            return new Date(row.original.created_at).toLocaleDateString();
        },
    }),
];

function CustomDataTable({ data, isLoading }: CustomDataTableProps) {
    const [pagination, setPagination] = useState<DataTablePaginationState>({
        pageSize: 10,
        pageIndex: 0,
    });

    const reviews = useMemo(() => data || [], [data]);

    const table = useDataTable({
        columns,
        data: reviews,
        rowCount: reviews.length,
        isLoading,
        pagination: {
            state: pagination,
            onPaginationChange: setPagination,
        },
        getRowId: (row) => row.id,
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
                <DataTable.Table />
                <DataTable.Pagination />
            </DataTable>
        </div>
    );
}

export default CustomDataTable;
