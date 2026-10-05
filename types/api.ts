export type ApiResposta<T> = {
  message?: string;
  data: T;
  errors?: (string | { message?: string; path?: string })[];
};


export type Paginado<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};
