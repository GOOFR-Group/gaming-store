import { useQuery } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";

import { DataTableFacetedFilter } from "@/components/data-table";
import { Game } from "@/domain/game";
import { getTags } from "@/lib/api";
import { tagsQueryKey } from "@/lib/query-keys";
import { getBatchPaginatedResponse } from "@/lib/request";

export function GamesToolbar(props: { table: Table<Game> }) {
  const query = useQuery({
    queryKey: tagsQueryKey,
    async queryFn() {
      const tags = await getBatchPaginatedResponse(async (limit, offset) => {
        const paginatedTags = await getTags({ limit, offset });
        return {
          total: paginatedTags.total,
          items: paginatedTags.tags,
        };
      });

      return tags;
    },
  });

  const tagOptions = (query.data ?? []).map((tag) => {
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
