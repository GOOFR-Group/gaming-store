import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Multimedia } from "@/domain/multimedia";
import { MISSING_VALUE_SYMBOL, TAX } from "@/lib/constants";
import { cn, formatCurrency, getMultimediaName } from "@/lib/utils";

export function Game(props: {
  title: string;
  publisher: string;
  image: string;
  price?: number;
  downloadMultimedia?: Multimedia;
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
            "h-14": props.downloadMultimedia,
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
        {props.downloadMultimedia && (
          <Button asChild variant="secondary">
            <a
              download={getMultimediaName(props.downloadMultimedia)}
              href={props.downloadMultimedia.url}
            >
              <span className="hidden sm:block">Download</span>
              <Download className="size-5" />
            </a>
          </Button>
        )}
      </div>
    </article>
  );
}
