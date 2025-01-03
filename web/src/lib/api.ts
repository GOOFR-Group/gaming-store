import { ApiError } from "@/domain/error";
import {
  EditableGame,
  Game,
  GamesFilters,
  NewGame,
  PaginatedGames,
  RecommendedGamesFilters,
} from "@/domain/game";
import { CreateGameMultimedia } from "@/domain/game-multimedia";
import { Jwt } from "@/domain/jwt";
import { Multimedia } from "@/domain/multimedia";
import {
  EditablePublisher,
  NewPublisher,
  Publisher,
  PublisherCredentials,
} from "@/domain/publisher";
import { PaginatedTags, TagFilters } from "@/domain/tag";
import {
  EditableUser,
  NewUser,
  User,
  UserCartGamesFilters,
  UserCredentials,
  UserGameLibraryFilters,
} from "@/domain/user";

import { getToken } from "./auth";
import {
  BadRequest,
  Conflict,
  ContentTooLarge,
  Forbidden,
  InternalServerError,
  NotFound,
  Unauthorized,
} from "./errors";

/**
 * Represents the default request timeout in milliseconds.
 */
const DEFAULT_TIMEOUT = 1000 * 60;

/**
 * Creates a new user.
 * @param newUser User to be created.
 * @returns User created.
 * @throws {Conflict} Username, email or vatin already exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function createUser(newUser: NewUser) {
  const response = await fetch("/api/users", {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const user = (await response.json()) as User;

  return user;
}

/**
 * Signs in a user with their credentials.
 * @param credentials User credentials.
 * @returns JWT.
 * @throws {Unauthorized} Incorrect credentials.
 * @throws {InternalServerError} Server internal error.
 */
