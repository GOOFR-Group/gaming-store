import { useState, useEffect } from "react";
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
import { User } from "@/domain/user"; 


interface PublisherConfig {
  name: string;
}


function userQueryOptions() {
  return queryOptions<User>({
    queryKey: userQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);
      const userId = payload.sub;
      const user = await getUser(userId);
      return user as User;
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
  const [activeTab, setActiveTab] = useState<string>("library");
  const query = useSuspenseQuery(userQueryOptions());
  const user = query.data;

  const country =
    COUNTRIES_MAP[user.country.toUpperCase() as keyof typeof COUNTRIES_MAP]?.name ?? "-";

  const [publisherConfig, setPublisherConfig] = useState<PublisherConfig | null>(null);
  useEffect(() => {
    const config = localStorage.getItem("publisherConfig");
    // Unnecessary type assertion used previously. Just use JSON.parse(config) directly.
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
          <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
              <h3 className="text-lg font-semibold mb-2">My Games</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {["Game 1", "Game 2", "Game 3", "Game 4", "Game 5", "Game 6"].map((game) => (
                  <div key={game}>
                    <Link href="/games/1">
                      <img
                        alt="Game cover"
                        className="object-cover h-[400px] rounded-lg w-full"
                        src="/images/game.jpg"
                      />
                    </Link>
                    <div className="p-4 flex items-center justify-between flex-wrap">
                      <div>
                        <p className="text-sm text-gray-400">Stellar Games</p>
                        <h3 className="text-xl font-semibold">{game}</h3>
                      </div>
                      <Button size="icon" variant="secondary">
                        <Download className="size-5" />
                        <span className="sr-only">Download</span>
                      </Button>
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
