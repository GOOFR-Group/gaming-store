import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, LinkProps } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Game } from "@/components/game";
import { Button } from "@/components/ui/button";
import { Game as GameDomain } from "@/domain/game";
import { useTags } from "@/hooks/use-tags";
import { getGames, getRecommendedGames } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { homeQueryKey } from "@/lib/query-keys";

/**
 * Query options for retrieving the home page games.
 * @returns Query options.
 */
function homeGamesQueryOptions() {
  return queryOptions({
    queryKey: homeQueryKey,
    async queryFn() {
      let userId = undefined;

      try {
        const token = getToken();
        const payload = decodeTokenPayload(token);

        if (payload.roles.includes("user")) {
          userId = payload.sub;
        }
      } catch {
        // Ignore the error if the user is not signed in,
        // as the recommended games can still be fetched for visitors.
      }

      const [recommendedGames, upcomingReleases, bestSellers] =
        await Promise.all([
          getRecommendedGames({
            limit: 4,
            userId,
          }),
          getGames({
            limit: 4,
            isActive: true,
            sort: "releaseDate",
            order: "desc",
          }),
          getGames({
            limit: 4,
            isActive: true,
            sort: "userCount",
            order: "desc",
          }),
        ]);

      return {
        recommendedGames,
        upcomingReleases,
        bestSellers,
      };
    },
  });
}

/**
 * Genres displayed on the home page for quick filtering.
 */
const genres = [
  { label: "Action", image: "/images/genres/action.png" },
  { label: "Adventure", image: "/images/genres/adventure.png" },
  { label: "RPG", image: "/images/genres/rpg.png" },
  { label: "Strategy", image: "/images/genres/strategy.png" },
  { label: "Sport", image: "/images/genres/sport.png" },
  { label: "Simulation", image: "/images/genres/simulation.png" },
  { label: "Puzzle", image: "/images/genres/puzzle.png" },
  { label: "Racing", image: "/images/genres/racing.png" },
];

export const Route = createFileRoute("/_layout/")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(homeGamesQueryOptions());
  },
});

function Component() {
  const { data: homeGames } = useSuspenseQuery(homeGamesQueryOptions());

  const tagsQuery = useTags();
  const tags = tagsQuery.data ?? [];

  // Maps the genre IDs by their label.
  const genreIds: Record<string, string | undefined> = {};

  genres.forEach((genre) => {
    const tag = tags.find(
      (tag) => tag.name.toLowerCase() === genre.label.toLowerCase(),
    );

    genreIds[genre.label] = tag ? tag.id : undefined;
  });

  return (
    <div className="flex flex-col items-center min-h-screen">
      <main className="container flex-1">
        <section className="w-full py-12 md:py-24">
          <div className="px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Gateway to Epic Gaming Adventures
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl">
                    Discover, download, and dominate with our vast collection of
                    games for all platforms.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild className="tracking-wider">
                    <Link to="/browse">Shop Now</Link>
                  </Button>
                  <Button asChild className="tracking-wider" variant="outline">
                    <a href="#recommended">View Recommended Games</a>
                  </Button>
                </div>
              </div>
              <img
                alt="Cover image of a portal to a faraway modern world"
                className="mx-auto size-[550px] aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:aspect-square hidden sm:block"
                src="/images/cover.jpg"
              />
            </div>
          </div>
        </section>

        <Section
          games={homeGames.recommendedGames.games}
          id="recommended"
          title="Featured & Recommended"
          to="/browse"
        />

        <Section
          games={homeGames.upcomingReleases.games}
          id="upcoming-releases"
          search={{ sort: "releaseDate", order: "desc" }}
          title="Upcoming Releases"
          to="/browse"
        />

        <Section
          games={homeGames.bestSellers.games}
          id="best-sellers"
          search={{ sort: "userCount", order: "desc" }}
          title="Best Sellers"
          to="/browse"
        />

        <section className="w-full py-12 px-6">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">
            Browse by Genre
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <Button
                key={genre.label}
                asChild
                className="group h-20 text-lg font-semibold relative overflow-hidden"
                disabled={!genreIds[genre.label]}
                variant="outline"
              >
                <Link search={{ tags: genreIds[genre.label] }} to="/browse">
                  <div
                    className="size-[10vw] sm:size-16 absolute -left-3 sm:bottom-0 bottom-1/2 sm:translate-y-0 translate-y-1/2 bg-contain bg-no-repeat group-hover:brightness-90"
                    style={{
                      backgroundImage: `url('${genre.image}')`,
                    }}
                  />
                  {genre.label}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Section(props: {
  id: string;
  title: string;
  games: GameDomain[];
  to: LinkProps["to"];
  search?: Record<string, string>;
}) {
  return (
    <section className="w-full py-8 px-6" id={props.id}>
      <Link
        className="flex items-center gap-4 mb-8"
        search={props.search}
        to={props.to}
      >
        <h2 className="text-3xl font-bold tracking-tighter">{props.title}</h2>
        <ChevronRight size={24} />
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 *:mx-auto">
        {props.games.map((game) => (
          <Link
            key={game.title}
            params={{ gameId: game.id }}
            to="/games/$gameId"
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
    </section>
  );
}
