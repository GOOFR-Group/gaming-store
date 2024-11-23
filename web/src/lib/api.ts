import { ApiError } from "@/domain/error";
import { Jwt } from "@/domain/jwt";
import { NewUser, UpdateUser, User, UserCredentials } from "@/domain/user";

import { getToken } from "./auth";
import {
  Conflict,
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
 * Retrieves a user given an user ID.
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
 * @param details Updated user details.
 * @returns Updated user.
 * @throws {Unauthorized} Access token invalid.
 * @throws {Forbidden} Forbidden access.
 * @throws {NotFound} User not found.
 * @throws {Conflict} Username, email or vatin already exists. Or multimedia does not exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function updateUser(id: string, details: UpdateUser) {
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
