import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BrowseSearchSchemaType } from "@/routes/_layout/browse";

const QUICK_FILTERS_OPTIONS: {
  label: string;
  value: BrowseSearchSchemaType["quickFilter"];
}[] = [
  {
    label: "Featured & Recommended",
    value: "recommended",
  },
  {
    label: "Upcoming Releases",
    value: "upcoming-releases",
  },
  {
    label: "Best Sellers",
    value: "best-sellers",
  },
];

export function QuickFilters(props: {
  selectedQuickFilter: BrowseSearchSchemaType["quickFilter"];
  onSelect: (id: BrowseSearchSchemaType["quickFilter"]) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block">Quick Filters</Label>
      <div className="flex flex-col gap-2">
        {QUICK_FILTERS_OPTIONS.map((quickFiltersOption) => {
          const isSelected =
            props.selectedQuickFilter === quickFiltersOption.value;
          return (
            <button
              key={quickFiltersOption.label}
              className={cn(
                "p-3 rounded-lg text-left text-sm font-medium transition-colors text-secondary-foreground hover:bg-secondary/80",
                {
                  "bg-primary text-primary-foreground hover:bg-primary":
                    isSelected,
                },
              )}
              onClick={() =>
                props.onSelect(
                  isSelected ? undefined : quickFiltersOption.value,
                )
              }
            >
              {quickFiltersOption.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
