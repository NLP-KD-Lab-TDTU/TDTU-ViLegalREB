import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LeaderboardEntry, RelevanceMode, TrackFilter } from '../types';
import { fetchLeaderboardApi } from '../api';

interface LeaderboardContextType {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  mode: RelevanceMode;
  setMode: (mode: RelevanceMode) => void;
  track: TrackFilter;
  setTrack: (track: TrackFilter) => void;
  refreshLeaderboard: () => Promise<void>;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mode, setMode] = useState<RelevanceMode>('core');
  const [track, setTrack] = useState<TrackFilter>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboardApi();
      setEntries(data);
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  return (
    <LeaderboardContext.Provider
      value={{
        entries,
        isLoading,
        error,
        mode,
        setMode,
        track,
        setTrack,
        refreshLeaderboard,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = (): LeaderboardContextType => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};
