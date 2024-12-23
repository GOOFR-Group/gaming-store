import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Publisher } from "@/domain/publisher";
import { useToast } from "@/hooks/use-toast";
import { updatePublisher } from "@/lib/api";
import { COUNTRIES, TOAST_MESSAGES } from "@/lib/constants";
import { Conflict } from "@/lib/errors";
import { withAuthErrors } from "@/lib/middleware";
import { publisherQueryKey } from "@/lib/query-keys";
import { publisherAccountDetails } from "@/lib/zod";

export function PublisherAccountDetails(props: {
  publisher: Publisher;
  country: string;
}) {
  const [isEditMode, setEditMode] = useState(false);

  if (isEditMode) {
    return (
      <EditAccountDetails
        publisher={props.publisher}
        onCancel={() => setEditMode(false)}
        onSave={() => setEditMode(false)}
      />
    );
  }

  return (
    <ViewAccountDetails
      country={props.country} // TODO: Remove after publisher view game details is done.
      publisher={props.publisher}
      onEdit={() => setEditMode(true)}
    />
  );
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
        <Button onClick={props.onEdit}>Edit Profile</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p className="text-lg">{props.publisher.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-lg">{props.publisher.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Country</p>
          <p className="text-lg"> {props.country}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">VAT No.</p>
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

type AccountDetailsSchemaType = z.infer<typeof publisherAccountDetails>;

function EditAccountDetails(props: {
  publisher: Publisher;
  onCancel: () => void;
  onSave: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<AccountDetailsSchemaType>({
    resolver: zodResolver(publisherAccountDetails),
    defaultValues: {
      name: props.publisher.name,
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
        name: data.name,
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
    onError: withAuthErrors((error) => {
      if (error instanceof Conflict) {
        switch (error.code) {
          case "publisher_email_already_exists":
            form.setError("email", { message: "Email already exists" });
            break;

          case "publisher_vatin_already_exists":
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
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
