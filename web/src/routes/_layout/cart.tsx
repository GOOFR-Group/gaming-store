import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { deleteUserCartGame, getUser, getUserCartGames } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { TAX, TOAST_MESSAGES } from "@/lib/constants";
import { withAuthErrors } from "@/lib/middleware";
import { cartQueryKey, userNavbarQueryKey } from "@/lib/query-keys";
import { getBatchPaginatedResponse } from "@/lib/request";
import { formatCurrency } from "@/lib/utils";

/**
 * Query options for retrieving the signed in user and their cart.
 * @returns Query options.
 */
function cartQueryOptions() {
  return queryOptions({
    queryKey: cartQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const userId = payload.sub;
      const user = await getUser(userId);

      let total = 0;
      const games = await getBatchPaginatedResponse(async (limit, offset) => {
        const paginatedGames = await getUserCartGames(userId, {
          limit,
          offset,
        });
        total = paginatedGames.total;

        return {
          items: paginatedGames.games,
          total,
        };
      });

      return { user, cart: { games, total } };
    },
  });
}

export const Route = createFileRoute("/_layout/cart")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(cartQueryOptions());
  },
});

function Component() {
  const queryClient = useQueryClient();
  const {
    data: { user, cart },
  } = useSuspenseQuery(cartQueryOptions());
  const mutation = useMutation({
    async mutationFn(gameId: string) {
      await deleteUserCartGame(user.id, gameId);
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: userNavbarQueryKey });
    },
    onError: withAuthErrors(() => {
      toast(TOAST_MESSAGES.unexpectedError);
    }),
  });

  /**
   * Removes a game from the user's cart.
   * @param id Game ID.
   */
  function removeGame(id: string) {
    mutation.mutate(id);
  }

  const subtotal = cart.games.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <div className="text-lg">
          Account Balance:{" "}
          <span className="font-semibold">{formatCurrency(user.balance)}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.total > 0 ? (
            cart.games.map((game) => (
              <Card key={game.id}>
                <CardContent className="p-4 flex flex-wrap items-start gap-4 sm:gap-0">
                  <img
                    alt={game.title}
                    className="rounded-md mr-4 max-h-[100px] h-auto object-cover"
                    src={game.previewMultimedia.url}
                    width={100}
                  />
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold">{game.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          {game.publisher.name}
                        </p>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatCurrency(game.price, TAX)}
                      </p>
                    </div>
                    <div className="flex-1 flex flex-wrap items-center justify-end mt-2">
                      <Button
                        aria-label={`Remove ${game.title} from cart`}
                        variant="ghost"
                        onClick={() => removeGame(game.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground mt-8">
              Your cart is empty.
            </p>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({TAX * 100}%)</span>
              <span>{formatCurrency(subtotal * TAX)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(subtotal, TAX)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild disabled={!cart.total}>
              <Link className="w-full" to="/payment">
                Proceed to Checkout
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
