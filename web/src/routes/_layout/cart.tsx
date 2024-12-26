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
import { cartQueryKey, userQueryKey } from "@/lib/query-keys";
import { getUser } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

function cartQueryOptions() {
  return queryOptions({
    queryKey: cartQueryKey,
    queryFn() {
      return Array.from({ length: 5 }, (_, idx) => {
        return {
          id: idx + 1,
          title: "Cosmic Explorers",
          price: 59.99,
          developer: "Stellar Games",
          image: "/images/game.jpg",
        };
      });
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
    return opts.context.queryClient.ensureQueryData(cartQueryOptions());
  },
});

function Component() {
  const { data } = useSuspenseQuery(cartQueryOptions());
  const [cartItems, setCartItems] = useState(data);
  const query = useSuspenseQuery(userQueryOptions());
  const user = query.data;

  function removeItem(id: number) {
    setCartItems(cartItems.filter((item) => item.id !== id));
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1; // Assuming 10% tax
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex flex-wrap items-start gap-4 sm:gap-0">
                <img
                  alt={item.title}
                  className="rounded-md mr-4 max-h-[100px] h-auto object-cover"
                  src={item.image}
                  width={100}
                />
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {item.developer}
                      </p>
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
                    >
                      Move to wishlist
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
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
              <Link className="w-full" href="/payment">
                <Button className="w-full">Proceed to Checkout</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
      {cartItems.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          Your cart is empty.
        </p>
      )}
    </div>
  );
}
