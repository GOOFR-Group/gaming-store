import { useState } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Game } from "@/components/game";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { gamesQueryKey } from "@/lib/query-keys";
import { getGames } from "@/lib/api";

function gamesQueryOptions() {
  return queryOptions({
    queryKey: gamesQueryKey(),
    async queryFn() {
      const games = await getGames({});
      return games;
    },
  });
}

export const Route = createFileRoute("/_layout/browse")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(gamesQueryOptions());
  },
});

function Component() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState<string>();
  const { data } = useSuspenseQuery(gamesQueryOptions());
  const { games } = data;

  return (
    <div className="container mx-auto px-4 py-8 bg-background text-foreground min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Browse</h1>

      <div className="mb-8">
        <div className="relative">
          <Input
            className="w-full bg-input text-foreground"
            placeholder="Search games..."
            type="search"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-1 space-y-6">
          <div>
            <Label className="mb-2 block">Genre</Label>
            <div className="flex flex-wrap gap-2">
              {["All", "Action", "RPG", "Strategy", "Sport", "Puzzle"].map(
                (genre) => (
                  <button
                    key={genre}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedGenre === genre
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Price</Label>
            <div className="flex flex-col gap-2">
              {[
                "Free",
                "Under €10",
                "Under €20",
                "Above €50",
                "Discounted",
              ].map((price) => (
                <button
                  key={price}
                  className={`p-3 rounded-lg text-left text-sm font-medium transition-colors ${selectedPrice === price
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  onClick={() =>
                    setSelectedPrice(
                      price === selectedPrice ? undefined : price,
                    )
                  }
                >
                  {price}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link
                key={game.title}
                params={{ gameId: game.id, publisherId: game.publisher.id }}
                to="/publishers/$publisherId/games/$gameId"
              >
                <Game
                  image={game.previewMultimedia.url}
                  price={game.price}
                  publisher={game.publisher.name}
                  title={game.title}
                />
              </Link>
            ))}
          </div>

          <Pagination className="flex justify-center mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
                <PaginationLink href="#">2</PaginationLink>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
