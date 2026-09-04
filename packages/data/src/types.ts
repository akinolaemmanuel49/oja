/** Backend error response envelope. */
export interface ErrorResponse {
  detail: string | Array<{ msg: string; loc: string[]; type: string }>;
}

/** Paginated list response shared by list endpoints. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

/** Generic list request params. */
export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

/** Extracts a human-friendly message from an axios-shaped error. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: ErrorResponse } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
      return detail.map((d) => d.msg).join(", ");
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
