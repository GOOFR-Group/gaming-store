import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { Edit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { gameQueryKey } from "@/lib/query-keys";

function gameQueryOptions(gameId: string) {
  return queryOptions({
    queryKey: gameQueryKey(gameId),
    queryFn: () => {
      return {
        id: gameId,
        title: "Epic Adventure",
        publisher: "Stellar Games",
        genres: ["Action", "RPG"],
        releaseDate: new Date("2023-12-01"),
        isActive: false,
        about:
          "Epic Adventure is an immersive action RPG that takes you on a journey through a vast, open world filled with danger and excitement.",
        features:
          "- Expansive open world\n- Deep character customization\n- Epic boss battles\n- Multiplayer co-op mode",
        languages: ["English", "Spanish", "French", "German"],
        systemRequirements: {
          minimum:
            "OS: Windows 10 64-bit\nProcessor: Intel Core i5-6600K or AMD Ryzen 5 1600\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce GTX 1060 or AMD Radeon RX 580",
          recommended:
            "OS: Windows 10 64-bit\nProcessor: Intel Core i7-8700K or AMD Ryzen 7 3700X\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 2070 SUPER or AMD Radeon RX 5700 XT",
        },
        screenshots: [
          "/images/game.jpg",
          "/images/game.jpg",
          "/images/game.jpg",
          "/images/game.jpg",
        ],
        ageRating: 16,
        price: 59.99,
      };
    },
  });
}

export const Route = createFileRoute("/distribute/_layout/games/$gameId")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(
      gameQueryOptions(opts.params.gameId),
    );
  },
});

function Component() {
  const params = useParams({ from: "/distribute/_layout/games/$gameId" });
  const { data } = useSuspenseQuery(gameQueryOptions(params.gameId));

  return (
    <Card className="flex flex-col min-h-full">
      <CardHeader className="flex flex-wrap flex-row gap-2 justify-between">
        <div>
          <CardTitle>{data.title}</CardTitle>
          <div className="flex flex-col">
            <CardDescription>{data.publisher}</CardDescription>
            <p>€{data.price}</p>
            <Badge
              className="w-fit mt-2"
              variant={data.isActive ? "default" : "destructive"}
            >
              {data.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex-1 flex gap-2">
          <Button asChild className="ml-auto">
            <Link params={params} to="/distribute/games/$gameId/edit">
              <Edit />
              Edit
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1">Release Date</h3>
            <p>{format(data.releaseDate, "dd/MM/yyyy")}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Age rating</h3>
            <p>{data.ageRating}+</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {data.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Languages Supported</h3>
            <div className="flex flex-wrap gap-2">
              {data.languages.map((language) => (
                <Badge key={language} variant="secondary">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">About the Game</h3>
          <p>{data.about}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Game Features</h3>
          <p className="whitespace-pre-wrap">{data.features}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">System Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Minimum</h4>
              <p className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
                {data.systemRequirements.minimum}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Recommended</h4>
              <p className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
                {data.systemRequirements.recommended}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Screenshots</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,24rem))] gap-4">
            {data.screenshots.map((screenshot, index) => (
              <img
                key={index}
                alt={`Screenshot ${index + 1}`}
                className="h-auto rounded-md"
                src={screenshot}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
