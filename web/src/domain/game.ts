import { Multimedia } from "./multimedia";
import { Publisher } from "./publisher";
import { Tag } from "./tag";

/**
 * Represents a game.
 */
export interface Game {
  id: string;
  publisher: Publisher;
  title: string;
  price: number;
  isActive: boolean;
  releaseDate?: string;
  description: string;
  ageRating: string;
  features: string;
  languages: string[];
  requirements: {
    minimum: string;
    recommended: string;
  };
  previewMultimedia: Multimedia;
  downloadMultimedia?: Multimedia;
  tags: Tag[];
  createdAt: string;
  modifiedAt: string;
}

/**
 * Represents games with pagination.
 */
export interface PaginatedGames {
  games: Game[];
  total: number;
}

/**
 * Represents the filters available for filtering games.
 */
export interface GamesFilters {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
  publisherId?: string;
  title?: string;
  priceUnder?: number;
  priceAbove?: number;
  isActive?: boolean;
  releaseDateBefore?: string;
  releaseDateAfter?: string;
  tagIds?: number[];
}
