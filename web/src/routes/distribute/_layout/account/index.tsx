import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem,SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { QueryKey, queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Publisher } from '@/domain/publisher';
import { useToast } from '@/hooks/use-toast';
import { getPublisher, updatePublisher } from '@/lib/api';
import { decodeTokenPayload, getToken } from '@/lib/auth';
import { COUNTRIES } from '@/lib/constants';
import { Conflict } from '@/lib/errors';
import { accountDetailsSchema } from '@/lib/zod';

const publisherQueryKey: QueryKey = ["publisher"];

/**
 * Query options for retrieving the signed in user.
 * @returns Query options.
 */
function publisherQueryOptions() {
  return queryOptions({
    queryKey: publisherQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const publisherId = payload.sub;
      const publisher = await getPublisher(publisherId);

      return publisher;
    },
  });
}

export const Route = createFileRoute('/distribute/_layout/account/')({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(publisherQueryOptions());
  },
  onError() {
    redirect({
      to: "/distribute/signin",
      replace: true,
      throw: true,
    });
  },
});

function Component() {

  const [isEditMode, setEditMode] = useState(false);

  const query = useSuspenseQuery(publisherQueryOptions());
  const publisher = query.data;
  publisher.country = "Portugal"

  return (
    <div>
      <div>
        <div className="">
          <div className='flex gap-4 ml-5 mb-7'>
            <div>
              <Avatar className='w-20 h-20'>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className='content-center'>
              <CardTitle className="text-2xl">{publisher.name}</CardTitle>
              <CardDescription className="text-sm">ID: {query.data.id}</CardDescription>
            </div>
          </div>
          <div className='mx-5'>
            {
              isEditMode ?
                <EditAccountDetails
                  publisher={publisher}
                  onCancel={() => setEditMode(false)}
                  onSave={() => setEditMode(false)}
                /> :
                <ViewAccountDetails
                  country={publisher.country}
                  publisher={publisher}
                  onEdit={() => setEditMode(true)}
                />
            }
          </div>


        </div>
      </div>
    </div>)
}

function ViewAccountDetails(props: {
  publisher: Publisher;
  country: string;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex h-10 justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Account Details</h3>
        <Button variant="default" onClick={props.onEdit}>
          Edit Profile
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Username</p>
          <p className="text-lg">{props.publisher.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-lg">{props.publisher.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Country</p>
          <p className="text-lg">{props.country}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">VAT</p>
          <p className="text-lg">{props.publisher.vatin}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Address</p>
        <p className="text-lg">{props.publisher.address}</p>
      </div>
    </div>
  );
}


type AccountDetailsSchemaType = z.infer<typeof accountDetailsSchema>;

function EditAccountDetails(props: {
  publisher: Publisher;
  onCancel: () => void;
  onSave: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<AccountDetailsSchemaType>({
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: {
      username: props.publisher.name,
      email: props.publisher.email,
      country: props.publisher.country.toUpperCase(),
      address: props.publisher.address,
      vatin: props.publisher.vatin,
    },
  });
  const { toast } = useToast();
  const mutation = useMutation({
    async mutationFn(data: AccountDetailsSchemaType) {
      await updatePublisher(props.publisher.id, {
        name: data.username,
        email: data.email,
        country: data.country.toUpperCase(),
        address: data.address,
        vatin: data.vatin,
      });
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: publisherQueryKey });
      props.onSave();
    },
    onError(error) {
      if (error instanceof Conflict) {
        switch (error.code) {
          case "publisher_username_already_exists":
            form.setError("username", { message: "Name already exists" });
            break;

          case "publisher_email_already_exists":
            form.setError("email", { message: "Email already exists" });
            break;

          case "publisher_vatin_already_exists":
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