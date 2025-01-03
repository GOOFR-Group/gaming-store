import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format, subYears } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { useToast } from "@/hooks/use-toast";
import { createUser, signInUser } from "@/lib/api";
import { decodeTokenPayload, storeToken } from "@/lib/auth";
import { COUNTRIES, MINIMUM_USER_AGE, TOAST_MESSAGES } from "@/lib/constants";
import { Conflict } from "@/lib/errors";
import { userNavbarQueryKey } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { passwordRefinement, userAccountDetailsSchema } from "@/lib/zod";

export const Route = createFileRoute("/_layout/register")({
  component: Component,
});

const formSchema = userAccountDetailsSchema
  .extend({
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
  const queryClient = useQueryClient();
  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      displayName: "",
      dateOfBirth: undefined,
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
      await createUser({
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd"),
        country: data.country,
        address: data.address,
        vatin: data.vatin,
        password: data.password,
      });

      const jwt = await signInUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      const payload = decodeTokenPayload(jwt.token);
      storeToken(jwt.token, payload.exp);
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: userNavbarQueryKey });
      await navigate({ to: "/account" });
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
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-background/80 backdrop-blur-sm border-none shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 flex flex-col items-center">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                            mode="single"
                            selected={field.value}
                            defaultMonth={subYears(
                              new Date(),
                              MINIMUM_USER_AGE,
                            )}
                            disabled={(date) =>
                              date > subYears(new Date(), MINIMUM_USER_AGE)
                            }
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
                disabled={mutation.isPending}
                type="submit"
              >
                Create Account
              </Button>
              <div className="flex justify-center items-center gap-2 w-full">
                <span className="text-sm">Already have an account?</span>
                <Button asChild className="p-0" variant="link">
                  <Link to="/signin">Sign in</Link>
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
