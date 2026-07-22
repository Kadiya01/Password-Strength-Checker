export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: PaginationQuery): ParsedPagination {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}
