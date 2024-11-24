import { ReactNode, useState } from "react";

import { Link } from "@tanstack/react-router";
import {
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Game } from "@/domain/game";
import { LANGUAGES_MAP, MISSING_VALUE_SYMBOL } from "@/lib/constants";

import { GamesToolbar } from "./toolbar";

const columnHelper = createColumnHelper<Game>();
const columns = [
  columnHelper.accessor("title", {
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ getValue }) {
      return <div className="capitalize">{getValue()}</div>;
    },
    meta: {
      name: "Title",
    },
  }),
  columnHelper.accessor("releaseDate", {
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ getValue }) {
      return <div>{format(getValue(), "dd/MM/yyyy")}</div>;
    },
    meta: {
      name: "Release Date",
    },
  }),
  columnHelper.accessor("languages", {
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ getValue }) {
      const languages = getValue();
      if (!languages.length) {
        return MISSING_VALUE_SYMBOL;
      }

      return (
        <div>
          {languages
            .filter((language) => language in LANGUAGES_MAP)
            .map(
              (language) =>
                LANGUAGES_MAP[language as keyof typeof LANGUAGES_MAP].name,
            )
            .join(", ")}
        </div>
      );
    },
    meta: {
      name: "Languages",
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
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: props.games,
    columns,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Input
          className="max-w-sm"
          placeholder="Search"
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
        />
        {props.children}
      </div>
      <DataTable
        table={table}
        toolbar={<GamesToolbar table={table} />}
        totalRows={props.total}
      />
    </>
  );
}
