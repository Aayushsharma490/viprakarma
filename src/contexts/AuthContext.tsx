'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  adminToken: string | null;
  login: (token: string, user: User) => void;
  adminLogin: (token: string, user: User) => void;
  logout: () => void;
  adminLogout: () => void;
  isLoading: boolean;
  isAdminLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Auto-login on mount for regular users
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Auto-login for admin
    const storedAdminToken = localStorage.getItem('admin_token');
    const storedAdminUser = localStorage.getItem('admin_user');

    if (storedAdminToken && storedAdminUser) {
      try {
        const parsedAdminUser = JSON.parse(storedAdminUser);
        setAdminToken(storedAdminToken);
        setUser(parsedAdminUser);
      } catch (error) {
        console.error('Failed to parse stored admin user:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const adminLogin = (newToken: string, newUser: User) => {
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
    setAdminToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    if (!adminToken) {
      setUser(null);
    }
    router.push('/');
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdminToken(null);
    if (!token) {
      setUser(null);
    }
    router.push('/');
  };

  const isAdminLoggedIn = !!adminToken;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      adminToken,
      login,
      adminLogin,
      logout,
      adminLogout,
      isLoading,
      isAdminLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
