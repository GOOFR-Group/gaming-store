import { QueryKey } from "@tanstack/react-query";

/**
 * Query key used when fetching a user information.
 */
export const userQueryKey: QueryKey = ["user"];

/**
 * Query key used when fetching games.
 */
export const gamesQueryKey: QueryKey = ["games"];

/**
 * Query key used when fetching a game.
 * @param id Game ID.
 * @returns Game query key.
 */
export function gameQueryKey(id: string): QueryKey {
  return ["games", id];
}

/**
 * Query key used when fetching the cart information.
 */
export const cartQueryKey: QueryKey = ["cart"];

/**
 * Query key used when fetching the publisher information.
 */
export const publisherQueryKey: QueryKey = ["publisher"];
