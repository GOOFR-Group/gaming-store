import { ApiError } from "@/domain/error";
import { Jwt } from "@/domain/jwt";
import { Multimedia } from "@/domain/multimedia";
import {
  NewPublisher,
  Publisher,
  PublisherCredentials,
} from "@/domain/publisher";
import { EditableUser, NewUser, User, UserCredentials } from "@/domain/user";

import { getToken } from "./auth";
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
 * Signs in a user with their credentials.
 * @param credentials User credentials.
 * @returns JWT.
 * @throws {Unauthorized} Incorrect credentials.
 * @throws {InternalServerError} Server internal error.
 */
export async function signInPublisher(credentials: PublisherCredentials) {
  const response = await fetch("/api/publishers/signin", {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    method: "POST",
    credentials: "include",
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
