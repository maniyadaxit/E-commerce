import { createContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  login,
  logout,
  ownerLogin,
  register,
  updateProfile,
} from "../api/authApi";
import {
  clearAuthTokens,
  getAccessToken,
  setAuthTokens,
} from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        clearAuthTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async login(values) {
        const response = await login(values);
        setAuthTokens(response);
        setUser(response.user);
        return response;
      },
      async ownerLogin(values) {
        const response = await ownerLogin(values);
        setAuthTokens(response);
        setUser(response.user);
        return response;
      },
      async register(values) {
        const response = await register(values);
        setAuthTokens(response);
        setUser(response.user);
        return response;
      },
      async logout() {
        await logout();
        clearAuthTokens();
        setUser(null);
      },
      async refreshProfile() {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        return currentUser;
      },
      async updateProfile(values) {
        const nextUser = await updateProfile(values);
        setUser(nextUser);
        return nextUser;
      },
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
