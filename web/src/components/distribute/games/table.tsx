import { ReactNode, useState } from "react";

import { Link } from "@tanstack/react-router";
import {
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Game } from "@/domain/game";
import { MISSING_VALUE_SYMBOL } from "@/lib/constants";

import { GamesColumns } from "./columns";
import { Search } from "./search";
import { GamesToolbar } from "./toolbar";

const columnHelper = createColumnHelper<Game>();
const columns = [
  columnHelper.accessor(GamesColumns.title, {
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ getValue }) {
      return getValue();
    },
    meta: {
      name: "Title",
    },
  }),
  columnHelper.accessor(GamesColumns.releaseDate, {
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ getValue }) {
      return format(getValue(), "dd/MM/yyyy");
    },
    meta: {
      name: "Release Date",
    },
  }),
  columnHelper.accessor(GamesColumns.genres, {
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ getValue }) {
      const tags = getValue();
      if (!tags.length) {
        return MISSING_VALUE_SYMBOL;
      }

      return tags.map((tag) => tag.name).join(", ");
    },
    meta: {
      name: "Genres",
    },
  }),
  columnHelper.display({
    id: "actions",
    enableHiding: false,
    cell({ row }) {
      return (
        <Button asChild className="size-8" size="icon" variant="ghost">
          <Link
            params={{ gameId: row.original.id }}
            to="/distribute/games/$gameId"
          >
            <ChevronRight />
          </Link>
        </Button>
      );
    },
  }),
];

export function GamesTable(props: {
  children: ReactNode;
  games: Game[];
  total: number;
  loading: boolean;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  pagination: PaginationState;
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onPaginationChange: OnChangeFn<PaginationState>;
}) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: props.games,
    columns,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: props.onColumnFiltersChange,
    onPaginationChange: props.onPaginationChange,
    onSortingChange: props.onSortingChange,
    state: {
      columnVisibility,
      columnFilters: props.columnFilters,
      pagination: props.pagination,
      sorting: props.sorting,
    },
  });

  const titleColumn = table.getColumn(GamesColumns.title);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Search
          value={(titleColumn?.getFilterValue() as string) ?? ""}
          onChange={(value) => titleColumn?.setFilterValue(value)}
        />
        {props.children}
      </div>
      <DataTable
        loading={props.loading}
        table={table}
        toolbar={<GamesToolbar table={table} />}
        totalRows={props.total}
      />
    </>
  );
}
