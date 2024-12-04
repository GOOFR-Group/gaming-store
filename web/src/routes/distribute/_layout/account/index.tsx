import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  QueryKey,
  queryOptions,
  useMutation,
  useQueryClient,
  useQueryClient as useQueryPublisher,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoaderCircle, Upload } from "lucide-react";
import { z } from "zod";

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
import { toast, useToast } from "@/hooks/use-toast";
import { getPublisher, updatePublisher, uploadMultimedia } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { COUNTRIES, COUNTRIES_MAP } from "@/lib/constants";
import { Conflict, ContentTooLarge } from "@/lib/errors";
import { getInitials } from "@/lib/utils";

const publisherQueryKey: QueryKey = ["publisher"];

/**
 * Query options for retrieving the signed in publisher.
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

export const Route = createFileRoute("/distribute/_layout/account/")({
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
  const country =
    COUNTRIES_MAP[publisher.country.toUpperCase() as keyof typeof COUNTRIES_MAP]
      ?.name ?? "-";

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <PublisherAvatar
            id={publisher.id}
            name={publisher.name}
            url={publisher.pictureMultimedia?.url}
          />
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl">{publisher.name}</CardTitle>
            <CardDescription className="text-sm">{country}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isEditMode ? (
          <EditAccountDetails
            publisher={publisher}
            onCancel={() => setEditMode(false)}
            onSave={() => setEditMode(false)}
          />
        ) : (
          <ViewAccountDetails
            country={country}
            publisher={publisher}
            onEdit={() => setEditMode(true)}
          />
        )}
      </CardContent>
    </Card>
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
        <Button variant="default" onClick={props.onEdit}>
          Edit Profile
        </Button>
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

function PublisherAvatar(props: { id: string; name: string; url?: string }) {
  const queryPublisher = useQueryClient();
  const mutation = useMutation({
    async mutationFn(file: File) {
      const multimedia = await uploadMultimedia(file);

      await updatePublisher(props.id, { pictureMultimediaId: multimedia.id });
    },
    async onSuccess() {
      await queryPublisher.invalidateQueries({ queryKey: publisherQueryKey });
    },
    onError(error) {
      if (error instanceof ContentTooLarge) {
        toast({
          variant: "destructive",
          title: "Picture size must be smaller than 20MB",
        });
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
   * Handles file upload.
   * @param event Input change event.
   */
  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) {
      return;
    }

    mutation.mutate(files[0]);
  }

  return (
    <Avatar asChild className="relative size-24 group cursor-pointer">
      <label>
        <AvatarImage
          alt="Publisher Avatar"
          className="object-cover"
          src={props.url}
        />
        <AvatarFallback>{getInitials(props.name)}</AvatarFallback>
        {mutation.isPending ? (
          <>
            <div className="absolute size-full bg-black opacity-70" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ">
              <LoaderCircle className="animate-spin" />
            </div>
          </>
        ) : (
          <>
            <div className="absolute size-full bg-black opacity-0 group-hover:opacity-70 transition-opacity" />
            <Upload className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
        <Input
          accept="image/png, image/jpeg"
          className="hidden"
          type="file"
          onChange={handleFileUpload}
        />
      </label>
    </Avatar>
  );
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Name is required",
    })
    .max(50, {
      message: "Name must be shorter than 50 characters",
    }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address",
    })
    .max(320, {
      message: "Email must be shorter than 320 characters",
    }),
  country: z.string().min(1, {
    message: "Country is required",
  }),
  address: z
    .string()
    .min(1, {
      message: "Address is required",
    })
    .max(100, {
      message: "Address must be shorter than 100 characters",
    }),
  vatin: z
    .string()
    .min(1, {
      message: "VAT is required",
    })
    .max(20, {
      message: "VAT must be shorter than 20 characters",
    }),
});

type AccountDetailsSchemaType = z.infer<typeof formSchema>;

function EditAccountDetails(props: {
  publisher: Publisher;
  onCancel: () => void;
  onSave: () => void;
}) {
  const queryClient = useQueryPublisher();
  const form = useForm<AccountDetailsSchemaType>({
    resolver: zodResolver(formSchema),
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
    onError(error) {
      if (error instanceof Conflict) {
        switch (error.code) {
          case "publisher_name_already_exists":
            form.setError("name", { message: "Name already exists" });
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
