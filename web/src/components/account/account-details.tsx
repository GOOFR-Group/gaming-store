import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { User } from "@/domain/user";
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/lib/api";
import {
  COUNTRIES,
  MISSING_VALUE_SYMBOL,
  TOAST_MESSAGES,
} from "@/lib/constants";
import { Conflict } from "@/lib/errors";
import { withAuthErrors } from "@/lib/middleware";
import { userQueryKey } from "@/lib/query-keys";
import { cn, getCountryName } from "@/lib/utils";
import { userAccountDetailsSchema } from "@/lib/zod";

export function AccountDetails(props: { user: User }) {
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
    <ViewAccountDetails user={props.user} onEdit={() => setEditMode(true)} />
  );
}

function ViewAccountDetails(props: { user: User; onEdit: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex h-10 justify-between items-center mb-4">
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
          <p className="text-lg">{props.user.email}</p>
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
          <p className="text-lg">
            {getCountryName(props.user.country) ?? MISSING_VALUE_SYMBOL}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">VAT No.</p>
          <p className="text-lg">{props.user.vatin}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Address</p>
        <p className="text-lg">{props.user.address}</p>
      </div>
    </div>
  );
}

type AccountDetailsSchemaType = z.infer<typeof userAccountDetailsSchema>;

function EditAccountDetails(props: {
  user: User;
  onCancel: () => void;
  onSave: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<AccountDetailsSchemaType>({
    resolver: zodResolver(userAccountDetailsSchema),
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
      await queryClient.invalidateQueries({
        predicate(query) {
          return query.queryKey.some((queryKey) => queryKey === userQueryKey[0]);
        },
      });
      props.onSave();
    },
    onError: withAuthErrors((error) => {
      if (error instanceof Conflict) {
        switch (error.code) {
          case "user_username_already_exists":
            form.setError("username", { message: "Username already exists" });
            break;

          case "user_email_already_exists":
            form.setError("email", { message: "Email already exists" });
            break;

          case "user_vatin_already_exists":
            form.setError("vatin", { message: "VAT No. already exists" });
            break;
        }
        return;
      }

      toast(TOAST_MESSAGES.unexpectedError);
    }),
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
      <div className="flex items-center h-10 mb-4">
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
                    <Input placeholder="Enter your email" {...field} />
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
                        <SelectValue placeholder="Select your country" />
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
                  <FormLabel>VAT No.</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={9}
                      placeholder="Enter your VAT No."
                      {...field}
                    />
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
            <Button type="reset" variant="ghost" onClick={props.onCancel}>
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending && <LoaderCircle className="animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
