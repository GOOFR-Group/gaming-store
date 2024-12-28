import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BrowseSearchSchemaType } from "@/routes/_layout/browse";

const PRICE_OPTIONS: {
  label: string;
  value: BrowseSearchSchemaType["price"];
}[] = [
  { label: "Free", value: "free" },
  { label: "Under €10", value: "under-10" },
  { label: "Under €20", value: "under-20" },
  { label: "Above €50", value: "above-50" },
];

export function PriceFilter(props: {
  selectedPrice: BrowseSearchSchemaType["price"];
  onSelect: (id: BrowseSearchSchemaType["price"]) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block">Price</Label>
      <div className="flex flex-col gap-2">
        {PRICE_OPTIONS.map((priceOption) => {
          const isSelected = props.selectedPrice === priceOption.value;

          return (
            <button
              key={priceOption.value}
              className={cn(
                "p-3 rounded-lg text-left text-sm font-medium transition-colors text-secondary-foreground hover:bg-secondary/80",
                {
                  "bg-primary text-primary-foreground hover:bg-primary":
                    isSelected,
                },
              )}
              onClick={() =>
                props.onSelect(isSelected ? undefined : priceOption.value)
              }
            >
              {priceOption.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
