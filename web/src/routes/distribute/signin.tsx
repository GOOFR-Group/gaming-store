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
import { useToast } from "@/hooks/use-toast";
import { signInPublisher } from "@/lib/api";
import { decodeTokenPayload, storeToken } from "@/lib/auth";
import { TOAST_MESSAGES } from "@/lib/constants";
import { Unauthorized } from "@/lib/errors";

export const Route = createFileRoute("/distribute/signin")({
  component: Component,
});

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

type SignInSchemaType = z.infer<typeof formSchema>;

function Component() {
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const mutation = useMutation({
    async mutationFn(data: SignInSchemaType) {
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
      if (error instanceof Unauthorized) {
        switch (error.code) {
          case "credentials_incorrect":
            form.setError("email", {
              message: "",
            });
            form.setError("password", {
              message: "Credentials are incorrect",
            });
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
  function onSubmit(data: SignInSchemaType) {
    mutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-none shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 flex flex-col items-center">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Sign In to Distribution Center
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Link to="/distribute/register">Register</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
