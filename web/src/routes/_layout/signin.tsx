import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_layout/signin")({
  component: Component,
});

const formSchema = z.object({
  emailOrUsername: z.string().min(1, {
    message: "Email or Username is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

function Component() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  function onSubmit() {}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-none shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 flex flex-col items-center">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email or username"
                        {...field}
                      />
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full text-primary-foreground font-semibold"
                type="submit"
              >
                Sign In
              </Button>
              <Button
                asChild
                className="w-full text-primary-foreground font-semibold"
                variant="secondary"
              >
                <Link to="/register">Register</Link>
              </Button>
              <Button
                className="text-primary hover:text-primary/90"
                variant="link"
              >
                Forgot your password?
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
