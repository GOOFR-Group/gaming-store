import { Multimedia } from "./multimedia";
import { Tag } from "./tag";

export interface Game {
  id: string;
  publisherId: string;
  title: string;
  price: number;
  isActive: boolean;
  releaseDate: string;
  description: string;
  features: string;
  tags: Tag[];
  languages: string[];
  requirements: {
    minimum: string;
    recommended: string;
  };
  previewMultimedia: Multimedia;
  downloadMultimedia: Multimedia;
  createdAt: string;
  modifiedAt: string;
}

export interface PaginatedGames {
  games: Game[];
  total: number;
}

export interface GamesFilters {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
  title?: string;
  genres?: number[];
}
