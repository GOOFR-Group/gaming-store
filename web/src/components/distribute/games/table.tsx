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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Game } from "@/domain/game";
import { MISSING_VALUE_SYMBOL, TO_BE_ANNOUNCED } from "@/lib/constants";

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
      const releaseDate = getValue<string | undefined>();
      if (!releaseDate) {
        return TO_BE_ANNOUNCED;
      }

      return format(releaseDate, "dd/MM/yyyy");
    },
    meta: {
      name: "Release Date",
    },
  }),
  columnHelper.accessor(GamesColumns.tags, {
    enableSorting: false,
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ getValue }) {
      const tags = getValue();
      if (!tags.length) {
        return MISSING_VALUE_SYMBOL;
      }

      return (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      );
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
        <div className="flex items-center justify-end">
          <Button asChild className="size-8" size="icon" variant="ghost">
            <Link
              params={{ gameId: row.original.id }}
              to="/distribute/games/$gameId"
            >
              <ChevronRight />
            </Link>
          </Button>
        </div>
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
    rowCount: props.total,
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
      <div className="mb-4 flex items-center justify-between gap-2">
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
      />
    </>
  );
}
