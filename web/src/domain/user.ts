import { Multimedia } from "./multimedia";

/**
 * Represents a user.
 */
export interface User {
  library: string[];
  id: string;
  username: string;
  email: string;
  displayName: string;
  dateOfBirth: string;
  address: string;
  country: string;
  vatin: string;
  balance: number;
  pictureMultimedia?: Multimedia;
  createdAt: string;
  modifiedAt: string;
}

/**
 * Represents a new user.
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
 * Represents an editable user.
 */
export interface EditableUser {
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
