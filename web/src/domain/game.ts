import { Multimedia } from "./multimedia";
import { Publisher } from "./publisher";
import { Tag } from "./tag";

/**
 * Represents a game that is not announced.
 */
interface ToBeAnnouncedGame {
  id: string;
  publisher: Publisher;
  title: string;
  price: number;
  isActive: boolean;
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
  multimedia: Multimedia[];
  releaseDate?: string;
  tags: Tag[];
  createdAt: string;
  modifiedAt: string;
}

/**
 * Represents a game that is announced.
 */
interface AnnouncedGame extends ToBeAnnouncedGame {
  releaseDate: string;
  downloadMultimedia: Multimedia;
}

/**
 * Represents a game.
 */
export type Game = AnnouncedGame | ToBeAnnouncedGame;

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

/**
 * Represents the filters available for filtering recommended games.
 */
export interface RecommendedGamesFilters {
  limit?: number;
  offset?: number;
  userId?: string;
}

/**
 * Represents a new game.
 */
export interface NewGame {
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
  previewMultimediaId: string;
  downloadMultimediaId?: string;
}

/**
 * Represents an editable game.
 */
export interface EditableGame {
  title?: string;
  price?: number;
  isActive?: boolean;
  releaseDate?: string;
  description?: string;
  ageRating?: string;
  features?: string;
  languages?: string[];
  requirements?: {
    minimum: string;
    recommended: string;
  };
  previewMultimediaId?: string;
  downloadMultimediaId?: string;
}
