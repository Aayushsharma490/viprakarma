'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  phone?: string;
  canChatWithAstrologer?: boolean;
  isMahuratSubscribed?: boolean;
  mahuratSubscriptionExpiry?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  adminToken: string | null;
  login: (token: string, user: User) => void;
  adminLogin: (token: string, user: User) => void;
  logout: () => void;
  adminLogout: () => void;
  refreshUser: () => Promise<void>;
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

    if (storedAdminToken) {
      let validatedToken: string | null = null;

      // If the token is a plain string and looks like a JWT, use it directly.
      if (typeof storedAdminToken === 'string' && storedAdminToken.split('.').length === 3) {
        validatedToken = storedAdminToken;
      } else {
        // Otherwise, attempt to parse it as it might be a JSON object string.
        try {
          const parsed = JSON.parse(storedAdminToken);
          if (parsed && typeof parsed === 'object') {
            validatedToken = parsed.token || parsed.accessToken || parsed.access_token || parsed.jwt || parsed.authToken || null;
          }
        } catch (e) {
          // It's not a valid JSON string, and not a JWT-like string.
          validatedToken = null;
        }
      }

      if (validatedToken) {
        // If we have a valid token, ensure it's set in state and localStorage.
        if (storedAdminToken !== validatedToken) {
          localStorage.setItem('admin_token', validatedToken);
        }
        if (storedAdminUser) {
          try {
            const parsedAdminUser = JSON.parse(storedAdminUser);
            setAdminToken(validatedToken);
            setUser(parsedAdminUser);
          } catch (error) {
            console.error('Failed to parse stored admin user:', error);
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
          }
        } else {
          setAdminToken(validatedToken);
        }
      } else {
        // If no valid token could be found, clear storage.
        console.warn('Found invalid or unrecoverable admin_token in localStorage; clearing it.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Ensure we always write a string token to localStorage.
    let safeToken: string;
    if (typeof newToken === 'string') safeToken = newToken;
    else if (newToken && typeof newToken === 'object' && 'token' in (newToken as any)) safeToken = String((newToken as any).token);
    else safeToken = String(newToken);

    localStorage.setItem('token', safeToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(safeToken);
    setUser(newUser);
  };

  const adminLogin = (newToken: string, newUser: User) => {
    // Ensure we always write a string token to localStorage.
    let safeToken: string;
    if (typeof newToken === 'string') safeToken = newToken;
    else if (newToken && typeof newToken === 'object' && 'token' in (newToken as any)) safeToken = String((newToken as any).token);
    else safeToken = String(newToken);

    localStorage.setItem('admin_token', safeToken);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
    setAdminToken(safeToken);
    setUser(newUser);
  };

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else if (response.status === 401) {
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
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
      refreshUser,
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
