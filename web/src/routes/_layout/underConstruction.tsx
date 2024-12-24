import { createFileRoute } from "@tanstack/react-router";

import { UnderConstructionPage } from "@/components/underConstruction";

export const Route = createFileRoute("/_layout/underConstruction")({
  component: Component,
});

function Component() {
  return <UnderConstructionPage showBack />;
}
