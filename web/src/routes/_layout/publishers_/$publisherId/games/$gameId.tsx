import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { Carousel } from "@/components/carousel";
import { Game } from "@/components/game";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Game as GameDomain } from "@/domain/game";
import { useToast } from "@/hooks/use-toast";
import {
  createUserCartGame,
  getGames,
  getPublisherGame,
  getUser,
  getUserCartGames,
  getUserGames,
} from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { TokenMissing } from "@/lib/errors";
import { gameQueryKey, userNavbarQueryKey } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";

/**
 * Query options for retrieving the signed in user.
 * @returns Query options.
 */
function gameQueryOptions(gameId: string, publisherId: string) {
  return queryOptions({
    queryKey: gameQueryKey(gameId, publisherId),
    async queryFn() {
      const gameData = await getPublisherGame(publisherId, gameId);

      const relatedGames = (
        await getGames({
          tagIds: gameData.tags.map((x) => x.id),
          limit: 6,
        })
      ).games.filter((game) => game.id != gameData.id);

      try {
        const token = getToken();
        const payload = decodeTokenPayload(token);

        const userId = payload.sub;

        const userData = await getUser(userId);
        const userGames = await getUserGames(userId);
        const cartGames = await getUserCartGames(userId);

        return { userData, userGames, cartGames, gameData, relatedGames };
      } catch {
        return {
          userData: null,
          userGames: null,
          cartGames: null,
          gameData,
          relatedGames,
        };
      }
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

const getLanguage = (code: string) => {
  const lang = new Intl.DisplayNames(["en"], { type: "language" });
  return lang.of(code);
};

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
              to={`/publishers/${game.publisher.id}/games/${game.id}`}
            >
              <Game
                key={game.id}
                image={game.previewMultimedia.url}
                price={game.price}
                publisher={game.publisher.name}
                tags={game.tags.map((x) => x.name)}
                title={game.title}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function AddToCart({
  gameId,
  userId,
  publisherId,
}: {
  gameId: string;
  userId?: string;
  publisherId: string;
}) {
  /**
   * Adds a game to the cart.
   */

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    async mutationFn() {
      await createUserCartGame(userId!, gameId);
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: gameQueryKey(gameId, publisherId),
      });
      await queryClient.invalidateQueries({ queryKey: userNavbarQueryKey });
      toast({
        variant: "success",
        title: "Game Added!",
        description: "The game was successfully added to your cart.",
      });
    },
    onError(error) {
      if (error instanceof TokenMissing) {
        toast({
          variant: "destructive",
          title: "Log in to perform this action",
        });
        return;
      }

      toast({
        variant: "destructive",
        title: "Oops! An unexpected error occurred",
        description: "Please try again later or contact the support team.",
      });
    },
  });

  function handleClick() {
    mutation.mutate();
  }

  return (
    <Button className="w-full text-lg py-6" onClick={handleClick}>
      <ShoppingCart className="mr-2" />
      Add to Cart
    </Button>
  );
}

function Component() {
  const params = Route.useParams();

  const {
    data: { userData, userGames, cartGames, gameData, relatedGames },
  } = useSuspenseQuery(gameQueryOptions(params.gameId, params.publisherId));

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">{gameData.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="aspect-video w-full max-h-[512px]">
              <Carousel game={gameData} />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">About the Game</h2>
              <p>{gameData.description}</p>

              <div className="flex flex-wrap items-start justify-between mt-4">
                <div className="flex gap-2 flex-wrap">
                  {gameData.tags.map((item, idx) => {
                    return (
                      <Badge key={idx} variant="secondary">
                        {item.name.toUpperCase()}
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
                    {gameData.requirements.minimum
                      .split("\n")
                      .map((item, idx) => {
                        return <li key={idx}>{item}</li>;
                      })}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                    Recommended
                  </h3>
                  <ul className="list-disc list-inside">
                    {gameData.requirements.recommended
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
                  {formatCurrency(gameData.price)}
                </span>
                <div className="flex items-center p-2 relative">
                  <Star className="text-yellow-400 fill-yellow-400 mr-1 opacity-65" />
                  <span className="font-semibold opacity-65">4.8</span>
                  <span className="text-muted-foreground ml-1">(2,945)</span>
                </div>
              </div>
              {userGames?.games.find((game) => game.id === gameData.id) ? (
                <Link to="/account">
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
                </Link>
              ) : cartGames?.games.find((game) => game.id === gameData.id) ? (
                <Link to="/cart">
                  <Button
                    className="w-full text-lg py-6 mt-2 bg-white text-black"
                    variant="outline"
                  >
                    <ShoppingCart />
                    In Cart
                  </Button>
                </Link>
              ) : (
                <AddToCart
                  gameId={gameData.id}
                  publisherId={gameData.publisher.id}
                  userId={userData?.id}
                />
              )}
              <Button
                disabled
                className="w-full text-lg py-6 mt-2"
                variant="secondary"
              >
                Add to Wishlist
              </Button>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Release Date: &nbsp;
                {gameData.releaseDate
                  ? new Date(gameData.releaseDate).toLocaleDateString("en-UK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown Release Date"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                Developed by
              </h3>
              <p>{gameData.publisher.name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                Game Features
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {gameData.features.split("\n").map((item, idx) => {
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
                {gameData.languages
                  .map((language) => getLanguage(language))
                  .join(", ")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <RelatedGames games={relatedGames} />
    </div>
  );
}
