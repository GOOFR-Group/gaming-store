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
import { Game } from "@/domain/game";
import { toast } from "@/hooks/use-toast";
import { getUser, removeGameFromCart } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { cartQueryKey, userQueryKey } from "@/lib/query-keys";

// /**
//  * Query options for retrieving the signed in user's cart.
//  * @returns Query options.
//  */
// function cartQueryOptions() {
//   return queryOptions({
//     queryKey: cartQueryKey,
//     async queryFn() {
//       const token = getToken();
//       const payload = decodeTokenPayload(token);

//       const userId = payload.sub;
//       const cart = await getUserCart(userId);

//       return cart;
//     },
//   });
// }

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

function cartQueryOptions() {
  return queryOptions({
    queryKey: cartQueryKey,
    queryFn() {
      const cart: { games: Game[] } = {
        games: Array.from({ length: 5 }, (_, idx) => {
          return {
            id: (idx + 1).toString(),
            title: "Epic Adventure",
            publisher: "Stellareref Games",
            genres: ["action", "rpg"],
            releaseDate: new Date("2023-12-01"),
            about:
              "Epic Adventure is an immersive action RPG that takes you on a journey through a vast, open world filled with danger and excitement.",
            features:
              "Expansive open world\nDeep character customization\nEpic boss battles\nMultiplayer co-op mode",
            languages: ["en", "es", "fr", "de"],
            systemRequirements: {
              minimum:
                "OS: Windows 10 64-bit\nProcessor: Intel Core i5-6600K or AMD Ryzen 5 1600\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce GTX 1060 or AMD Radeon RX 580\nStorage: 50 GB available space (SSD recommended)",
              recommended:
                "OS: Windows 10 64-bit\nProcessor: Intel Core i7-8700K or AMD Ryzen 7 3700X\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 2070 SUPER or AMD Radeon RX 5700 XT",
            },
            screenshots: [
              "/images/game.jpg",
              "/images/game.jpg",
              "/images/game.jpg",
              "/images/game.jpg",
            ],
            ageRating: 18,
            price: 29.99,
            isActive: false,
          };
        }),
      };

      return cart;
    },
  });
}

export const Route = createFileRoute("/_layout/cart")({
  component: Component,
  async loader(opts) {
    const [cartData, userData] = await Promise.all([
      opts.context.queryClient.ensureQueryData(cartQueryOptions()),
      opts.context.queryClient.ensureQueryData(userQueryOptions()),
    ]);

    return { cart: cartData, user: userData };
  },
});

function Component() {
  const { data } = useSuspenseQuery(cartQueryOptions());
  const { data: user } = useSuspenseQuery(userQueryOptions());
  const [cartItems, setCartItems] = useState(data.games);
  const accountBalance = user.balance; // Placeholder account balance

  async function removeItem(id: string) {
    try {
      await removeGameFromCart("", id.toString());
    } catch {
      toast({
        variant: "destructive",
        title: "Oops! An unexpected error occurred",
        description: "Please try again later or contact the support team.",
      });
      return;
    }
    setCartItems(cartItems.filter((item) => item.id !== id));
  }

  function moveItemToWishlist(id: string) {
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
          <span className="font-semibold">€{accountBalance.toFixed(2)}</span>
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
                  src={item.screenshots[0]}
                  width={100}
                />
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {item.publisher}
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
                      onClick={() => moveItemToWishlist(item.id)}
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
