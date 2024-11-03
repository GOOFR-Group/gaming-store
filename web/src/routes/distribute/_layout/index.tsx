import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/distribute/_layout/")({
  loader() {
    redirect({
      to: "/distribute/games",
      replace: true,
      throw: true,
    });
  },
});
