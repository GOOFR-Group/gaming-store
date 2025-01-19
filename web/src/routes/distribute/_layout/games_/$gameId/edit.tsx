import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { GameForm } from "@/components/distribute/games/form/form";
import { Error } from "@/components/error";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublisherGame } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { BadRequest, NotFound } from "@/lib/errors";
import { distributeGameQueryKey } from "@/lib/query-keys";
import { applyTax } from "@/lib/utils";

/**
 * Query options for retrieving a game of the signed in publisher.
 * @param gameId Game ID.
 * @returns Query options.
 */
function publisherGameQueryOptions(gameId: string) {
  const token = getToken();
  const payload = decodeTokenPayload(token);
  const publisherId = payload.sub;

  return queryOptions({
    queryKey: distributeGameQueryKey(gameId, publisherId),
    async queryFn() {
      return await getPublisherGame(publisherId, gameId);
    },
  });
}

export const Route = createFileRoute("/distribute/_layout/games/$gameId/edit")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(
      publisherGameQueryOptions(opts.params.gameId),
    );
  },
  errorComponent(errorProps) {
    // If the game ID is not a valid UUID, a BadRequest is thrown.
    // This error is visually identical to a NotFound error.
    if (
      errorProps.error instanceof BadRequest ||
      errorProps.error instanceof NotFound
    ) {
      return (
        <Error
          showBack
          description="The game you are looking for does not exist."
          title="Game Not Found"
        />
      );
    }
  },
});

function Component() {
  const params = Route.useParams();
  const query = useSuspenseQuery(publisherGameQueryOptions(params.gameId));
  const navigate = useNavigate();

  const game = query.data;

  return (
    <Card className="flex flex-col min-h-full">
      <CardHeader>
        <CardTitle>{game.title}</CardTitle>
        <CardDescription>Edit a game in your game catalog</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <GameForm
          gameId={game.id}
          mode="edit"
          defaultValues={{
            description: game.description,
            ageRating: game.ageRating,
            features: game.features,
            tags: game.tags,
            languages: game.languages,
            price: Math.round(applyTax(game.price) * 100) / 100,
            releaseDate:
              "releaseDate" in game ? new Date(game.releaseDate) : undefined,
            title: game.title,
            requirements: game.requirements,
            isActive: game.isActive,
            downloadMultimedia: game.downloadMultimedia,
            previewMultimedia: game.previewMultimedia,
            multimedia: game.multimedia,
          }}
          onSave={() =>
            navigate({
              to: "/distribute/games/$gameId",
              params: {
                gameId: params.gameId,
              },
            })
          }
        />
      </CardContent>
    </Card>
  );
}
