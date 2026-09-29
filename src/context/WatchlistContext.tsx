import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchlistContextType {
  watchlistCodes: string[];
  isWatchlisted: (code: string) => boolean;
  toggleWatchlist: (code: string) => void;
  addToWatchlist: (code: string) => void;
  removeFromWatchlist: (code: string) => void;
}

const STORAGE_KEY = 'ai_invest_watchlist_codes';
const DEFAULT_WATCHLIST = ['005930', '035420', '035720', 'AAPL', 'NVDA', 'TSLA'];

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlistCodes, setWatchlistCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load watchlist from localStorage', e);
    }
    return DEFAULT_WATCHLIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlistCodes));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlistCodes]);

  const isWatchlisted = (code: string) => watchlistCodes.includes(code);

  const toggleWatchlist = (code: string) => {
    setWatchlistCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const addToWatchlist = (code: string) => {
    setWatchlistCodes(prev => (prev.includes(code) ? prev : [...prev, code]));
  };

  const removeFromWatchlist = (code: string) => {
    setWatchlistCodes(prev => prev.filter(c => c !== code));
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlistCodes,
        isWatchlisted,
        toggleWatchlist,
        addToWatchlist,
        removeFromWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
