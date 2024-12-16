export interface Game {
  id: string;
  title: string;
  publisher: string;
  genres: string[];
  releaseDate: Date;
  about: string;
  features: string;
  languages: string[];
  systemRequirements: {
    minimum: string;
    recommended: string;
  };
  screenshots: string[];
  ageRating: number;
  price: number;
  isActive: boolean;
}
