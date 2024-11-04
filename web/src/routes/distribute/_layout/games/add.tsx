import { createFileRoute } from "@tanstack/react-router";

import { GameForm } from "@/components/form/game";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/distribute/_layout/games/add")({
  component: Component,
});

function Component() {
  return (
    <Card className="flex flex-col min-h-full">
      <CardHeader>
        <CardTitle>Add Game</CardTitle>
        <CardDescription>Add a game to your game catalog</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <GameForm mode="add" />
      </CardContent>
    </Card>
  );
}
