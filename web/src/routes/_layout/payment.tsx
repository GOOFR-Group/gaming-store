import { useState } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { COUNTRIES_MAP, MISSING_VALUE_SYMBOL } from "@/lib/constants";
import { cartQueryKey, userQueryKey } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/_layout/payment")({
  component: () => PaymentPage(),
});

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

/**
 * Query options for retrieving the games from user cart.
 * @returns Query options.
 */
function cartQueryOptions() {
  return queryOptions({
    queryKey: cartQueryKey,
    queryFn() {
      return Array.from({ length: 5 }, (_, idx) => {
        return {
          id: idx + 1,
          title: "Cosmic Explorers",
          price: 59.99,
        };
      });
    },
  });
}

export default function PaymentPage() {
  const query = useSuspenseQuery(userQueryOptions());
  const user = query.data;
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {isPaymentComplete ? (
        <ThankYouMessage />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold mb-6 ml-4">
              Complete Your Purchase
            </h1>
            <div className="text-lg mr-4">
              Account Balance:{" "}
              <span className="font-semibold">
                {formatCurrency(user.balance)}
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <PaymentForm />
            <PurchaseSummary
              onPaymentComplete={() => setIsPaymentComplete(true)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function PaymentForm() {
  const query = useSuspenseQuery(userQueryOptions());
  const user = query.data;
  const country =
    COUNTRIES_MAP[user.country.toUpperCase() as keyof typeof COUNTRIES_MAP]
      ?.name ?? MISSING_VALUE_SYMBOL;

  return (
    <Card className="ml-4 h-fit col-span-2">
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
              <p className="text-lg">{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Country
              </p>
              <p className="text-lg">{country}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">VAT</p>
              <p className="text-lg">{user.vatin}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-lg">{user.address}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PurchaseSummary(props: { onPaymentComplete: () => void }) {
  const { data } = useSuspenseQuery(cartQueryOptions());
  const [cartItems] = useState(data);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.23;
  const total = subtotal + tax;

  function onSubmit() {
    props.onPaymentComplete();
  }

  return (
    <Card className="mr-4">
      <CardHeader>
        <CardTitle>Purchase Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.title}</span>
              <span>{formatCurrency(item.price)}</span>
            </div>
          ))}
          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        <Button className="w-full mt-4" onClick={onSubmit}>
          Complete Payment
        </Button>
      </CardContent>
    </Card>
  );
}

export function ThankYouMessage() {
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
