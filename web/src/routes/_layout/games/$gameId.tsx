import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";

import { Carousel } from "@/components/carousel";
import { Game } from "@/components/game";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/games/$gameId")({
  component: Component,
});

function Component() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Cosmic Explorers</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="aspect-video w-full max-h-[512px]">
              <Carousel />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">About the Game</h2>
              <p>
                Embark on an interstellar journey in Cosmic Explorers, where
                you'll discover uncharted planets, encounter alien species, and
                unravel the mysteries of the universe. Build your own spaceship,
                form alliances with other players, and leave your mark on the
                galaxy in this expansive multiplayer sci-fi adventure.
              </p>

              <div className="flex flex-wrap items-start justify-between mt-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">Sci-Fi</Badge>
                  <Badge variant="secondary">Adventure</Badge>
                  <Badge variant="secondary">Multiplayer</Badge>
                </div>

                <img
                  alt="Age rating"
                  className="h-12"
                  src="/images/pegi/18.png"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">
                System Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                    Minimum
                  </h3>
                  <ul className="list-disc list-inside">
                    <li>OS: Windows 10 64-bit</li>
                    <li>Processor: Intel Core i5-4460 or AMD FX-6300</li>
                    <li>Memory: 8 GB RAM</li>
                    <li>Graphics: NVIDIA GeForce GTX 760</li>
                    <li>Storage: 50 GB available space</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                    Recommended
                  </h3>
                  <ul className="list-disc list-inside">
                    <li>OS: Windows 10 64-bit</li>
                    <li>Processor: Intel Core i7-4790 or AMD Ryzen 5 1500X</li>
                    <li>Memory: 16 GB RAM</li>
                    <li>Graphics: NVIDIA GeForce GTX 1060</li>
                    <li>Storage: 50 GB available space (SSD recommended)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-3xl font-bold">€59.99</span>
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground ml-1">(2,945)</span>
                </div>
              </div>
              <Button className="w-full text-lg py-6">
                <ShoppingCart className="mr-2" />
                Add to Cart
              </Button>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Button
                    disabled
                    className="w-full text-lg py-6 mt-2"
                    variant="secondary"
                  >
                    Add to Wishlist
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This feature is under construction</p>
                </TooltipContent>
              </Tooltip>
              <p className="text-muted-foreground mt-2 text-center">
                Release Date: June 15, 2023
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                Developed by
              </h3>
              <p>Stellar Games</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                Game Features
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Vast, procedurally generated universe</li>
                <li>Multiplayer co-op and PvP modes</li>
                <li>Customizable spaceships and characters</li>
                <li>Dynamic economy and trading system</li>
                <li>Epic story-driven campaign</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-muted-foreground text-lg">
                Languages Supported
              </h3>
              <p>
                English, French, German, Spanish, Italian, Russian, Japanese,
                Korean, Chinese (Simplified and Traditional)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="py-12 md:py-24 lg:py-32 px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter mb-8">
          More Like This
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, idx) => {
            return (
              <Link key={idx} href="/games/1">
                <Game
                  image="/images/game.jpg"
                  price={59.99}
                  publisher="Stellar Games"
                  title={`Game ${idx}`}
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
