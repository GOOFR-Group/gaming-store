import { lazy, Suspense } from "react";

import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";

import { Toaster } from "@/components/ui/toaster";
import { PayloadMissing, TokenMissing, Unauthorized } from "@/lib/errors";

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
    if (
      props.error instanceof Unauthorized ||
      props.error instanceof TokenMissing ||
      props.error instanceof PayloadMissing
    ) {
      window.location.replace(
        window.location.pathname.startsWith("/distribute")
          ? "/distribute/signin"
          : "/signin",
      );
      return;
    }
  },
});

function RootComponent() {
  return (
    <Suspense>
      <ScrollRestoration />
      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-right" />
      <Toaster />
    </Suspense>
  );
}
