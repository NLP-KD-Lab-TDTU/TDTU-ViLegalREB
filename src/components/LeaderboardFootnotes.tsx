import React from 'react';
import { Layers2 } from 'lucide-react';
import { DockerIcon } from './DockerIcon';

/**
 * Shared table legend explaining track and Docker submission icons across Preview and Full leaderboards.
 */
export const LeaderboardFootnotes: React.FC = () => (
  <div className="table-footnote" aria-label="Table footnotes">
    <span className="table-footnote-item">
      <Layers2 size={13} strokeWidth={2.2} className="stage-icon" aria-hidden="true" />
      <span>
        Indicates models evaluated on the 2-Stage retrieval track. Models without this icon evaluate on Full Corpus retrieval.
      </span>
    </span>
    <span className="table-footnote-item">
      <span className="docker-status-badge" aria-hidden="true">
        <DockerIcon size={15} />
      </span>
      <span>Indicates models that have submitted a Docker container for reproducible evaluation.</span>
    </span>
  </div>
);

