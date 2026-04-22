import axios from "axios";

import { storage } from "../lib/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

export const bindAuthHandlers = (handlers: {
  onAccessTokenReceived: (token: string) => void;
  onUnauthorized: () => void;
}) => {
  const requestInterceptor = apiClient.interceptors.request.use((config) => {
    const token = storage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  const responseInterceptor = apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as typeof error.config & {
        _retry?: boolean;
      };

      if (
        error.response?.status === 401 &&
        !originalRequest?._retry &&
        !String(originalRequest?.url ?? "").includes("/auth/")
      ) {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = apiClient
            .post("/auth/refresh", {})
            .then((response) => {
              const token = response.data?.data?.accessToken as string | undefined;

              if (!token) {
                throw new Error("Refresh response did not contain an access token.");
              }

              handlers.onAccessTokenReceived(token);
              return token;
            })
            .catch((refreshError) => {
              handlers.onUnauthorized();
              throw refreshError;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const freshToken = await refreshPromise;

        if (freshToken && originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        }

        return apiClient(originalRequest);
      }

      return Promise.reject(error);
    },
  );

  return () => {
    apiClient.interceptors.request.eject(requestInterceptor);
    apiClient.interceptors.response.eject(responseInterceptor);
  };
};
