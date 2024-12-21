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
