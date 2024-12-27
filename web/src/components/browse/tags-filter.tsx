import { cva } from "class-variance-authority";

import { Label } from "@/components/ui/label";
import { Tag } from "@/domain/tag";
import { cn } from "@/lib/utils";

const tagStyles = cva(
  "px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80",
  {
    variants: {
      selected: {
        true: "bg-primary text-primary-foreground hover:bg-primary",
      },
    },
  },
);

export function TagsFilter(props: {
  tags: Tag[];
  selectedTags?: string | string[];
  onSelect: (id?: string) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block">Genre</Label>
      <div className="flex flex-wrap gap-2">
        <button
          className={cn(tagStyles({ selected: !props.selectedTags?.length }))}
          onClick={() => props.onSelect(undefined)}
        >
          All
        </button>
        {props.tags.map((tag) => (
          <button
            key={tag.id}
            className={cn(
              tagStyles({
                selected: (props.selectedTags
                  ? Array.isArray(props.selectedTags)
                    ? props.selectedTags
                    : [props.selectedTags]
                  : []
                ).some((selectedTag) => selectedTag === tag.id),
              }),
            )}
            onClick={() => props.onSelect(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
