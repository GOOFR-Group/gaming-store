import { useState } from "react";

import { queryOptions } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Download, Gamepad2, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/lib/api";
import { clearToken, decodeTokenPayload, getToken } from "@/lib/auth";

/**
 * Query options for retrieving the signed in user.
 * @returns Query options.
 */
function userQueryOptions() {
  return queryOptions({
    queryKey: ["account"],
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

  return (
    <div className="container mx-auto px-4 py-8 bg-background text-foreground min-h-screen">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                alt="Gamer Avatar"
                src="/placeholder.svg?height=96&width=96"
              />
              <AvatarFallback>GP</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl">GamerPro99</CardTitle>
              <CardDescription>Portugal</CardDescription>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-semibold">Balance</p>
            <p className="text-2xl font-bold">€50.00</p>
            <div className="flex items-center gap-2 mt-2">
              <SignOut />
              <AddFunds />
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
                <User className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="library">
              <h3 className="text-lg font-semibold mb-2">My Games</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Game 1",
                  "Game 2",
                  "Game 3",
                  "Game 4",
                  "Game 5",
                  "Game 6",
                ].map((game) => (
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Account Details</h3>
                <Button>Edit Profile</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Username
                  </p>
                  <p className="text-lg">GamerPro99</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg">gamerpro99@example.com</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-lg">John Doe</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </p>
                  <p className="text-lg">January 1, 1990</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Country
                  </p>
                  <p className="text-lg">Portugal</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="text-lg">Lisbon</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function AddFunds() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Funds</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Your Account</DialogTitle>
          <DialogDescription>
            Enter the amount you'd like to add to your account balance.
          </DialogDescription>
        </DialogHeader>
        <form>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="amount">
                Amount
              </Label>
              <Input
                required
                className="col-span-3"
                id="amount"
                min="0.01"
                placeholder="0.00"
                step="0.01"
                type="number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Funds</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SignOut() {
  /**
   * Signs out a user and reloads the current page.
   */
  function handleClick() {
    clearToken();
    window.location.reload();
  }

  return (
    <Button variant="ghost" onClick={handleClick}>
      <LogOut className="mr-2" /> Sign Out
    </Button>
  );
}
