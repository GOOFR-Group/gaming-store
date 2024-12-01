import { Multimedia } from "./multimedia";

export interface Publisher {
  id: string;
  email: string;
  name: string;
  address: string;
  country: string;
  vatin: string;
  pictureMultimedia: Multimedia;
  createdAt: string;
  modifiedAt: string;
}
