import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import { authApi } from "../api/auth-api";
import { bindAuthHandlers } from "../api/client";
import { storage } from "../lib/storage";
import type { AuthPayload, AuthUser, LoginInput, RegisterInput } from "../types/auth";

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  setSession: (payload: AuthPayload) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const getInitialUser = () => storage.getUser<AuthUser>();

export const AuthProvider = ({ children }: PropsWithChildren): ReactNode => {
  const [accessToken, setAccessToken] = useState<string | null>(() => storage.getAccessToken());
  const [user, setUser] = useState<AuthUser | null>(() => getInitialUser());
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = () => {
    storage.clear();
    setAccessToken(null);
    setUser(null);
  };

  const setSession = (payload: AuthPayload) => {
    storage.setAccessToken(payload.accessToken);
    storage.setUser(payload.user);
    setAccessToken(payload.accessToken);
    setUser(payload.user);
  };

  useEffect(() => {
    const unbind = bindAuthHandlers({
      onAccessTokenReceived: (token) => {
        storage.setAccessToken(token);
        setAccessToken(token);
      },
      onUnauthorized: () => {
        clearSession();
      },
    });

    return unbind;
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!accessToken) {
        storage.setUser(null);
        setUser(null);
        setIsInitializing(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();

        if (profile.data) {
          storage.setUser(profile.data);
          setUser(profile.data);
        }
      } catch {
        clearSession();
      } finally {
        setIsInitializing(false);
      }
    };

    void bootstrapAuth();
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isInitializing,
      user,
      async login(input) {
        const response = await authApi.login(input);

        if (!response.data) {
          throw new Error("Login failed.");
        }

        setSession(response.data);
      },
      async logout() {
        try {
          await authApi.logout();
        } finally {
          clearSession();
        }
      },
      async register(input) {
        const response = await authApi.register(input);

        if (!response.data) {
          throw new Error("Registration failed.");
        }

        setSession(response.data);
      },
      setSession,
    }),
    [accessToken, isInitializing, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
