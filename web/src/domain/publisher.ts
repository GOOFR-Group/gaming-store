import { Multimedia } from "./multimedia";

/**
 * Represents a publisher.
 */
export interface Publisher {
  id: string;
  email: string;
  name: string;
  address: string;
  country: string;
  vatin: string;
  pictureMultimedia?: Multimedia;
  createdAt: string;
  modifiedAt: string;
}

/**
 * Represents a new publisher.
 */
export interface NewPublisher {
  email: string;
  password: string;
  name: string;
  address: string;
  country: string;
  vatin: string;
  pictureMultimediaId?: string;
}

/**
 * Represents an editable publisher.
 */
export interface EditablePublisher {
  email?: string;
  name?: string;
  address?: string;
  country?: string;
  vatin?: string;
  pictureMultimediaId?: string;
}

/**
 * Represents the publisher credentials to sign in.
 */
export interface PublisherCredentials {
  email: string;
  password: string;
}
