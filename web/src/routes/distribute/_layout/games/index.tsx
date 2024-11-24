import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { GamesTable } from "@/components/distribute/games/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublisherGames } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { gamesQueryKey } from "@/lib/query-keys";

/**
 * Query options for retrieving the games of the signed in publisher.
 * @returns Query options.
 */
function publisherGamesQueryOptions() {
  return queryOptions({
    queryKey: gamesQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const publisherId = payload.sub;
      const games = await getPublisherGames(publisherId);

      return games;
    },
  });
}

export const Route = createFileRoute("/distribute/_layout/games/")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(
      publisherGamesQueryOptions(),
    );
  },
});

function Component() {
  const query = useSuspenseQuery(publisherGamesQueryOptions());
  const paginatedGames = query.data;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Games</CardTitle>
        <CardDescription>Manage your game catalog</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <GamesTable games={paginatedGames.games} total={paginatedGames.total}>
          <Button asChild>
            <Link to="/distribute/games/add">Add Game</Link>
          </Button>
        </GamesTable>
      </CardContent>
    </Card>
  );
}
