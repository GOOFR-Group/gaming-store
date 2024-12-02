import { lazy, Suspense } from "react";
import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Layout from './_layout';
import Home from './home';
import SignIn from './signin';

import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";

import { Toaster } from "@/components/ui/toaster";

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

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const routes = useRoutes([
    {
      path: '/',
      element: isAuthenticated ? <Layout /> : <Navigate to="/signin" replace />,
      children: [
        { index: true, element: <Home /> },
        
        // Other authenticated routes
      ],
    },
    {
      path: '/signin',
      element: !isAuthenticated ? <SignIn /> : <Navigate to="/" replace />,
    },
    // Other public routes
  ]);

  return routes;
};

export default AppRoutes;
