import { useState } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TAX } from "@/lib/constants";
import { cartQueryKey } from "@/lib/query-keys";
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

export const Route = createFileRoute("/_layout/cart")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(cartQueryOptions());
  },
});

function Component() {
  const { data } = useSuspenseQuery(cartQueryOptions());
  const [cartItems, setCartItems] = useState(data);
  const accountBalance = 500.0; // Placeholder account balance

  function removeItem(id: number) {
    setCartItems(cartItems.filter((item) => item.id !== id));
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <div className="text-lg">
          Account Balance:{" "}
          <span className="font-semibold">
            {formatCurrency(accountBalance, 0)}{" "}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap-reverse gap-8">
        <div className="flex-1 space-y-4">
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
                      <p className="text-sm text-gray-300">{item.developer}</p>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(item.price, TAX)}
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
        <div className="w-full sm:w-60 lg:w-96">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({TAX * 100}%)</span>
                <span>{formatCurrency(subtotal * TAX, 0)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(subtotal, TAX)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Proceed to Checkout</Button>
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
