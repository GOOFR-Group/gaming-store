import { Multimedia } from "./multimedia";

/**
 * Represents a Publisher.
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
 * Represents a new NewPublisher/PublisherPost.
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
 * Represents an editable Publisher/PublisherPatch.
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
  email?: string;
  password: string;
}
