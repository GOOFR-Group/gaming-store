import { Multimedia } from "./multimedia";

/**
 * Represents a user of the store.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  dateOfBirth: string;
  address: string;
  country: string;
  vatin: string;
  balance: number;
  pictureMultimedia: Multimedia | null;
  createdAt: string;
  modifiedAt: string;
}

/**
 * Represents a new user of the store.
 */
export interface NewUser {
  username: string;
  email: string;
  password: string;
  displayName: string;
  dateOfBirth: string;
  address: string;
  country: string;
  vatin: string;
}

/**
 * Represents a update user of the store.
 */
export interface UpdateUser {
  username?: string;
  email?: string;
  displayName?: string;
  dateOfBirth?: string;
  address?: string;
  country?: string;
  vatin?: string;
  balance?: number;
  pictureMultimediaId?: string;
}

/**
 * Represents the user credentials to sign in.
 */
export interface UserCredentials {
  username?: string;
  email?: string;
  password: string;
}
