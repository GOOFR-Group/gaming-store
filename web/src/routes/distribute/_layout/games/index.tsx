import { useEffect, useState } from "react";

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

import { GamesColumns } from "@/components/distribute/games/columns";
import { GamesTable } from "@/components/distribute/games/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GamesFilters } from "@/domain/game";
import { useToast } from "@/hooks/use-toast";
import { getPublisherGames } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { TOAST_MESSAGES } from "@/lib/constants";
import { TokenMissing, Unauthorized } from "@/lib/errors";
import { gamesQueryKey } from "@/lib/query-keys";

/**
 * Query options for retrieving the games of the signed in publisher.
 * @param [columnFilters=[]] Filters.
 * @param [pagination={ pageIndex: 0, pageSize: 10 }] Pagination.
 * @param [sorting=[]] Sorting.
 * @returns Query options.
 */
function publisherGamesQueryOptions(
  columnFilters: ColumnFiltersState = [],
  pagination: PaginationState = { pageIndex: 0, pageSize: 10 },
  sorting: SortingState = [],
) {
  // Considers a single-column sort, since sorting by multiple columns at once
  // is not supported.
  const sort = sorting[0];
  const titleFilter = columnFilters.find(
    (filter) => filter.id === GamesColumns.title,
  );
  const genresFilter = columnFilters.find(
    (filter) => filter.id === GamesColumns.genres,
  );
  const filters: GamesFilters = {
    limit: pagination.pageSize,
    offset: pagination.pageSize * pagination.pageIndex,
    sort: sort?.id,
    order: sort ? (sort.desc ? "desc" : "asc") : undefined,
    title: titleFilter?.value as string,
    genres: genresFilter?.value as number[],
  };

  return queryOptions({
    queryKey: gamesQueryKey(filters),
    placeholderData: keepPreviousData,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);
      const publisherId = payload.sub;

      const games = await getPublisherGames(publisherId, filters);

      return games;
    },
  });
}

export const Route = createFileRoute("/distribute/_layout/games/")({
  component: Component,
  onError(error) {
    if (error instanceof TokenMissing || error instanceof Unauthorized) {
      redirect({
        to: "/distribute/signin",
        replace: true,
        throw: true,
      });
    }
  },
});

function Component() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const { toast } = useToast();
  const query = useQuery(
    publisherGamesQueryOptions(columnFilters, pagination, sorting),
  );

  const totalGames = query.data?.total ?? 0;
  const games = query.data?.games ?? [];

  useEffect(() => {
    if (query.isError) {
      toast(TOAST_MESSAGES.unexpectedError);
    }
  }, [query.isError, toast]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Games</CardTitle>
        <CardDescription>Manage your game catalog</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <GamesTable
          columnFilters={columnFilters}
          games={games}
          loading={query.isLoading}
          pagination={pagination}
          sorting={sorting}
          total={totalGames}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
        >
          <Button asChild>
            <Link to="/distribute/games/add">Add Game</Link>
          </Button>
        </GamesTable>
      </CardContent>
    </Card>
  );
}
