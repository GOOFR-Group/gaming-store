import { ApiError } from "@/domain/error";
import { NewUser, User } from "@/domain/user";

import { Conflict, InternalServerError } from "./errors";

/**
 * Creates a new user.
 * @param newUser User to be created.
 * @returns User created.
 * @throws {Conflict} Username, email or vatin already exist.
 * @throws {InternalServerError} Server internal error.
 */
export async function createUser(newUser: NewUser) {
  const response = await fetch("/api/users", {
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
