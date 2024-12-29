import { useMemo } from "react";

import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInYears, format, isAfter } from "date-fns";
import { Heart, Library, ShoppingCart, Star } from "lucide-react";

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
import { gameQueryKey, userNavbarQueryKey } from "@/lib/query-keys";
import { formatCurrency, getLanguageName } from "@/lib/utils";

type UserData =
  | {
      user: User;
      library: PaginatedGames;
      cart: PaginatedGames;
    }
  | undefined;

const RELATED_GAMES_LIMIT = 7;

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
          isActive: true,
          limit: RELATED_GAMES_LIMIT,
          tagIds:
            game.tags.length > 0
              ? [game.tags[Math.floor(Math.random() * game.tags.length)].id] // Retrieve random tag from the game
              : undefined,
        })
      ).games;

      let relatedGameIndex = -1;
      for (let i = 0; i < relatedGames.length; i++) {
        const relatedGame = relatedGames[i];

        if (relatedGame.id === game.id) {
          relatedGameIndex = i;
          break;
        }
      }

      if (relatedGameIndex > -1) {
        relatedGames.splice(relatedGameIndex, 1);
      } else if (RELATED_GAMES_LIMIT === relatedGames.length) {
        relatedGames.pop();
      }

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
        // Ignore the error since the user might not be signed in.
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
            <Carousel game={game} />
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">About the Game</h2>
              <p className="whitespace-pre-wrap">{game.description}</p>

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
                  src={`/images/pegi/${game.ageRating}.png`}
                  onError={(e) => (e.currentTarget.style.display = "none")}
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
                  <p className="whitespace-pre-wrap">
                    {game.requirements.minimum}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                    Recommended
                  </h3>
                  <p className="whitespace-pre-wrap">
                    {game.requirements.recommended}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
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
                game={game}
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
              <p className="whitespace-pre-wrap">{game.features}</p>
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

function GameActions(props: {
  publisherId: string;
  game: GameDomain;
  userData: UserData;
}) {
  const isGameInLibrary = props.userData?.library.games.some(
    (game) => game.id === props.game.id,
  );
  const isGameInCart = props.userData?.cart.games.some(
    (game) => game.id === props.game.id,
  );

  return (
    <div className="flex flex-col gap-2">
      {isGameInLibrary ? (
        <Button
          asChild
          className="w-full text-lg bg-white text-black hover:bg-neutral-200 hover:text-black"
          size="lg"
          variant="outline"
        >
          <Link to="/account">
            <Library />
            In Library
          </Link>
        </Button>
      ) : isGameInCart ? (
        <Button
          asChild
          className="w-full text-lg bg-white text-black hover:bg-neutral-200 hover:text-black"
          size="lg"
          variant="outline"
        >
          <Link to="/cart">
            <ShoppingCart />
            In Cart
          </Link>
        </Button>
      ) : (
        <AddToCart
          game={props.game}
          publisherId={props.publisherId}
          userData={props.userData}
        />
      )}

      <Tooltip>
        <TooltipTrigger>
          <Button
            asChild
            disabled
            className="w-full text-lg"
            size="lg"
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
    </div>
  );
}

function AddToCart(props: {
  publisherId: string;
  game: GameDomain;
  userData: UserData;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    async mutationFn(gameId: string) {
      const token = getToken();
      const payload = decodeTokenPayload(token);
      const userId = payload.sub;

      await createUserCartGame(userId, gameId);
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: gameQueryKey(props.game.id, props.publisherId),
      });
      await queryClient.invalidateQueries({ queryKey: userNavbarQueryKey });
      toast({
        title: "Game added to cart",
      });
    },
    onError: withAuthErrors(() => {
      toast(TOAST_MESSAGES.unexpectedError);
    }),
  });

  const today = useMemo(() => new Date(), []);

  if (
    !("releaseDate" in props.game) ||
    ("releaseDate" in props.game && isAfter(props.game.releaseDate, today))
  ) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Button asChild disabled className="w-full text-lg" size="lg">
            <span>
              <ShoppingCart />
              Add to Cart
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          This game has not been released
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!props.game.isActive) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Button asChild disabled className="w-full text-lg" size="lg">
            <span>
              <ShoppingCart />
              Add to Cart
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          This game is unlisted from the store
        </TooltipContent>
      </Tooltip>
    );
  }

  if (props.userData) {
    const userAge = differenceInYears(today, props.userData.user.dateOfBirth);

    if (userAge < Number(props.game.ageRating))
      return (
        <Tooltip>
          <TooltipTrigger>
            <Button asChild disabled className="w-full text-lg" size="lg">
              <span>
                <ShoppingCart />
                Add to Cart
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Not old enough to purchase
          </TooltipContent>
        </Tooltip>
      );
  }

  return (
    <Button
      className="w-full text-lg"
      size="lg"
      onClick={() => mutation.mutate(props.game.id)}
    >
      <ShoppingCart />
      Add to Cart
    </Button>
  );
}

function RelatedGames(props: { games: GameDomain[] }) {
  return (
    <section className="py-12 md:py-24">
      <h2 className="text-3xl font-bold tracking-tighter mb-8">
        More Like This
      </h2>
      {props.games.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 *:mx-auto">
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
      ) : (
        <p className="text-muted-foreground">No matching games were found.</p>
      )}
    </section>
  );
}
