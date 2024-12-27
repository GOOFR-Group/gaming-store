import { ReactNode } from "react";

import { CalendarClock, ChevronDown, Euro, Keyboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrowseSearchSchemaType } from "@/routes/_layout/browse";

import { QUICK_FILTERS } from "./quick-filters";

const SORT_OPTIONS: {
  sort: BrowseSearchSchemaType["sort"];
  order: BrowseSearchSchemaType["order"];
  label: string;
  icon: ReactNode;
}[] = [
  {
    sort: "price",
    order: "asc",
    label: "Price (low to high)",
    icon: <Euro />,
  },
  {
    sort: "price",
    order: "desc",
    label: "Price (high to low)",
    icon: <Euro />,
  },
  {
    sort: "title",
    order: "asc",
    label: "Title (A-Z)",
    icon: <Keyboard />,
  },
  {
    sort: "title",
    order: "desc",
    label: "Title (Z-A)",
    icon: <Keyboard />,
  },
  {
    sort: "releaseDate",
    order: "desc",
    label: "Release date (latest)",
    icon: <CalendarClock />,
  },
  {
    sort: "releaseDate",
    order: "asc",
    label: "Release date (oldest)",
    icon: <CalendarClock />,
  },
];

export function BrowseSort(props: {
  sort: BrowseSearchSchemaType["sort"];
  order: BrowseSearchSchemaType["order"];
  quickFilter: BrowseSearchSchemaType["quickFilter"];
  onSelect: (
    sort: BrowseSearchSchemaType["sort"],
    order: BrowseSearchSchemaType["order"],
  ) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="group" variant="ghost">
          <span className="text-muted-foreground">Sort by:</span>{" "}
          {props.quickFilter
            ? QUICK_FILTERS[props.quickFilter]
            : SORT_OPTIONS.find(
                (option) =>
                  option.sort === props.sort && option.order === props.order,
              )?.label}
          <ChevronDown className="group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SORT_OPTIONS.map((option) => {
          return (
            <DropdownMenuItem
              key={option.label}
              onClick={() => props.onSelect(option.sort, option.order)}
            >
              {option.icon}
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
