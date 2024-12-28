import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./ui/button";
import { Game } from "@/domain/game";

export function Carousel(props: { game: Game }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === props.game.multimedia.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? props.game.multimedia.length - 1 : prevIndex - 1,
    );
  };

  return (
    <div className="w-full p-6">
      <div className="relative mb-4">
        <img
          alt={`Thumbnail ${currentIndex} of ${props.game.title}`}
          className="rounded-lg object-cover w-full h-[400px]"
          height={400}
          src={props.game.multimedia[currentIndex].url}
          width={600}
        />
        <Button
          aria-label="Previous screenshot"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90"
          size="icon"
          variant="outline"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Next screenshot"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90"
          size="icon"
          variant="outline"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex space-x-2 justify-center overflow-x-auto p-2">
        {props.game.multimedia.map((screenshot, index) => (
          <button
            key={index}
            aria-current={index === currentIndex ? "true" : "false"}
            aria-label={`View ${screenshot.url}`}
            className={`flex-shrink-0 focus:outline-none p-1 rounded-md transition-all ${index === currentIndex
              ? "ring-2 ring-primary bg-primary/10"
              : "hover:bg-secondary/50"
              }`}
            onClick={() => setCurrentIndex(index)}
          >
            <img
              alt={`Thumbnail ${index} of ${props.game.title}`}
              height={67}
              src={screenshot.url}
              width={100}
              className={`rounded object-cover w-[100px] h-[67px] transition-opacity ${index === currentIndex ? "opacity-100" : "opacity-70"
                }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
