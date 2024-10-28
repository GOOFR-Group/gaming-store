import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_layout/signin")({
  component: Component,
});

function Component() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute right-1/4 bottom-1/4 w-64 h-64 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute left-1/3 bottom-1/3 w-64 h-64 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-none shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="emailUsername">Email or Username</Label>
                <Input
                  required
                  className="border-input"
                  id="emailUsername"
                  type="text"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  required
                  className="border-input"
                  id="password"
                  type="password"
                />
              </div>
            </div>
          </form>
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
            <Link href="/register">Register</Link>
          </Button>
          <Button className="text-primary hover:text-primary/90" variant="link">
            Forgot your password?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
