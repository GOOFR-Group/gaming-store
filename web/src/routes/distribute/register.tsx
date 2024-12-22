import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
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
import { useToast } from "@/hooks/use-toast";
import { createPublisher, signInPublisher } from "@/lib/api";
import { decodeTokenPayload, storeToken } from "@/lib/auth";
import { COUNTRIES, TOAST_MESSAGES } from "@/lib/constants";
import { Conflict } from "@/lib/errors";
import { passwordRefinement } from "@/lib/zod";

export const Route = createFileRoute("/distribute/register")({
  component: Component,
});

const formSchema = z
  .object({
    name: z.string().min(1, {
      message: "Name is required",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    country: z.string().min(1, {
      message: "Country is required",
    }),
    address: z.string().min(1, {
      message: "Address is required",
    }),
    vatin: z
      .string()
      .min(1, {
        message: "VAT No. is required",
      })
      .refine((vatin) => vatin.length === 9 && !Number.isNaN(Number(vatin)), {
        message: "VAT No. must be 9 digits",
      }),
    password: z
      .string()
      .min(14, {
        message: "Password must be at least 14 characters long",
      })
      .max(72, {
        message: "Password must be shorter than 72 characters",
      })
      .superRefine(passwordRefinement),
    confirm: z.string().min(1, {
      message: "Passwords don't match",
    }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type RegisterSchemaType = z.infer<typeof formSchema>;

function Component() {
  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      address: "",
      vatin: "",
      password: "",
      confirm: "",
    },
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const mutation = useMutation({
    async mutationFn(data: RegisterSchemaType) {
      await createPublisher({
        name: data.name,
        email: data.email,
        country: data.country,
        address: data.address,
        vatin: data.vatin,
        password: data.password,
      });

      const jwt = await signInPublisher({
        email: data.email,
        password: data.password,
      });
      const payload = decodeTokenPayload(jwt.token);
      storeToken(jwt.token, payload.exp);
    },
    async onSuccess() {
      await navigate({ to: "/distribute/games" });
    },
    onError(error) {
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
    },
  });

  /**
   * Handles form submission.
   * @param data Form data.
   */
  function onSubmit(data: RegisterSchemaType) {
    mutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <Card className="w-full max-w-2xl bg-background/80 backdrop-blur-sm border-none shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 flex flex-col items-center">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Create Publisher Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => {
                            return (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full text-primary-foreground font-semibold"
                type="submit"
              >
                Create Account
              </Button>
              <div className="flex justify-center items-center gap-2 w-full">
                <span className="text-sm">Already have an account?</span>
                <Button asChild className="p-0" variant="link">
                  <Link to="/distribute/signin">Sign in</Link>
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
