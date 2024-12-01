import { Multimedia } from "./multimedia";
import { Publisher } from "./publisher";
import { Tag } from "./tag";

interface ToBeAnnouncedGame {
  id: string;
  publisher: Publisher;
  title: string;
  price: number;
  isActive: boolean;
  description: string;
  features: string;
  ageRating: string;
  multimedia: Multimedia[];
  tags: Tag[];
  languages: string[];
  requirements: {
    minimum: string;
    recommended: string;
  };
  previewMultimedia: Multimedia;
  createdAt: string;
  modifiedAt: string;
}

interface AnnouncedGame extends ToBeAnnouncedGame {
  releaseDate: string;
  downloadMultimedia: Multimedia;
}

export type Game = AnnouncedGame | ToBeAnnouncedGame;

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
