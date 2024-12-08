import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Download, Gamepad2, UserIcon } from "lucide-react";

import { AccountDetails } from "@/components/account/account-details";
import { AddFunds } from "@/components/account/add-funds";
import { SignOut } from "@/components/account/sign-out";
import { UserAvatar } from "@/components/account/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { COUNTRIES_MAP } from "@/lib/constants";
import { userQueryKey } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";

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

export const Route = createFileRoute("/_layout/account")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(userQueryOptions());
  },
  onError() {
    redirect({
      to: "/signin",
      replace: true,
      throw: true,
    });
  },
});

function Component() {
  const [activeTab, setActiveTab] = useState("library");
  const query = useSuspenseQuery(userQueryOptions());

  const user = query.data;
  const country =
    COUNTRIES_MAP[user.country.toUpperCase() as keyof typeof COUNTRIES_MAP]
      ?.name ?? "-";

  const [publisherConfig, setPublisherConfig] = useState<{ name: string } | null>(null);
  useEffect(() => {
    const config = localStorage.getItem("publisherConfig");
    setPublisherConfig(config ? JSON.parse(config) : null);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 bg-background text-foreground min-h-screen">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <UserAvatar
              displayName={user.displayName}
              id={user.id}
              url={user.pictureMultimedia?.url}
            />
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl">{user.displayName}</CardTitle>
              <CardDescription>{country}</CardDescription>
              {publisherConfig && (
                <p className="text-sm text-gray-500">Publisher: {publisherConfig.name}</p>
              )}
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-semibold">Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(user.balance)}</p>
            <div className="flex items-center gap-2 mt-2">
              <SignOut />
              <AddFunds balance={user.balance} id={user.id} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Library
              </TabsTrigger>
              <TabsTrigger value="account">
                <UserIcon className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="library">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.library?.map((item: { id: Key | null | undefined; image: string | undefined; title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; publisher: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
                  <div key={item.id} className="flex flex-col items-center">
                    <img src={item.image} alt={typeof item.title === 'string' ? item.title : undefined} className="w-full h-auto" />
                    <div className="mt-2 text-center">
                      <p className="text-lg font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.publisher}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent className="mt-4" value="account">
              <AccountDetails country={country} user={user} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
