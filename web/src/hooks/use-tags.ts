import { useQuery } from "@tanstack/react-query";

import { getTags } from "@/lib/api";
import { tagsQueryKey } from "@/lib/query-keys";
import { getBatchPaginatedResponse } from "@/lib/request";

/**
 * Hook for retrieving tags.
 * @returns Tags query.
 */
export function useTags() {
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

  return query;
}
