import { useState } from "react";

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

import {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/distribute/_layout/games/")({
  component: Component,
});

const data: Game[] = [
  {
    id: 1,
    title: "Epic Adventure",
    genres: ["RPG", "First Person Shooter"],
    releaseDate: "15/05/2023",
  },
  {
    id: 2,
    title: "Space Odyssey",
    genres: ["Sci-Fi"],
    releaseDate: "22/08/2023",
  },
  {
    id: 3,
    title: "Mystic Quest",
    genres: ["Fantasy"],
    releaseDate: "10/11/2023",
  },
];

type Game = {
  id: number;
  title: string;
  genres: string[];
  releaseDate: string;
};

const columns: ColumnDef<Game>[] = [
  {
    accessorKey: "title",
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ row }) {
      return <div className="capitalize">{row.getValue("title")}</div>;
    },
  },
  {
    accessorKey: "releaseDate",
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ row }) {
      return <div>{row.getValue("releaseDate")}</div>;
    },
  },
  {
    accessorKey: "genres",
    header({ column }) {
      return <DataTableColumnHeader column={column} />;
    },
    cell({ row }) {
      const genres: string[] = row.getValue("genres");
      return <div className="capitalize">{genres.join(", ")}</div>;
    },
    filterFn(row, id, value: string) {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell({ row }) {
      return (
        <Button asChild className="size-8" size="icon" variant="ghost">
          <Link href={`/distribute/games/${row.original.id}`}>
            <ChevronRight />
          </Link>
        </Button>
      );
    },
  },
];

function Component() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Games</CardTitle>
        <CardDescription>Manage your game catalog</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <Input
            className="max-w-sm"
            placeholder="Search"
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
          />
          <Button asChild>
            <Link href="/distribute/games/add">Add Game</Link>
          </Button>
        </div>
        <DataTable
          table={table}
          totalRows={data.length}
          toolbar={
            <DataTableFacetedFilter
              column={table.getColumn("genres")}
              options={[
                {
                  label: "RPG",
                  value: "RPG",
                },
                {
                  label: "Sci-Fi",
                  value: "Sci-Fi",
                },
                {
                  label: "Fantasy",
                  value: "Fantasy",
                },
              ]}
            />
          }
        />
      </CardContent>
    </Card>
  );
}
