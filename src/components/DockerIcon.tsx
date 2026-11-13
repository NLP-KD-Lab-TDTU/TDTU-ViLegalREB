import React from 'react';

interface DockerIconProps {
  size?: number;
  className?: string;
}

export function hasDockerSubmission(entry: { docker?: boolean | string | null }): boolean {
  if (typeof entry.docker === 'string') {
    return entry.docker.trim().length > 0;
  }
  return Boolean(entry.docker);
}

/**
 * Crisp inline Docker container whale icon used across leaderboard tables and footnotes.
 */
export const DockerIcon: React.FC<DockerIconProps> = ({ size = 17, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className ? `docker-whale-svg ${className}` : 'docker-whale-svg'}
    aria-hidden="true"
  >
    {/* Stacked container boxes */}
    <rect x="3.0" y="9.3" width="2.5" height="2.25" rx="0.35" />
    <rect x="6.1" y="9.3" width="2.5" height="2.25" rx="0.35" />
    <rect x="9.2" y="9.3" width="2.5" height="2.25" rx="0.35" />
    <rect x="12.3" y="9.3" width="2.5" height="2.25" rx="0.35" />
    <rect x="6.1" y="6.5" width="2.5" height="2.25" rx="0.35" />
    <rect x="9.2" y="6.5" width="2.5" height="2.25" rx="0.35" />
    <rect x="12.3" y="6.5" width="2.5" height="2.25" rx="0.35" />
    <rect x="9.2" y="3.7" width="2.5" height="2.25" rx="0.35" />

    {/* Whale body and tail */}
    <path d="M2.0 12.15H16.3C17.2 12.15 17.8 11.7 18.0 11.0C17.9 9.7 18.4 8.5 19.3 8.0C19.9 8.9 20.0 9.7 19.7 10.5C20.7 10.1 21.8 10.2 22.5 10.7C22.0 11.8 21.1 12.7 20.1 13.0C18.6 17.2 14.5 19.6 9.2 19.6C4.2 19.6 1.5 16.9 1.5 13.5V13.2C1.5 12.4 1.65 12.15 2.0 12.15Z" />
  </svg>
);

/**
 * Shared table cell indicator showing either the Docker icon or an empty muted dash.
 */
export const DockerCellStatus: React.FC<{ docker?: boolean | string | null }> = ({ docker }) => {
  if (hasDockerSubmission({ docker })) {
    return (
      <span
        className="docker-status-badge"
        title="Docker container submitted for reproducible evaluation"
        aria-label="Docker container submitted"
      >
        <DockerIcon size={17} />
      </span>
    );
  }

  return (
    <span
      className="docker-empty"
      title="No Docker container submitted"
      aria-label="No Docker container submitted"
    >
      -
    </span>
  );
};

