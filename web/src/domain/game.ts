import { Multimedia } from "./multimedia";

export interface Game {
  id: string;
  publisherId: string;
  title: string;
  price: number;
  isActive: boolean;
  releaseDate: string;
  description: string;
  features: string;
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
