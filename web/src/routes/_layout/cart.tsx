import { useState } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser, getCartGames, deleteGameCart } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { cartQueryKey, userQueryKey } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";

/**
 * Query options for retrieving the games from user cart.
 * @returns Query options.
 */
function cartQueryOptions() {
  return queryOptions({
    queryKey: cartQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const userId = payload.sub;
      const cartGames = await getCartGames(userId);

      return cartGames;
    },
  });
}

/**
 * Query options for retrieving the signed in user.
 * @returns Query options.
 */
function userQueryOptions() {
  return queryOptions({
    queryKey: userQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const userId = payload.sub;
      const user = await getUser(userId);

      return user;
    },
  });
}

export const Route = createFileRoute("/_layout/cart")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(userQueryOptions());
  },
});

function Component() {
  const { data } = useSuspenseQuery(cartQueryOptions());
  const [cartItems, setCartItems] = useState(data);
  const query = useSuspenseQuery(userQueryOptions());
  const user = query.data;

  function removeItem(id: string) {
    setCartItems({
      ...cartItems,
      games: cartItems.games.filter((item) => item.id !== id),
    });
    deleteGameCart(user.id, id);
  }

  const subtotal = cartItems.games.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.23;
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <div className="text-lg">
          Account Balance:{" "}
          <span className="font-semibold">{formatCurrency(user.balance)}</span>
        </div>
      </div>
      <div className="flex flex-wrap-reverse gap-8">
        <div className="flex-1 space-y-4">
          {cartItems.games.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex flex-wrap items-start gap-4 sm:gap-0">
                <img
                  alt={item.title}
                  className="rounded-md mr-4 max-h-[100px] h-auto object-cover"
                  src={item.previewMultimedia.url}
                  width={100}
                />
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="text-sm text-gray-300">{item.publisher.name}</p>
                    </div>
                    <p className="text-lg font-semibold">
                      €{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-wrap items-center justify-end mt-2">
                    <Button
                      aria-label={`Remove ${item.title} from cart`}
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>

                    <Button
                      aria-label={`Move ${item.title} to wishlist`}
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      disabled
                    >
                      Move to wishlist
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {cartItems.games.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">
              Your cart is empty.
            </p>
          )}
        </div>
        <div className="w-full sm:w-60 lg:w-96">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>€{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" disabled={cartItems.games.length === 0}>
                <Link className="w-full" to="/payment">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
