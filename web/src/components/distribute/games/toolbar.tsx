import { Table } from "@tanstack/react-table";

import { DataTableFacetedFilter } from "@/components/data-table";
import { Game } from "@/domain/game";
import { useTags } from "@/hooks/use-tags";

export function GamesToolbar(props: { table: Table<Game> }) {
  const tagsQuery = useTags();

  const tagOptions = (tagsQuery.data ?? []).map((tag) => {
    return {
      value: tag.id,
      label: tag.name,
    };
  });

  return (
    <DataTableFacetedFilter
      column={props.table.getColumn("tags")}
      options={tagOptions}
    />
  );
}
