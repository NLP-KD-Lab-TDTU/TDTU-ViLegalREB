import React from 'react';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { useLeaderboard } from '../context/LeaderboardContext';

export const LeaderboardPage: React.FC = () => {
  const { entries, mode, setMode, track, setTrack, isLoading, error, refreshLeaderboard } =
    useLeaderboard();

  return (
    <div className="leaderboard-page-container">
      <div className="page-header-simple">
        <div className="page-title-group">
          <h1 className="page-title">Leaderboard Rankings ({entries.length} models)</h1>
          <p className="page-subtitle">
            Comprehensive evaluation results across Vietnamese legal retrieval benchmarks.
          </p>
        </div>
      </div>

      <LeaderboardTable
        entries={entries}
        mode={mode}
        onModeChange={setMode}
        track={track}
        onTrackChange={setTrack}
        isLoading={isLoading}
        error={error}
        onRetry={refreshLeaderboard}
      />
    </div>
  );
};
