/**
 * Represents a multimedia resource of the store.
 */
export interface Multimedia {
  id: string;
  checksum: number;
  mediaType: string;
  url: string;
  createdAt: string;
}

export interface TemporaryMultimedia {
  id: string;
  file: File;
}
