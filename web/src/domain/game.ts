import { Multimedia } from "./multimedia";
import { Tag } from "./tag";

/**
 * Represents a game.
 */
export interface Game {
  id: string;
  publisherId: string;
  title: string;
  price: number;
  isActive: boolean;
  releaseDate?: string;
  description: string;
  features: string;
  tags: Tag[];
  languages: string[];
  requirements: {
    minimum: string;
    recommended: string;
  };
  previewMultimedia: Multimedia;
  downloadMultimedia?: Multimedia;
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
