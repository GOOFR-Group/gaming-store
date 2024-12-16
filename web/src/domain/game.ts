import { Multimedia } from "./multimedia";

/**
 * Represents a multimedia resource of the store.
 */
export interface Game {
  id: number;
  ageRating: number;
  createdAt: string;
  description: string;
  downloadMultimedia: Multimedia;
  features: string;
  isActive: boolean;
  languages: string[];
  modifiedAt: Date;
  multimedia: Multimedia[];
  previewMultimedia: Multimedia[];
  price: number;
  publisher: Publisher;
  releaseDate: Date;
  requirements: string[];
  tags: string[];
  title: string;
}

// ttemp
interface Publisher {
  address: string;
  country: string;
  createdAt: string; // ISO 8601 date string
  email: string;
  id: string; // UUID
  modifiedAt: string; // ISO 8601 date string
  name: string;
  vatin: string; // VAT identification number
}

/**
 * Represents a multimedia resource of the store.
 */
export interface GameList {
  games: Game[];
  total: number;
}
