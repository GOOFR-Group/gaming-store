import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BrowseSearchSchemaType } from "@/routes/_layout/browse";

type QuickFilter = NonNullable<BrowseSearchSchemaType["quickFilter"]>;

export const QUICK_FILTERS: Record<QuickFilter, string> = {
  recommended: "Featured & Recommended",
  "upcoming-releases": "Upcoming Releases",
  "best-sellers": "Best Sellers",
};

const QUICK_FILTERS_OPTIONS = Object.entries(QUICK_FILTERS).map(
  ([quickFilter, label]) => {
    return {
      label: label,
      value: quickFilter as QuickFilter,
    };
  },
);

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
