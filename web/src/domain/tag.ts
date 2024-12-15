/**
 * Represents a tag.
 */
export interface Tag {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
}

/**
 * Represents tags with pagination.
 */
export interface PaginatedTags {
  total: number;
  tags: Tag[];
}

/**
 * Represents the filters available for filtering tags.
 */
export interface TagFilters {
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}
