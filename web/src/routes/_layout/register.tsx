import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
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
import { Multimedia } from "@/domain/multimedia";
import { NewUser, User } from "@/domain/user";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/register")({
  component: Component,
});

const formSchema = z
  .object({
    username: z
      .string()
      .min(1, {
        message: "Username is required",
      })
      .max(50, {
        message: "Username must be shorter than 50 characters",
      }),
    email: z
      .string()
      .email({
        message: "Please enter a valid email address",
      })
      .max(320, {
        message: "Email must be shorter than 320 characters",
      }),
    displayName: z
      .string()
      .min(1, {
        message: "Name is required",
      })
      .max(100, {
        message: "Name must be shorter than 100 characters",
      }),
    dateOfBirth: z.date({
      required_error: "Date of birth is required",
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
    picture: z.instanceof(File).optional(),
    password: z
      .string()
      .min(14, {
        message: "Password must be at least 14 characters long",
      })
      .max(72, {
        message: "Password must be shorter than 72 characters",
      })
      .superRefine((val, ctx) => {
        const characters = val.split("");
        let hasLetter = false;
        let hasDigit = false;
        let hasSpecial = false;

        characters.forEach((char) => {
          const charCode = char.charCodeAt(0);
          const isLetter =
            (charCode >= 65 && charCode <= 90) ||
            (charCode >= 97 && charCode <= 122);
          const isDigit = charCode >= 48 && charCode <= 57;
          const isSpecial = !isLetter;

          if (isLetter) {
            hasLetter = true;
          }

          if (isDigit) {
            hasDigit = true;
          }

          if (isSpecial) {
            hasSpecial = true;
          }
        });

        if (!hasLetter) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must have at least one regular character",
          });

          return z.NEVER;
        }

        if (!hasDigit) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must have at least one number",
          });

          return z.NEVER;
        }

        if (!hasSpecial) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must have at least one special character",
          });
        }
      }),
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
      username: "",
      email: "",
      displayName: "",
      dateOfBirth: undefined,
      country: "",
      address: "",
      vatin: "",
      picture: undefined,
      password: "",
      confirm: "",
    },
  });
  const { toast } = useToast();
  const { mutate } = useMutation({
    async mutationFn(data: RegisterSchemaType) {
      const newUser: NewUser = {
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd"),
        country: data.country,
        address: data.address,
        vatin: data.vatin,
        password: data.password,
      };
      let response: Response;

      if (data.picture) {
        const formData = new FormData();
        formData.append("picture", data.picture);

        response = await fetch("/api/multimedia/upload", {
          method: "POST",
          body: formData,
        });

        const pictureMultimedia = (await response.json()) as Multimedia;
        newUser.pictureMultimediaId = pictureMultimedia.id;
      }

      response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      const user = (await response.json()) as User;

      return user;
    },
  });

  function onSubmit(data: RegisterSchemaType) {
    mutate(data, {
      onSuccess() {},
      onError() {
        toast({
          variant: "destructive",
          title: "Oops! An unexpected error occurred",
          description: "Please try again later or contact the support team.",
        });
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute right-1/4 bottom-1/4 w-64 h-64 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute left-1/3 bottom-1/3 w-64 h-64 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <Card className="w-full max-w-2xl bg-background/80 backdrop-blur-sm border-none shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 flex flex-col items-center">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Register Account
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
                      <FormLabel>VAT</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your VAT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="picture"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Picture{" "}
                        <span className="text-xs italic text-muted-foreground">
                          Optional
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          accept="image/*"
                          type="file"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            form.setValue("picture", files[0]);
                          }}
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
            <CardFooter>
              <Button
                className="w-full text-primary-foreground font-semibold"
                type="submit"
              >
                Register Account
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
