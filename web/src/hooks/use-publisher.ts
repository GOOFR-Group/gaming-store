import { useQuery } from "@tanstack/react-query";

import { getPublisher } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { Forbidden } from "@/lib/errors";
import { publisherQueryKey } from "@/lib/query-keys";

/**
 * Hooks that retrieves the publisher information.
 * @returns Publisher query.
 */
export function usePublisher() {
  const query = useQuery({
    queryKey: publisherQueryKey,
    retry: false,
    throwOnError: true,
    staleTime: Number.POSITIVE_INFINITY,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const publisherId = payload.sub;
      if (!payload.roles.includes("publisher")) {
        throw new Forbidden("roles_invalid", "invalid subject roles");
      }

      const publisher = await getPublisher(publisherId);

      return publisher;
    },
  });

  return query;
}
