import { ApiError } from "@/domain/error";
import { Game, PaginatedGames } from "@/domain/game";
import { Jwt } from "@/domain/jwt";
import { Multimedia } from "@/domain/multimedia";
import { PaginatedTags, TagFilters } from "@/domain/tag";
import { EditableUser, NewUser, User, UserCredentials } from "@/domain/user";

import { getToken } from "./auth";
import { LANGUAGES_MAP } from "./constants";
import {
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
 * Retrieves the games of a publisher.
 * @param id Publisher ID.
 * @returns Games of a publisher.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} Publisher not found.
 * @throws {InternalServerError} Server internal error.
 */
export async function getPublisherGames(id: string) {
  const games: PaginatedGames = {
    total: 1,
    games: [
      {
        id: "9e3a65b0-0579-4203-8112-d09ab3c6b1ff",
        publisherId: id,
        title: "Jump Master",
        price: 0,
        isActive: false,
        releaseDate: "2017-07-21",
        description: "string",
        features: "string",
        languages: [LANGUAGES_MAP.EN.code, LANGUAGES_MAP.PT.code],
        requirements: {
          minimum: "string",
          recommended: "string",
        },
        previewMultimedia: {
          id: "9e3a65b0-0579-4203-8112-d09ab3c6b1ff",
          checksum: 0,
          mediaType: "string",
          url: "string",
          createdAt: "2017-07-21T17:32:28Z",
        },
        downloadMultimedia: {
          id: "9e3a65b0-0579-4203-8112-d09ab3c6b1ff",
          checksum: 0,
          mediaType: "string",
          url: "string",
          createdAt: "2017-07-21T17:32:28Z",
        },
        createdAt: "2017-07-21T17:32:28Z",
        modifiedAt: "2017-07-21T17:32:28Z",
      },
    ],
  };
  const response = new Response(JSON.stringify(games), {
    status: 200,
  });
  // const response = await fetch(`/api/publisher/${id}/games`, {
  //   signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // });

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

  const paginatedGames = (await response.json()) as PaginatedGames;

  return paginatedGames;
}

/**
 * Retrieves a game from a publisher.
 * @param publisherId Publisher ID.
 * @returns Games of a publisher.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} Game not found.
 * @throws {InternalServerError} Server internal error.
 */
export async function getPublisherGame(publisherId: string, gameId: string) {
  const token = getToken();

  const response = await fetch(
    `/api/publisher/${publisherId}/games/${gameId}`,
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
 * Retrieves the tags.
 * @param filters Tags filters.
 * @returns Tags.
 * @throws {Unauthorized} Access token is invalid.
 * @throws {Forbidden} Forbidden access.
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

  const paginatedTags = (await response.json()) as PaginatedTags;

  return paginatedTags;
}
