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
  pictureId: string;
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
  pictureMultimediaId?: string;
}
