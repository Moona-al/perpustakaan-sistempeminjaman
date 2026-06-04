'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Initialize and synchronize favorites from localStorage based on username
  useEffect(() => {
    if (!user?.username) {
      setTimeout(() => {
        setFavorites([]);
      }, 0);
      return;
    }

    const key = `perpus_favorites_${user.username.toLowerCase().trim()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setFavorites(parsed);
        }, 0);
      } catch (err) {
        console.error('Failed to parse favorites from localStorage:', err);
        setTimeout(() => {
          setFavorites([]);
        }, 0);
      }
    } else {
      setTimeout(() => {
        setFavorites([]);
      }, 0);
    }
  }, [user?.username]);

  const toggleFavorite = (bookId: string) => {
    if (!user?.username) return;
    
    const key = `perpus_favorites_${user.username.toLowerCase().trim()}`;
    setFavorites(prev => {
      const updated = prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId];
        
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (bookId: string) => {
    return favorites.includes(bookId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
