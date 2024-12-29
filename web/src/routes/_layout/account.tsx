import { useState } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Heart, UserIcon } from "lucide-react";

import { AccountDetails } from "@/components/account/account-details";
import { AddFunds } from "@/components/account/add-funds";
import { SignOut } from "@/components/account/sign-out";
import { UserAvatar } from "@/components/account/user-avatar";
import { Game } from "@/components/game";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnderConstruction } from "@/components/under-construction";
import { getUser, getUserGameLibrary } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { MISSING_VALUE_SYMBOL } from "@/lib/constants";
import { userQueryKey } from "@/lib/query-keys";
import { getBatchPaginatedResponse } from "@/lib/request";
import { formatCurrency, getCountryName } from "@/lib/utils";

/**
 * Query options for retrieving the signed in user and their game library.
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
      const library = await getBatchPaginatedResponse(async (limit, offset) => {
        const paginatedGames = await getUserGameLibrary(userId, {
          limit,
          offset,
          sort: "gameTitle",
          order: "asc",
        });

        return {
          items: paginatedGames.games,
          total: paginatedGames.total,
        };
      });

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

function Component() {
  const [activeTab, setActiveTab] = useState("library");
  const {
    data: { user, library },
  } = useSuspenseQuery(userQueryOptions());

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
              <h3 className="text-lg font-semibold mb-2">My Games</h3>
              {library.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {library.map((game) => (
                    <div
                      key={game.id}
                      className="w-fit max-w-full mx-auto border p-4 rounded-lg"
                    >
                      <Link
                        to="/publishers/$publisherId/games/$gameId"
                        params={{
                          publisherId: game.publisher.id,
                          gameId: game.id,
                        }}
                      >
                        <Game
                          downloadMultimedia={game.downloadMultimedia}
                          image={game.previewMultimedia.url}
                          publisher={game.publisher.name}
                          title={game.title}
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mx-auto grid text-center py-6">
                  <p className="text-muted-foreground">
                    Your library is empty, try{" "}
                    <a className="text-primary hover:underline" href="/browse">
                      purchasing some games
                    </a>{" "}
                    first.
                  </p>
                </div>
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
