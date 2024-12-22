import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PublisherAccountDetails } from "@/components/distribute/account/account-details";
import { PublisherAvatar } from "@/components/distribute/account/publisher-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublisher } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { COUNTRIES_MAP, MISSING_VALUE_SYMBOL } from "@/lib/constants";
import { publisherQueryKey } from "@/lib/query-keys";

/**
 * Query options for retrieving the signed in publisher.
 * @returns Query options.
 */
function publisherQueryOptions() {
  return queryOptions({
    queryKey: publisherQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const publisherId = payload.sub;
      const publisher = await getPublisher(publisherId);

      return publisher;
    },
  });
}

export const Route = createFileRoute("/distribute/_layout/account")({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(publisherQueryOptions());
  },
});

function Component() {
  const query = useSuspenseQuery(publisherQueryOptions());
  const publisher = query.data;
  const country =
    COUNTRIES_MAP[publisher.country.toUpperCase() as keyof typeof COUNTRIES_MAP]
      ?.name ?? MISSING_VALUE_SYMBOL;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <PublisherAvatar
            id={publisher.id}
            name={publisher.name}
            url={publisher.pictureMultimedia?.url}
          />
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl">{publisher.name}</CardTitle>
            <CardDescription className="text-sm">{country}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <PublisherAccountDetails country={country} publisher={publisher} />
      </CardContent>
    </Card>
  );
}
