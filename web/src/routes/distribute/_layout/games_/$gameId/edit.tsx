import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

import { GameForm } from "@/components/form/game";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function gameQueryOptions(gameId: string) {
  return queryOptions({
    queryKey: [gameId],
    queryFn() {
      return {
        id: gameId,
        title: "Epic Adventure",
        publisher: "Stellar Games",
        genres: ["action", "rpg"],
        releaseDate: new Date("2023-12-01"),
        about:
          "Epic Adventure is an immersive action RPG that takes you on a journey through a vast, open world filled with danger and excitement.",
        features:
          "- Expansive open world\n- Deep character customization\n- Epic boss battles\n- Multiplayer co-op mode",
        languages: ["en", "es", "fr", "de"],
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
        isActive: false,
      };
    },
  });
}

export const Route = createFileRoute("/distribute/_layout/games/$gameId/edit")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(
      gameQueryOptions(opts.params.gameId),
    );
  },
});

function Component() {
  const params = useParams({ from: "/distribute/_layout/games/$gameId/edit" });
  const { data } = useSuspenseQuery(gameQueryOptions(params.gameId));
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col min-h-full">
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <CardDescription>{data.publisher}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <GameForm
          mode="edit"
          defaultValues={{
            about: data.about,
            ageRating: data.ageRating,
            features: data.features,
            genres: data.genres,
            languages: data.languages,
            price: data.price,
            releaseDate: data.releaseDate,
            title: data.title,
            systemRequirements: data.systemRequirements,
            isActive: data.isActive,
            screenshots: [],
          }}
          onSave={() =>
            navigate({
              to: "/distribute/games/$gameId",
              params: {
                gameId: params.gameId,
              },
            })
          }
        />
      </CardContent>
    </Card>
  );
}
