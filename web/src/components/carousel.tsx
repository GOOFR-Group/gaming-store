import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./ui/button";

export function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const screenshots = [
    {
      src: "/images/game.jpg",
      alt: "Spaceship flying through an asteroid field",
    },
    {
      src: "/images/game.jpg",
      alt: "Character customization screen with various options",
    },
    {
      src: "/images/game.jpg",
      alt: "Intense boss battle in a fiery arena",
    },
    {
      src: "/images/game.jpg",
      alt: "Peaceful village with NPCs and quest givers",
    },
    {
      src: "/images/game.jpg",
      alt: "High-speed racing scene on a futuristic track",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === screenshots.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? screenshots.length - 1 : prevIndex - 1,
    );
  };

  return (
    <div className="w-full p-6">
      <div className="relative mb-4">
        <img
          alt={screenshots[currentIndex].alt}
          className="rounded-lg object-cover w-full h-[400px]"
          height={400}
          src={screenshots[currentIndex].src}
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
        {screenshots.map((screenshot, index) => (
          <button
            key={index}
            aria-current={index === currentIndex ? "true" : "false"}
            aria-label={`View ${screenshot.alt}`}
            className={`flex-shrink-0 focus:outline-none p-1 rounded-md transition-all ${
              index === currentIndex
                ? "ring-2 ring-primary bg-primary/10"
                : "hover:bg-secondary/50"
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <img
              alt={`Thumbnail of ${screenshot.alt}`}
              height={67}
              src={screenshot.src}
              width={100}
              className={`rounded object-cover w-[100px] h-[67px] transition-opacity ${
                index === currentIndex ? "opacity-100" : "opacity-70"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
