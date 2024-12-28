import { useState } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Gamepad2, Heart, UserIcon } from "lucide-react";

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
import { UnderConstruction } from "@/components/under-construction";
import { PaginatedGames } from "@/domain/game";
import { getUser, getUserGames } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { MISSING_VALUE_SYMBOL } from "@/lib/constants";
import { userQueryKey } from "@/lib/query-keys";
import { formatCurrency, getCountryName } from "@/lib/utils";

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
      const library = await getUserGames(userId);

      return { user, library };
    },
  });
}

export const Route = createFileRoute("/_layout/account")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(userQueryOptions());
  },
});

function ListGamesLibrary(props: { library: PaginatedGames }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {props.library.games.map((game) => (
          <div key={game.id}>
            <Link href={`/games/${game.id}`}>
              <img
                alt="Game cover"
                className="object-cover h-[400px] rounded-lg w-full"
                src={game.previewMultimedia.url}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/game.jpg";
                }}
              />
            </Link>
            <div className="p-4 flex items-center justify-between flex-wrap">
              <div>
                <p className="text-sm text-gray-400">{game.publisher.name}</p>
                <h3 className="text-xl font-semibold">{game.title}</h3>
              </div>
              <Button size="icon" variant="secondary">
                <Download className="size-5" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Component() {
  const [activeTab, setActiveTab] = useState("library");
  const userQuery = useSuspenseQuery(userQueryOptions());

  const { user, library } = userQuery.data;

  return (
    <div className="container mx-auto bg-background text-foreground">
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
              <CardDescription>
                {getCountryName(user.country) ?? MISSING_VALUE_SYMBOL}
              </CardDescription>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Library
              </TabsTrigger>
              <TabsTrigger value="account">
                <UserIcon className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="library">
              <h3 className="text-lg font-semibold mb-2">My Games </h3>
              {library.games.length === 0 ? (
                <div className="mx-auto grid text-center">
                  <p className="text-muted-foreground">
                    Your library is empty, try&nbsp;
                    <a className="text-primary hover:underline" href="/browse">
                      purchasing some games
                    </a>
                    &nbsp;first.
                  </p>
                </div>
              ) : (
                <ListGamesLibrary library={library} />
              )}
            </TabsContent>

            <TabsContent className="mt-4" value="account">
              <AccountDetails user={user} />
            </TabsContent>

            <TabsContent className="mt-4" value="wishlist">
              <UnderConstruction />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
