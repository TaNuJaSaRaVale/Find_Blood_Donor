import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../api/client';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

/** Keeps the logged-in user available to every page via useAuth(). */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { user: fresh } = await authApi.me();
    setUser(fresh);
    return fresh;
  }, []);

  // On first load, restore the session from the saved token
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    refreshUser().catch(logout).finally(() => setLoading(false));
  }, [refreshUser, logout]);

  // Any 401 from the API (expired token) logs the user out
  useEffect(() => {
    window.addEventListener('raktsetu:unauthorized', logout);
    return () => window.removeEventListener('raktsetu:unauthorized', logout);
  }, [logout]);

  const saveSession = ({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refreshUser,
      logout,
      login: async (email, password) => saveSession(await authApi.login({ email, password })),
      register: async (form) => saveSession(await authApi.register(form)),
    }),
    [user, loading, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
