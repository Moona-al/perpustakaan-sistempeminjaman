'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  username: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateSession: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('perpus_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setTimeout(() => {
          setUser(parsed);
        }, 0);
      } catch (e) {
        console.error('Failed to parse session', e);
      }
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 0);
  }, []);

  const login = async (username: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('perpus_session', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('perpus_session');
    router.push('/');
  };

  const updateSession = (updatedUser: User) => {
    const currentUser = user;
    if (currentUser && currentUser.username !== updatedUser.username) {
      // Migrate favorites key in localStorage if username changes
      const oldKey = `perpus_favorites_${currentUser.username.toLowerCase().trim()}`;
      const newKey = `perpus_favorites_${updatedUser.username.toLowerCase().trim()}`;
      const favs = localStorage.getItem(oldKey);
      if (favs) {
        localStorage.setItem(newKey, favs);
        localStorage.removeItem(oldKey);
      }
    }
    setUser(updatedUser);
    localStorage.setItem('perpus_session', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateSession }}>
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
