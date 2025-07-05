"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import { User } from "@/generated/prisma";
import { UserModal, DeleteUserModal } from "./user-modal";
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";

export function UsersTable({
  data,
  onRefresh,
  pageCount,
}: {
  data: User[];
  onRefresh?: () => void;
  pageCount: number;
}) {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground text-sm">
                {user.email}
              </span>
            </div>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const user = row.original;
          const searchValue = value.toLowerCase();
          return (
            user.name.toLowerCase().includes(searchValue) ||
            user.email.toLowerCase().includes(searchValue)
          );
        },
        meta: {
          label: "Name",
          variant: "text",
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
          const email = row.getValue("email") as string;
          return <span className="text-muted-foreground">{email}</span>;
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const email = row.getValue("email") as string;
          return email.toLowerCase().includes(value.toLowerCase());
        },
        meta: {
          label: "Email",
          variant: "text",
        },
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          const roleColors = {
            ADMIN: "default",
            DESIGNER: "secondary",
            MARKETER: "outline",
            CUSTOMER: "destructive",
          } as const;
          
          return (
            <Badge variant={roleColors[role as keyof typeof roleColors] || "default"}>
              {role}
            </Badge>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const role = row.getValue("role") as string;
          return value.includes(role);
        },
        meta: {
          label: "Role",
          variant: "select",
          options: [
            { label: "Admin", value: "ADMIN" },
            { label: "Designer", value: "DESIGNER" },
            { label: "Marketer", value: "MARKETER" },
            { label: "Customer", value: "CUSTOMER" },
          ],
        },
      },
      {
        accessorKey: "emailVerified",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email Verified" />
        ),
        cell: ({ row }) => {
          const emailVerified = row.getValue("emailVerified") as boolean;
          return (
            <Badge variant={emailVerified ? "default" : "secondary"}>
              {emailVerified ? "Verified" : "Unverified"}
            </Badge>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const emailVerified = row.getValue("emailVerified") as boolean;
          return value.includes(String(emailVerified));
        },
        meta: {
          label: "Email Verified",
          variant: "select",
          options: [
            { label: "Verified", value: "true" },
            { label: "Unverified", value: "false" },
          ],
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created At" />
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
          label: "Created At",
          variant: "date",
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;

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
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  Copy user ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <UserModal
                  mode="edit"
                  user={user}
                  onSuccess={onRefresh}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                <DeleteUserModal
                  user={user}
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