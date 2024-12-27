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

/**
 * Represents temporary multimedia that has not yet been uploaded to the server.
 */
export interface TemporaryMultimedia {
  id: string;
  file: File;
}
