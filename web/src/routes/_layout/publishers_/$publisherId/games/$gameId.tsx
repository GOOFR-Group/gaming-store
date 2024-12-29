import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { Carousel } from "@/components/carousel";
import { Game } from "@/components/game";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Game as GameDomain, PaginatedGames } from "@/domain/game";
import { User } from "@/domain/user";
import { useToast } from "@/hooks/use-toast";
import {
  createUserCartGame,
  getGames,
  getPublisherGame,
  getUser,
  getUserCartGames,
  getUserGameLibrary,
} from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { TAX, TO_BE_ANNOUNCED, TOAST_MESSAGES } from "@/lib/constants";
import { withAuthErrors } from "@/lib/middleware";
import { gameQueryKey } from "@/lib/query-keys";
import { formatCurrency, getLanguageName } from "@/lib/utils";

type UserData =
  | {
      user: User;
      library: PaginatedGames;
      cart: PaginatedGames;
    }
  | undefined;

/**
 * Query options for retrieving the signed in user.
 * @returns Query options.
 */
function gameQueryOptions(gameId: string, publisherId: string) {
  return queryOptions({
    queryKey: gameQueryKey(gameId, publisherId),
    async queryFn() {
      const game = await getPublisherGame(publisherId, gameId);

      const relatedGames = (
        await getGames({
          tagIds: game.tags.map((x) => x.id),
          limit: 6,
        })
      ).games.filter((game) => game.id != game.id);

      let userData: UserData = undefined;
      try {
        const token = getToken();
        const payload = decodeTokenPayload(token);

        const userId = payload.sub;

        const user = await getUser(userId);
        const library = await getUserGameLibrary(userId);
        const cart = await getUserCartGames(userId);

        userData = {
          user,
          library,
          cart,
        };
      } catch {
        // Ignore error.
      }

      return {
        userData,
        game,
        relatedGames,
      };
    },
  });
}

export const Route = createFileRoute(
  "/_layout/publishers/$publisherId/games/$gameId",
)({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(
      gameQueryOptions(opts.params.gameId, opts.params.publisherId),
    );
  },
});

function Component() {
  const params = Route.useParams();
  const {
    data: { userData, game, relatedGames },
  } = useSuspenseQuery(gameQueryOptions(params.gameId, params.publisherId));

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">{game.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="aspect-video w-full max-h-[512px]">
              <Carousel game={game} />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">About the Game</h2>
              <p>{game.description}</p>

              <div className="flex flex-wrap items-start justify-between mt-4">
                <div className="flex gap-2 flex-wrap">
                  {game.tags.map((tag) => {
                    return (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    );
                  })}
                </div>

                <img
                  alt="Age rating"
                  className="h-12"
                  src="/images/pegi/18.png"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">
                System Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                    Minimum
                  </h3>
                  <ul className="list-disc list-inside">
                    {game.requirements.minimum.split("\n").map((item, idx) => {
                      return <li key={idx}>{item}</li>;
                    })}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                    Recommended
                  </h3>
                  <ul className="list-disc list-inside">
                    {game.requirements.recommended
                      .split("\n")
                      .map((item, idx) => {
                        return <li key={idx}>{item}</li>;
                      })}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-3xl font-bold">
                  {formatCurrency(game.price, TAX)}
                </span>
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground ml-1">(2,945)</span>
                </div>
              </div>

              <GameActions
                gameId={game.id}
                publisherId={game.publisher.id}
                userData={userData}
              />
              <p className="text-muted-foreground mt-2 text-center">
                Release Date:{" "}
                {"releaseDate" in game
                  ? format(game.releaseDate, "dd/MM/yyyy")
                  : TO_BE_ANNOUNCED}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                Developed by
              </h3>
              <p>{game.publisher.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                Game Features
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {game.features.split("\n").map((item, idx) => {
                  return <li key={idx}>{item}</li>;
                })}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                Languages Supported
              </h3>
              <p>
                {game.languages.map(getLanguageName).filter(Boolean).join(", ")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <RelatedGames games={relatedGames} />
    </div>
  );
}

function RelatedGames(props: { games: GameDomain[] }) {
  if (!props.games.length) {
    return;
  }

  return (
    <section className="py-12 md:py-24 lg:py-32 px-4 md:px-6">
      <h2 className="text-3xl font-bold tracking-tighter mb-8">
        More Like This
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {props.games.map((game) => {
          return (
            <Link
              key={game.id}
              to="/publishers/$publisherId/games/$gameId"
              params={{
                publisherId: game.publisher.id,
                gameId: game.id,
              }}
            >
              <Game
                key={game.id}
                image={game.previewMultimedia.url}
                price={game.price}
                publisher={game.publisher.name}
                title={game.title}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function GameActions(props: {
  publisherId: string;
  gameId: string;
  userData: UserData;
}) {
  const { toast } = useToast();
  const mutation = useMutation({
    async mutationFn(gameId: string) {
      const token = getToken();
      const payload = decodeTokenPayload(token);
      const userId = payload.sub;

      await createUserCartGame(userId, gameId);
    },
    onSuccess() {
      toast({
        title: "Game added to cart",
      });
    },
    onError: withAuthErrors(() => {
      toast(TOAST_MESSAGES.unexpectedError);
    }),
  });

  /**
   * Handles on click event on add to cart.
   */
  function handleClick() {
    mutation.mutate(props.gameId);
  }

  if (props.userData?.library.games.find((game) => game.id === props.gameId)) {
    return (
      <Tooltip>
        <TooltipTrigger className="w-full">
          <Button
            asChild
            disabled
            className="w-full text-lg py-6 mt-2"
            variant="secondary"
          >
            <span>
              <Heart />
              Add to Wishlist
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          This feature is under construction
        </TooltipContent>
      </Tooltip>
    );
  }

  if (props.userData?.cart.games.find((game) => game.id === props.gameId)) {
    return (
      <Button
        asChild
        className="w-full text-lg py-6 mt-2 bg-white text-black"
        variant="outline"
      >
        <Link to="/cart">
          <ShoppingCart />
          In Cart
        </Link>
      </Button>
    );
  }

  return (
    <Button className="w-full text-lg py-6" onClick={handleClick}>
      <ShoppingCart className="mr-2" />
      Add to Cart
    </Button>
  );
}
