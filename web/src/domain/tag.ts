export interface Tag {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
}

export interface TagFilters {
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedTags {
  total: number;
  tags: Tag[];
}
