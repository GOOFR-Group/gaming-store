import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Game } from "@/domain/game";

export function Carousel(props: { game: Game }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Moves the active slide to the next one.
   */
  function nextSlide() {
    setCurrentIndex((prevIndex) =>
      prevIndex === props.game.multimedia.length - 1 ? 0 : prevIndex + 1,
    );
  }

  /**
   * Moves the active slide to the previous one.
   */
  function previousSlide() {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? props.game.multimedia.length - 1 : prevIndex - 1,
    );
  }

  return (
    <div className="w-full">
      <div className="relative h-[32rem] mb-4">
        {props.game.multimedia.length > 0 ? (
          <img
            alt={`Screenshot ${currentIndex + 1} of ${props.game.title}`}
            className="rounded-lg object-cover size-full aspect-video"
            src={props.game.multimedia[currentIndex].url}
          />
        ) : (
          <div className="size-full aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No screenshots available</p>
          </div>
        )}

        <Button
          aria-label="Previous screenshot"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90"
          disabled={!props.game.multimedia.length}
          size="icon"
          variant="outline"
          onClick={previousSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Next screenshot"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90"
          disabled={!props.game.multimedia.length}
          size="icon"
          variant="outline"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {props.game.multimedia.length > 0 && (
        <div className="flex space-x-2 justify-center overflow-x-auto p-2">
          {props.game.multimedia.map((screenshot, index) => (
            <button
              key={index}
              aria-current={index === currentIndex ? "true" : "false"}
              aria-label={`View ${screenshot.url}`}
              className={`flex-shrink-0 focus:outline-none p-1 rounded-md transition-all ${
                index === currentIndex
                  ? "ring-2 ring-primary bg-primary/10"
                  : "hover:bg-secondary/50"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <img
                alt={`Screenshot ${index + 1} of ${props.game.title}`}
                src={screenshot.url}
                className={`rounded object-cover w-[100px] h-[67px] transition-opacity ${
                  index === currentIndex ? "opacity-100" : "opacity-70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
