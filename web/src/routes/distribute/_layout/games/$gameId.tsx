import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { Download, Edit } from "lucide-react";

import { ErrorPage } from "@/components/distribute/error";
import { GamePreview } from "@/components/distribute/games/game-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPublisherGame } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { MISSING_VALUE_SYMBOL } from "@/lib/constants";
import { BadRequest, NotFound } from "@/lib/errors";
import { gameQueryKey } from "@/lib/query-keys";
import { formatCurrency, getLanguageName } from "@/lib/utils";

/**
 * Query options for retrieving a game of the signed in publisher.
 * @param gameId Game ID.
 * @returns Query options.
 */
function publisherGameQueryOptions(gameId: string) {
  return queryOptions({
    queryKey: gameQueryKey(gameId),
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);
      const publisherId = payload.sub;

      const game = await getPublisherGame(publisherId, gameId);

      return game;
    },
  });
}

export const Route = createFileRoute("/distribute/_layout/games/$gameId")({
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
        <ErrorPage
          showBack
          description="The game you are looking for does not exist."
          title="Game Not Found"
        />
      );
    }
  },
});

function Component() {
  const params = useParams({ from: "/distribute/_layout/games/$gameId" });
  const query = useSuspenseQuery(publisherGameQueryOptions(params.gameId));

  const game = query.data;
  const languages = game.languages.map(getLanguageName).filter(Boolean);

  return (
    <Card className="flex flex-col min-h-full">
      <CardHeader className="flex flex-wrap flex-row gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <CardTitle>{game.title}</CardTitle>
            <Badge
              className="w-fit"
              variant={game.isActive ? "default" : "destructive"}
            >
              {game.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardDescription>{game.publisher.name}</CardDescription>
        </div>
        <div className="flex-1 flex gap-2 first:*:ml-auto">
          {"downloadMultimedia" in game ? (
            <Button asChild variant="secondary">
              <a download href={game.downloadMultimedia.url}>
                <Download />
              </a>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger className="size-fit">
                <Button asChild disabled variant="secondary">
                  <span>
                    <Download />
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload game files to enable downloading</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Button asChild>
            <Link params={params} to="/distribute/games/$gameId/edit">
              <Edit />
              Edit
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1">Price</h3>
            <p>{formatCurrency(game.price)}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Release Date</h3>
            <p>
              {"releaseDate" in game
                ? format(game.releaseDate, "dd/MM/yyyy")
                : "To be announced"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Age Rating</h3>
            <p>{game.ageRating}+</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Preview</h3>
            <GamePreview
              previewMultimediaUrl={game.previewMultimedia.url}
              price={game.price}
              publisherName={game.publisher.name}
              title={game.title}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {game.tags.length
                ? game.tags.map((tag) => {
                    return (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    );
                  })
                : MISSING_VALUE_SYMBOL}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Languages Supported</h3>
            <div className="flex flex-wrap gap-2">
              {languages.length
                ? languages.map((language) => {
                    return (
                      <Badge key={language} variant="secondary">
                        {language}
                      </Badge>
                    );
                  })
                : MISSING_VALUE_SYMBOL}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">About the Game</h3>
          <p>{game.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Game Features</h3>
          <p className="whitespace-pre-wrap">{game.features}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">System Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Minimum</h4>
              <p className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
                {game.requirements.minimum}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Recommended</h4>
              <p className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
                {game.requirements.recommended}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Screenshots</h3>
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(0,32rem))] justify-center gap-4">
            {game.multimedia.map((multimedia, index) => (
              <img
                key={multimedia.id}
                alt={`Screenshot ${index + 1}`}
                className="w-full object-cover aspect-video rounded-md"
                src={multimedia.url}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
