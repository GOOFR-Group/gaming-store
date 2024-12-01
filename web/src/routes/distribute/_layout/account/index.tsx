

import { QueryKey, queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute,redirect } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPublisher } from '@/lib/api';
import { decodeTokenPayload,getToken } from '@/lib/auth';
import { getInitials } from "@/lib/utils";

const userQueryKey: QueryKey = ["publisher"];

/**
 * Query options for retrieving the signed in user.
 * @returns Query options.
 */
function userQueryOptions() {
  return queryOptions({
    queryKey: userQueryKey,
    async queryFn() {
      const token = getToken();
      const payload = decodeTokenPayload(token);

      const publisherId = payload.sub;
      const publisher = await getPublisher(publisherId);

      return publisher;
    },
  });
}

export const Route = createFileRoute('/distribute/_layout/account/')({
  component: Component,
  loader(opts) {
    return opts.context.queryClient.ensureQueryData(userQueryOptions());
  },
  onError() {
    redirect({
      to: "/distribute/signin",
      replace: true,
      throw: true,
    });
  },
});

function Component() {
  const query = useSuspenseQuery(userQueryOptions());

  const {country,address,email,name,vatin} = query.data;
 return (
 <div>
    <div>
      <div className="">
        <p>Country:{country}</p>
        <p>Address: {address}</p>
        <p>Email: {email}</p>
        <p>Name: {name}</p>
       <p>Vatin: {vatin}</p>
      </div>
    </div>
  </div>)
}