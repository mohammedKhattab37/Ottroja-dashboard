"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";

import { CustomerModal, DeleteCustomerModal } from "./customer-modal";
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";

interface CustomerWithUser {
  customerId: number;
  userId: string;
  dateOfBirth: Date | null;
  gender: string | null;
  lastLogin: Date | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    emailVerified: boolean;
  };
}

export function CustomersTable({
  data,
  onRefresh,
  pageCount,
}: {
  data: CustomerWithUser[];
  onRefresh?: () => void;
  pageCount: number;
}) {
  const columns = useMemo<ColumnDef<CustomerWithUser>[]>(
    () => [
      {
        accessorKey: "user",
        id: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Customer" />
        ),
        cell: ({ row }) => {
          const customer = row.original;
          const { user } = customer;
          
          return (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground text-sm">
                  {user.email}
                </span>
              </div>
            </div>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const customer = row.original;
          const searchValue = value.toLowerCase();
          return (
            customer.user.name.toLowerCase().includes(searchValue) ||
            customer.user.email.toLowerCase().includes(searchValue)
          );
        },
        meta: {
          label: "Customer",
          variant: "text",
        },
      },
      {
        accessorKey: "gender",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Gender" />
        ),
        cell: ({ row }) => {
          const gender = row.getValue("gender") as string | null;
          
          if (!gender) {
            return <span className="text-muted-foreground">—</span>;
          }
          
          const genderLabels = {
            MALE: "Male",
            FEMALE: "Female", 
            OTHER: "Other",
            PREFER_NOT_TO_SAY: "Prefer not to say",
          };
          
          return (
            <Badge variant="outline">
              {genderLabels[gender as keyof typeof genderLabels] || gender}
            </Badge>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const gender = row.getValue("gender") as string | null;
          return value.includes(gender || "");
        },
        meta: {
          label: "Gender",
          variant: "select",
          options: [
            { label: "Male", value: "MALE" },
            { label: "Female", value: "FEMALE" },
            { label: "Other", value: "OTHER" },
            { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
          ],
        },
      },
      {
        accessorKey: "totalOrders",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Orders" />
        ),
        cell: ({ row }) => {
          const totalOrders = row.getValue("totalOrders") as number;
          return <span className="font-medium">{totalOrders}</span>;
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const totalOrders = row.getValue("totalOrders") as number;
          if (Array.isArray(value) && value.length === 2) {
            const [min, max] = value;
            return totalOrders >= min && totalOrders <= max;
          }
          return true;
        },
        meta: {
          label: "Total Orders",
          variant: "range",
        },
      },
      {
        accessorKey: "totalSpent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Spent" />
        ),
        cell: ({ row }) => {
          const totalSpent = row.getValue("totalSpent") as number;
          return (
            <span className="font-medium">
              ${totalSpent.toFixed(2)}
            </span>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const totalSpent = row.getValue("totalSpent") as number;
          if (Array.isArray(value) && value.length === 2) {
            const [min, max] = value;
            return totalSpent >= min && totalSpent <= max;
          }
          return true;
        },
        meta: {
          label: "Total Spent",
          variant: "range",
        },
      },
      {
        accessorKey: "lastLogin",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last Login" />
        ),
        cell: ({ row }) => {
          const lastLogin = row.getValue("lastLogin") as Date | null;
          
          if (!lastLogin) {
            return <span className="text-muted-foreground">Never</span>;
          }
          
          return <span>{format(new Date(lastLogin), "MMM dd, yyyy")}</span>;
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const lastLogin = row.getValue("lastLogin") as Date | null;
          if (!lastLogin) return false;
          
          const date = new Date(lastLogin);
          if (Array.isArray(value) && value.length === 2) {
            const [start, end] = value.map((v) => new Date(v));
            return date >= start && date <= end;
          }
          return true;
        },
        meta: {
          label: "Last Login",
          variant: "date",
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joined" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt") as string);
          return <span>{format(date, "MMM dd, yyyy")}</span>;
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const date = new Date(row.getValue("createdAt") as string);
          if (Array.isArray(value) && value.length === 2) {
            const [start, end] = value.map((v) => new Date(v));
            return date >= start && date <= end;
          }
          return true;
        },
        meta: {
          label: "Joined Date",
          variant: "date",
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const customer = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(customer.customerId.toString())}
                >
                  Copy customer ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(customer.user.email)}
                >
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <CustomerModal
                  mode="edit"
                  customer={customer}
                  onSuccess={onRefresh}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                <DeleteCustomerModal
                  customer={customer}
                  onSuccess={onRefresh}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onRefresh]
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: true,
  });

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <DataTableFilterMenu table={table} />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
  );
}