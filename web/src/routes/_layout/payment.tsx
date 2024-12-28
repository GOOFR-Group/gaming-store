import { useState } from "react";

import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginatedGames } from "@/domain/game";
import { User } from "@/domain/user";
import { useToast } from "@/hooks/use-toast";
import { getUser, getUserCartGames, purchaseUserCart } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { MISSING_VALUE_SYMBOL, TAX } from "@/lib/constants";
import { TOAST_MESSAGES } from "@/lib/constants";
import { Conflict, EmptyCart } from "@/lib/errors";
import { withAuthErrors } from "@/lib/middleware";
import { paymentQueryKey, userNavbarQueryKey } from "@/lib/query-keys";
import { formatCurrency, getCountryName } from "@/lib/utils";

/**
 * Query options for retrieving the signed in user and their cart.
 * @returns Query options.
 */
function paymentQueryOptions() {
  return queryOptions({
    queryKey: paymentQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const userId = payload.sub;
      const user = await getUser(userId);
      const cart = await getUserCartGames(userId);

      if (!cart.total) {
        throw new EmptyCart();
      }

      return { user, cart };
    },
  });
}

export const Route = createFileRoute("/_layout/payment")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(paymentQueryOptions());
  },
  onError(error) {
    if (error instanceof EmptyCart) {
      redirect({
        to: "/cart",
        replace: true,
        throw: true,
      });
    }
  },
});

function Component() {
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const {
    data: { user, cart },
  } = useSuspenseQuery(paymentQueryOptions());

  return (
    <div className="container mx-auto">
      {isPaymentComplete ? (
        <ThankYouMessage />
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
            <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
            <div className="text-lg mr-4">
              Account Balance:{" "}
              <span className="font-semibold">
                {formatCurrency(user.balance)}
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <BillingDetails user={user} />
            <PurchaseSummary
              cart={cart}
              user={user}
              onPaymentComplete={() => setIsPaymentComplete(true)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function BillingDetails(props: { user: User }) {
  return (
    <Card className="h-fit col-span-2">
      <CardHeader>
        <CardTitle>Billing Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Username
              </p>
              <p className="text-lg">{props.user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{props.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Country
              </p>
              <p className="text-lg">
                {getCountryName(props.user.country) ?? MISSING_VALUE_SYMBOL}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">VAT</p>
              <p className="text-lg">{props.user.vatin}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-lg">{props.user.address}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PurchaseSummary(props: {
  cart: PaginatedGames;
  user: User;
  onPaymentComplete: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    async mutationFn(userId: string) {
      await purchaseUserCart(userId);
    },
    async onSuccess() {
      props.onPaymentComplete();
      await queryClient.invalidateQueries({ queryKey: userNavbarQueryKey });
    },
    onError: withAuthErrors((error) => {
      if (error instanceof Conflict) {
        toast({
          variant: "destructive",
          title: "Insufficient balance",
          description:
            "Your current balance is not enough to complete this purchase.",
        });
        return;
      }

      toast(TOAST_MESSAGES.unexpectedError);
    }),
  });

  /**
   * Handles the process of completing the payment.
   */
  function handleCompletePayment() {
    mutation.mutate(props.user.id);
  }

  const subtotal = props.cart.games.reduce((sum, game) => sum + game.price, 0);

  return (
    <Card className="mr-4">
      <CardHeader>
        <CardTitle>Purchase Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {props.cart.games.map((game) => (
            <div key={game.id} className="flex justify-between">
              <span>{game.title}</span>
              <span>{formatCurrency(game.price)}</span>
            </div>
          ))}
          <div className="border-t pt-4 space-y-2">
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
          </div>
        </div>
        <Button className="w-full mt-4" onClick={handleCompletePayment}>
          Complete Payment
        </Button>
      </CardContent>
    </Card>
  );
}

function ThankYouMessage() {
  return (
    <div className="container w-full max-w-4xl mx-auto px-4 py-8 bg-background text-foreground min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-2">Thank you for your purchase!</h1>
      <p className="text-lg mb-8">
        The invoice for your purchase has been sent to your email.
      </p>
      <div className="w-full flex items-center justify-center">
        <Button asChild>
          <Link to="/account">Go to Your Library</Link>
        </Button>
      </div>
    </div>
  );
}
