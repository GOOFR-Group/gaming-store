import { lazy, Suspense } from "react";

import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";

import { Toaster } from "@/components/ui/toaster";
import { withAuthErrors } from "@/lib/middleware";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production.
    : lazy(() =>
        // Lazy load in development.
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  errorComponent(props) {
    withAuthErrors()(props.error);
  },
});

function RootComponent() {
  return (
    <Suspense>
      <ScrollRestoration />
      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-left" />
      <Toaster />
    </Suspense>
  );
}
