export interface PaginatedResponse<T> {
  total?: number;
  limit?: number;
  offset?: number;
  data: T[];
}
export class DataCollection<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
export function GetPages(take: number, total: number): number {
  if (take <= 0 || take >= total) return 1;
  return Math.ceil(total / take);
}
