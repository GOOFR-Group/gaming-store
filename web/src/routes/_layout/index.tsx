import { ReactNode } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Game } from "@/components/game";
import { Button } from "@/components/ui/button";
import { gamesQueryKey } from "@/lib/query-keys";

function gamesQueryOptions() {
  return queryOptions({
    queryKey: gamesQueryKey(),
    queryFn() {
      return Array.from({ length: 4 }, (_, idx) => {
        return {
          title: `Game ${idx}`,
          image: "/images/game.jpg",
          publisher: "Stellar Games",
          price: 59.99,
        };
      });
    },
  });
}

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
    return opts.context.queryClient.ensureQueryData(gamesQueryOptions());
  },
});

function Component() {
  const { data } = useSuspenseQuery(gamesQueryOptions());

  return (
    <div className="flex flex-col items-center min-h-screen">
      <main className="container flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
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
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 tracking-wider"
                  >
                    <Link to="/browse">Shop Now</Link>
                  </Button>
                  <Button
                    asChild
                    className="border-gray-700 text-white hover:bg-gray-800 tracking-wider"
                    variant="outline"
                  >
                    <a href="#recommended">View Recommended Games</a>
                  </Button>
                </div>
              </div>
              <img
                alt="Game image"
                className="mx-auto size-[550px] aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:aspect-square"
                src="/images/game.jpg"
              />
            </div>
          </div>
        </section>

        <Section href="/" id="recommended" title="Featured & Recommended">
          {data.map((game) => (
            <Link key={game.title} href="/games/1">
              <Game
                image={game.image}
                price={game.price}
                publisher={game.publisher}
                title={game.title}
              />
            </Link>
          ))}
        </Section>

        <Section href="/" title="Upcoming Releases">
          {data.map((game) => (
            <Link key={game.title} href="/games/1">
              <Game
                image={game.image}
                price={game.price}
                publisher={game.publisher}
                title={game.title}
              />
            </Link>
          ))}
        </Section>

        <Section href="/" title="Best Sellers">
          {data.map((game) => (
            <Link key={game.title} href="/games/1">
              <Game
                image={game.image}
                price={game.price}
                publisher={game.publisher}
                title={game.title}
              />
            </Link>
          ))}
        </Section>

        <section className="w-full py-12 px-6">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">
            Browse by Genre
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <Button
                key={genre.label}
                className="group h-20 text-lg font-semibold relative overflow-hidden"
                variant="outline"
              >
                <div
                  className="size-[10vw] sm:size-16 absolute -left-3 sm:bottom-0 bottom-1/2 sm:translate-y-0 translate-y-1/2 bg-contain bg-no-repeat group-hover:brightness-90"
                  style={{
                    backgroundImage: `url('${genre.image}')`,
                  }}
                />
                {genre.label}
              </Button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Section(props: {
  children: ReactNode;
  title: string;
  href: string;
  id?: string;
}) {
  return (
    <section className="w-full py-8 px-6" id={props.id}>
      <Link className="flex items-center gap-4 mb-8" href={props.href}>
        <h2 className="text-3xl font-bold tracking-tighter">{props.title}</h2>
        <ChevronRight size={24} />
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 *:mx-auto">
        {props.children}
      </div>
    </section>
  );
}
