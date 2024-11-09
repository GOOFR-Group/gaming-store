import { ReactNode } from "react";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "../ui/button";
import { DataTableViewOptions } from "./view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  children: ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {children}
        {isFiltered && (
          <Button
            className="h-8 px-2 lg:px-3"
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
