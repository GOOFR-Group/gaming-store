import { createFileRoute } from "@tanstack/react-router";

import { UnderConstruction } from "@/components/under-construction";

export const Route = createFileRoute("/_layout/under-construction")({
  component: Component,
});

function Component() {
  return (
    <div className="min-h-screen">
      <UnderConstruction showBack />
    </div>
  );
}