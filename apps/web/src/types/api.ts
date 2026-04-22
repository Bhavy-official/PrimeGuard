export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  meta?: Record<string, unknown>;
  errors?: unknown;
}
