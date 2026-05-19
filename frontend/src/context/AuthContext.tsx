import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { User, UserRole, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const persist = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    if (!data.data) throw new Error('Login failed');
    persist(data.data.token, data.data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role?: UserRole) => {
    const { data } = await authApi.register(name, email, password, role);
    if (!data.data) throw new Error('Registration failed');
    persist(data.data.token, data.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