export async function signInUser(credentials: UserCredentials) {
  const response = await fetch("/api/users/signin", {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const jwt = (await response.json()) as Jwt;

  return jwt;
}

/**
 * Retrieves a user given a user ID.
 * @param id User ID.
 * @returns User.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} User not found.
 * @throws {InternalServerError} Server internal error.
 */
export async function getUser(id: string) {
  const token = getToken();

  const response = await fetch(`/api/users/${id}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const user = (await response.json()) as User;

  return user;
}

/**
 * Retrieves a user's game library.
 * @param userId User ID.
 * @param [filters] Filters.
 * @returns User's game library.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {InternalServerError} Server internal error.
 */
export async function getUserGameLibrary(
  userId: string,
  filters?: UserGameLibraryFilters,
) {
  const token = getToken();

  const searchParams = new URLSearchParams();
  if (filters?.limit) {
    searchParams.set("limit", String(filters.limit));
  }
  if (filters?.offset) {
    searchParams.set("offset", String(filters.offset));
  }
  if (filters?.sort) {
    searchParams.set("sort", filters.sort);
  }
  if (filters?.order) {
    searchParams.set("order", filters.order);
  }

  const response = await fetch(`/api/users/${userId}/games?${searchParams}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const paginatedGames = (await response.json()) as PaginatedGames;

  return paginatedGames;
}

/**
 * Updates a user.
 * @param id User ID.
 * @param details User details.
 * @returns Updated user.
 * @throws {Unauthorized} Access token invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} User not found.
 * @throws {Conflict} Username, email or vatin already exists. Or multimedia does not exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function updateUser(id: string, details: EditableUser) {
  const token = getToken();

  const response = await fetch(`/api/users/${id}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const user = (await response.json()) as User;

  return user;
}

/**
 * Creates a new publisher.
 * @param newPublisher Publisher to be created.
 * @returns Publisher created.
 * @throws {Conflict} Email or vatin already exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function createPublisher(newPublisher: NewPublisher) {
  const response = await fetch("/api/publishers", {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPublisher),
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const publisher = (await response.json()) as Publisher;

  return publisher;
}

/**
 * Signs in a publisher with their credentials.
 * @param credentials Publisher credentials.
 * @returns JWT.
 * @throws {Unauthorized} Incorrect credentials.
 * @throws {InternalServerError} Server internal error.
 */
export async function signInPublisher(credentials: PublisherCredentials) {
  const response = await fetch("/api/publishers/signin", {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const jwt = (await response.json()) as Jwt;

  return jwt;
}

/**
 * Retrieves a publisher given a publisher ID.
 * @param id Publisher ID.
 * @returns Publisher.
 * @throws {NotFound} Publisher not found.
 * @throws {InternalServerError} Server internal error.
 */
export async function getPublisher(id: string) {
  const token = getToken();

  const response = await fetch(`/api/publishers/${id}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 404:
        throw new NotFound(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const publisher = (await response.json()) as Publisher;

  return publisher;
}

/**
 * Updates a publisher.
 * @param id Publisher ID.
 * @param details Publisher details.
 * @returns Updated publisher.
 * @throws {Unauthorized} Access token invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} Publisher not found.
 * @throws {Conflict} Email or vatin already exists. Or multimedia does not exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function updatePublisher(id: string, details: EditablePublisher) {
  const token = getToken();

  const response = await fetch(`/api/publishers/${id}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const publisher = (await response.json()) as Publisher;

  return publisher;
}

/**
 * Uploads a multimedia file.
 * @param file Multimedia file.
 * @returns Multimedia.
 * @throws {Unauthorized} Access token invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {ContentTooLarge} File is too large.
 * @throws {InternalServerError} Server internal error.
 */
export async function uploadMultimedia(file: File) {
  const token = getToken();

  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/multimedia", {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 413:
        throw new ContentTooLarge(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const multimedia = (await response.json()) as Multimedia;

  return multimedia;
}

/**
 * Retrieves the games.
 * @param filters Filters.
 * @returns Paginated games.
 * @throws {InternalServerError} Server internal error.
 */
export async function getGames(filters: GamesFilters) {
  const searchParams = new URLSearchParams();
  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }
  if (filters.offset) {
    searchParams.set("offset", String(filters.offset));
  }
  if (filters.sort) {
    searchParams.set("sort", filters.sort);
  }
  if (filters.order) {
    searchParams.set("order", filters.order);
  }
  if (filters.publisherId) {
    searchParams.set("publisherId", filters.publisherId);
  }
  if (filters.title) {
    searchParams.set("title", filters.title);
  }
  if (filters.priceUnder !== undefined) {
    searchParams.set("priceUnder", String(filters.priceUnder));
  }
  if (filters.priceAbove !== undefined) {
    searchParams.set("priceAbove", String(filters.priceAbove));
  }
  if (filters.isActive) {
    searchParams.set("isActive", String(filters.isActive));
  }
  if (filters.releaseDateBefore) {
    searchParams.set("releaseDateBefore", filters.releaseDateBefore);
  }
  if (filters.releaseDateAfter) {
    searchParams.set("releaseDateAfter", filters.releaseDateAfter);
  }
  if (filters.tagIds) {
    filters.tagIds.forEach((tagId) =>
      searchParams.append("tagIds", String(tagId)),
    );
  }

  const response = await fetch(`/api/games?${searchParams}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
  });

  if (response.status >= 400) {
    throw new InternalServerError();
  }

  const paginatedGames = (await response.json()) as PaginatedGames;

  return paginatedGames;
}

/**
 * Retrieves the recommended games.
 * @param filters Filters.
 * @returns Paginated games.
 * @throws {InternalServerError} Server internal error.
 */
export async function getRecommendedGames(filters: RecommendedGamesFilters) {
  const searchParams = new URLSearchParams();
  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }
  if (filters.offset) {
    searchParams.set("offset", String(filters.offset));
  }
  if (filters.userId) {
    searchParams.set("userId", filters.userId);
  }

  const response = await fetch(`/api/games/recommended?${searchParams}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
  });

  if (response.status >= 400) {
    throw new InternalServerError();
  }

  const paginatedGames = (await response.json()) as PaginatedGames;

  return paginatedGames;
}

/**
 * Retrieves a game from a publisher.
 * @param publisherId Publisher ID.
 * @returns Game of a publisher.
 * @throws {BadRequest} Invalid parameters.
 * @throws {NotFound} Game not found.
 * @throws {InternalServerError} Server internal error.
 */
export async function getPublisherGame(publisherId: string, gameId: string) {
  const response = await fetch(
    `/api/publishers/${publisherId}/games/${gameId}`,
    {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    },
  );

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 400:
        throw new BadRequest(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const game = (await response.json()) as Game;

  return game;
}

/**
 * Creates a new game from a publisher.
 * @param publisherId Publisher ID.
 * @param newGame New game.
 * @returns Game created.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} Publisher not found.
 * @throws {Conflict} Multimedia does not exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function createGame(publisherId: string, newGame: NewGame) {
  const token = getToken();

  const response = await fetch(`/api/publishers/${publisherId}/games`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newGame),
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const game = (await response.json()) as Game;

  return game;
}

/**
 * Updates a game from a publisher.
 * @param publisherId Publisher ID.
 * @param gameId Game ID.
 * @param details Game details.
 * @returns Updated game.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} Game not found.
 * @throws {Conflict} Multimedia does not exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function updateGame(
  publisherId: string,
  gameId: string,
  details: EditableGame,
) {
  const token = getToken();

  const response = await fetch(
    `/api/publishers/${publisherId}/games/${gameId}`,
    {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    },
  );

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const game = (await response.json()) as Game;

  return game;
}

/**
 * Creates a game multimedia association.
 * @param publisherId Publisher ID.
 * @param gameId Game ID.
 * @param multimediaId Multimedia ID.
 * @param data Association details.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} Game or multimedia not found.
 * @throws {Conflict} Association or position already exists.
 * @throws {InternalServerError} Server internal error.
 */
export async function createGameMultimedia(
  publisherId: string,
  gameId: string,
  multimediaId: string,
  data: CreateGameMultimedia,
) {
  const token = getToken();

  const response = await fetch(
    `/api/publishers/${publisherId}/games/${gameId}/multimedia/${multimediaId}`,
    {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }
}

/**
 * Deletes a game multimedia association.
 * @param publisherId Publisher ID.
 * @param gameId Game ID.
 * @param multimediaId Multimedia ID.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {Conflict} Association does not exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function deleteGameMultimedia(
  publisherId: string,
  gameId: string,
  multimediaId: string,
) {
  const token = getToken();

  const response = await fetch(
    `/api/publishers/${publisherId}/games/${gameId}/multimedia/${multimediaId}`,
    {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }
}

/**
 * Creates a game tag association.
 * @param publisherId Publisher ID.
 * @param gameId Game ID.
 * @param tagId Tag ID.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} Game or tag not found.
 * @throws {Conflict} Association already exists.
 * @throws {InternalServerError} Server internal error.
 */
export async function createGameTag(
  publisherId: string,
  gameId: string,
  tagId: string,
) {
  const token = getToken();

  const response = await fetch(
    `/api/publishers/${publisherId}/games/${gameId}/tags/${tagId}`,
    {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }
}

/**
 * Deletes a game tag association.
 * @param publisherId Publisher ID.
 * @param gameId Game ID.
 * @param tagId Tag ID.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {Conflict} Association does not exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function deleteGameTag(
  publisherId: string,
  gameId: string,
  tagId: string,
) {
  const token = getToken();

  const response = await fetch(
    `/api/publishers/${publisherId}/games/${gameId}/tags/${tagId}`,
    {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }
}

/**
 * Retrieves the tags.
 * @param filters Tags filters.
 * @returns Tags.
 * @throws {InternalServerError} Server internal error.
 */
export async function getTags(filters: TagFilters) {
  const searchParams = new URLSearchParams();

  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }
  if (filters.offset) {
    searchParams.set("offset", String(filters.offset));
  }
  if (filters.sort) {
    searchParams.set("sort", filters.sort);
  }
  if (filters.order) {
    searchParams.set("order", filters.order);
  }

  const response = await fetch(`/api/tags?${searchParams}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
  });

  if (response.status >= 400) {
    throw new InternalServerError();
  }

  const paginatedTags = (await response.json()) as PaginatedTags;

  return paginatedTags;
}

/**
 * Retrieves the games of a given user's cart.
 * @param userId User ID.
 * @param [filters] User's cart filters.
 * @returns Paginated games.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {InternalServerError} Server internal error.
 */
export async function getUserCartGames(
  userId: string,
  filters?: UserCartGamesFilters,
) {
  const token = getToken();

  const searchParams = new URLSearchParams();
  if (filters?.limit) {
    searchParams.set("limit", String(filters.limit));
  }
  if (filters?.offset) {
    searchParams.set("offset", String(filters.offset));
  }
  if (filters?.sort) {
    searchParams.set("sort", filters.sort);
  }
  if (filters?.order) {
    searchParams.set("order", filters.order);
  }

  const response = await fetch(
    `/api/users/${userId}/cart/games?${searchParams}`,
    {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }

  const paginatedGames = (await response.json()) as PaginatedGames;

  return paginatedGames;
}

/**
 * Creates a user cart game association.
 * @param userId User ID.
 * @param gameId Game ID.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} User or game not found.
 * @throws {Conflict} Association already exists, or the game is not active,
 *                    or the game has not been released, or the user is not old
 *                    enough to play the game, or the user already has the game
 *                    in their library.
 * @throws {InternalServerError} Server internal error.
 */
export async function createUserCartGame(userId: string, gameId: string) {
  const token = getToken();

  const response = await fetch(`/api/users/${userId}/cart/games/${gameId}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }
}

/**
 * Deletes a user cart game association.
 * @param userId User ID.
 * @param gameId Game ID.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {Conflict} Association does not exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function deleteUserCartGame(userId: string, gameId: string) {
  const token = getToken();

  const response = await fetch(`/api/users/${userId}/cart/games/${gameId}`, {
    method: "DELETE",
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }
}

/**
 * Purchases a user shopping cart.
 * @param userId User ID.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} User not found.
 * @throws {Conflict} User cart is empty or the balance is insufficient.
 * @throws {InternalServerError} Server internal error.
 */
export async function purchaseUserCart(userId: string) {
  const token = getToken();

  const response = await fetch(`/api/users/${userId}/cart/purchase`, {
    method: "POST",
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status >= 400) {
    const error = (await response.json()) as ApiError;
    switch (response.status) {
      case 401:
        throw new Unauthorized(error.code, error.message);
      case 403:
        throw new Forbidden(error.code, error.message);
      case 404:
        throw new NotFound(error.code, error.message);
      case 409:
        throw new Conflict(error.code, error.message);
      default:
        throw new InternalServerError();
    }
  }
}
