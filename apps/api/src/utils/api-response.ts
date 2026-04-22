export interface ApiResponseMeta {
  [key: string]: unknown;
}

export interface ApiResponseBody<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: ApiResponseMeta;
}

export const createApiResponse = <T>(
  message: string,
  data?: T,
  meta?: ApiResponseMeta,
): ApiResponseBody<T> => ({
  success: true,
  message,
  ...(data !== undefined ? { data } : {}),
  ...(meta ? { meta } : {}),
});
