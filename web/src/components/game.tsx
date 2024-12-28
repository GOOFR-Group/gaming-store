import { Download } from "lucide-react";

import { MISSING_VALUE_SYMBOL, TAX } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

import { Button } from "./ui/button";

export function Game(props: {
  title: string;
  publisher: string;
  image: string;
  price?: number;
  download?: boolean;
}) {
  return (
    <article className="group max-w-60">
      <img
        alt="Game cover"
        className="object-cover aspect-[3/4] rounded-lg w-60 group-hover:brightness-90"
        src={props.image}
      />
      <div className="py-2 flex flex-col gap-1">
        <p className="text-sm text-gray-300">
          {props.publisher || MISSING_VALUE_SYMBOL}
        </p>
        <h3
          className={cn("text-xl font-semibold line-clamp-2", {
            "h-14": props.download,
          })}
        >
          {props.title || MISSING_VALUE_SYMBOL}
        </h3>
        {props.price !== undefined && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <p>
              {!Number.isNaN(Number(props.price))
                ? formatCurrency(props.price, TAX)
                : MISSING_VALUE_SYMBOL}
            </p>
          </div>
        )}
        {props.download && (
          <Button variant="secondary">
            Download
            <Download className="size-5" />
          </Button>
        )}
      </div>
    </article>
  );
}
