import { QueryKey } from "@tanstack/react-query";

import { GamesFilters, RecommendedGamesFilters } from "@/domain/game";

/**
 * Query key used when fetching a user information.
 */
export const userQueryKey: QueryKey = ["user"];

/**
 * Query key used when fetching the home page.
 */
export const homeQueryKey: QueryKey = ["home"];

/**
 * Query key used when fetching games.
 * @param [filters] Filters.
 * @param [isRecommended=false] Indicates if games are recommended to the user.
 * @returns Games query key.
 */
export function gamesQueryKey(
  filters?: GamesFilters | RecommendedGamesFilters,
  isRecommended: boolean = false,
): QueryKey {
  return ["games", filters, isRecommended];
}

/**
 * Query key used when fetching a game.
 * @param gameId Game ID.
 * @param publisherId Publisher ID.
 * @returns Game query key.
 */
export function gameQueryKey(gameId: string, publisherId: string): QueryKey {
  return ["games", gameId, publisherId];
}

/**
 * Query key used when fetching a game in the distribution routes.
 * @param gameId Game ID.
 * @param publisherId Publisher ID.
 * @returns Game query key.
 */
export function distributeGameQueryKey(
  gameId: string,
  publisherId: string,
): QueryKey {
  return ["games", "distribute", gameId, publisherId];
}

/**
 * Query key used when fetching the cart information.
 */
export const cartQueryKey: QueryKey = ["cart"];

/**
 * Query key used when fetching tags.
 */
export const tagsQueryKey: QueryKey = ["tags"];

/**
 * Query key used when fetching the publisher information.
 */
export const publisherQueryKey: QueryKey = ["publisher"];

/**
 * Query key used when fetching the user's information for the navbar.
 */
export const userNavbarQueryKey: QueryKey = ["cart", "user"];

/**
 * Query key used when fetching the payment information.
 */
export const paymentQueryKey: QueryKey = ["payment"];
