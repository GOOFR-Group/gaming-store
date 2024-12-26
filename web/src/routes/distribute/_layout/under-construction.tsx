import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";
import { UnderConstructionPage } from "@/components/under-construction";

export const Route = createFileRoute("/distribute/_layout/under-construction")({
  component: Component,
});

function Component() {
  return (
    <Card className="h-full">
      <UnderConstructionPage showBack />
    </Card>
  );
}
