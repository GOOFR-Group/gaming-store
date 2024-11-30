import { ReactNode } from "react";

import { flexRender, type Table as TableDef } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./toolbar";

interface DataTableProps<TData> {
  table: TableDef<TData>;
  toolbar?: ReactNode;
  totalRows: number;
  loading?: boolean;
}

export function DataTable<TData>({
  table,
  toolbar,
  totalRows,
  loading,
}: DataTableProps<TData>) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <DataTableToolbar table={table}>{toolbar}</DataTableToolbar>
      <div className="rounded-md border flex-1">
        <Table className={loading ? "overflow-hidden" : ""}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className={
              loading
                ? "relative before:content-[''] before:top-0 before:left-0 before:absolute before:w-full before:h-[1px] before:bg-primary before:animate-progress before:origin-left-right"
                : ""
            }
          >
            {table.getRowModel().rows?.length
              ? table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : !loading && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      className="h-24 text-center"
                      colSpan={table.getVisibleFlatColumns().length}
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} total={totalRows} />
    </div>
  );
}
