import "./styles.css";

import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { AuthProvider } from './lib/auth';

export const queryClient = new QueryClient();

// Set up a Router instance.
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register things for type safety.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
