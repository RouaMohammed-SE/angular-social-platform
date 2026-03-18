export interface Pagination {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
  total: number;
}

export interface PaginationMeta {
  pagination: Pagination;
}
