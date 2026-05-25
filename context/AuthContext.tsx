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
  login: (username: string, password: string, role: 'admin' | 'user') => boolean;
  logout: () => void;
  isLoading: boolean;
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
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse session', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string, role: 'admin' | 'user'): boolean => {
    // Basic mock credentials validation
    if (role === 'admin' && username.toLowerCase() === 'admin' && password === 'admin123') {
      const newUser: User = { username: 'admin', name: 'Administrator', role: 'admin' };
      setUser(newUser);
      localStorage.setItem('perpus_session', JSON.stringify(newUser));
      return true;
    } else if (role === 'user' && username.trim() !== '' && password === 'user321') {
      // Map other entries to mock users or dynamic students
      const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
      const newUser: User = { 
        username: username.toLowerCase().trim(), 
        name: formattedName, 
        role: 'user' 
      };
      setUser(newUser);
      localStorage.setItem('perpus_session', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('perpus_session');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
