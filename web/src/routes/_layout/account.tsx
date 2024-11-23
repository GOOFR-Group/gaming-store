import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  QueryKey,
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarIcon,
  Download,
  Gamepad2,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/domain/user";
import { useToast } from "@/hooks/use-toast";
import { getUser, updateUser } from "@/lib/api";
import { clearToken, decodeTokenPayload, getToken } from "@/lib/auth";
import { COUNTRIES, COUNTRIES_MAP } from "@/lib/constants";
import { Conflict } from "@/lib/errors";
import { cn, formatCurrency } from "@/lib/utils";
import { accountDetailsSchema } from "@/lib/zod";

const userQueryKey: QueryKey = ["user"];

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
              <CardTitle className="text-2xl">{user.displayName}</CardTitle>
              <CardDescription>{country}</CardDescription>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-semibold">Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(user.balance)}</p>
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
                <UserIcon className="mr-2 h-4 w-4" />
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
              <AccountDetails country={country} user={user} />
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

function AccountDetails(props: { user: User; country: string }) {
  const [isEditMode, setEditMode] = useState(false);

  if (isEditMode) {
    return (
      <EditAccountDetails
        user={props.user}
        onCancel={() => setEditMode(false)}
        onSave={() => setEditMode(false)}
      />
    );
  }

  return (
    <ViewAccountDetails
      country={props.country}
      user={props.user}
      onEdit={() => setEditMode(true)}
    />
  );
}

function ViewAccountDetails(props: {
  user: User;
  country: string;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Account Details</h3>
        <Button variant="secondary" onClick={props.onEdit}>
          Edit Profile
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Username</p>
          <p className="text-lg">{props.user.username}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-lg">{props.user.displayName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
          <p className="text-lg">{props.user.displayName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Date of Birth
          </p>
          <p className="text-lg">
            {format(props.user.dateOfBirth, "dd/MM/yyyy")}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Country</p>
          <p className="text-lg">{props.country}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Address</p>
          <p className="text-lg">{props.user.address}</p>
        </div>
      </div>
    </>
  );
}

type AccountDetailsSchemaType = z.infer<typeof accountDetailsSchema>;

function EditAccountDetails(props: {
  user: User;
  onCancel: () => void;
  onSave: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<AccountDetailsSchemaType>({
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: {
      username: props.user.username,
      email: props.user.email,
      displayName: props.user.displayName,
      dateOfBirth: new Date(props.user.dateOfBirth),
      country: props.user.country.toUpperCase(),
      address: props.user.address,
      vatin: props.user.vatin,
    },
  });
  const { toast } = useToast();
  const mutation = useMutation({
    async mutationFn(data: AccountDetailsSchemaType) {
      await updateUser(props.user.id, {
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd"),
        country: data.country.toUpperCase(),
        address: data.address,
        vatin: data.vatin,
      });
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: userQueryKey });
      props.onSave();
    },
    onError(error) {
      if (error instanceof Conflict) {
        switch (error.code) {
          case "user_username_already_exists":
            form.setError("username", { message: "Username already exists" });
            break;

          case "user_email_already_exists":
            form.setError("email", { message: "Email already exists" });
            break;

          case "user_vatin_already_exists":
            form.setError("vatin", { message: "VAT already exists" });
            break;
        }
        return;
      }

      toast({
        variant: "destructive",
        title: "Oops! An unexpected error occurred",
        description: "Please try again later or contact the support team.",
      });
    },
  });

  /**
   * Handles form submission.
   * @param data Form data.
   */
  function onSubmit(data: AccountDetailsSchemaType) {
    mutation.mutate(data);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Account Details</h3>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Enter your date of birth</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        initialFocus
                        disabled={(date) => date > new Date()}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="border-input">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((country) => {
                        return (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vatin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your VAT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex w-full justify-end items-center gap-2 mt-4">
            <Button variant="ghost" onClick={props.onCancel}>
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
