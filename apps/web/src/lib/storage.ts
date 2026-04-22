const ACCESS_TOKEN_KEY = "primeguard_access_token";
const USER_KEY = "primeguard_user";

export const storage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string | null): void {
    if (!token) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser(value: unknown): void {
    if (!value) {
      localStorage.removeItem(USER_KEY);
      return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify(value));
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
