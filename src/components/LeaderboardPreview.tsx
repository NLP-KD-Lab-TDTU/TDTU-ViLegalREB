import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers2 } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { fmt, safeUrl, formatDate } from '../api';
import { DockerCellStatus } from './DockerIcon';
import { LeaderboardFootnotes } from './LeaderboardFootnotes';

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
}

export const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({
  entries,
  isLoading,
  error,
  onRetry,
}) => {
  // Always display all tracks and Core relevance (Grade >= 2), top 5 models sorted by primary metric (ndcg_10 desc)
  const top5Entries = useMemo(() => {
    const list = [...entries];
    list.sort((a, b) => {
      const scoreA = a.ndcg_10 ?? -1;
      const scoreB = b.ndcg_10 ?? -1;
      return scoreB - scoreA;
    });
    return list.slice(0, 10);
  }, [entries]);

  // Best scores across top 5 preview entries
  const bestScores = useMemo(() => {
    if (top5Entries.length === 0) return {};
    const findMax = (getter: (e: LeaderboardEntry) => number | null | undefined): number => {
      let max = -Infinity;
      for (const e of top5Entries) {
        const val = getter(e);
        if (val !== null && val !== undefined && !isNaN(val) && val > max) {
          max = val;
        }
      }
      return max > -Infinity ? max : -Infinity;
    };
    return {
      ndcg_10: findMax((e) => e.ndcg_10),
      ndcg_5: findMax((e) => e.ndcg_5),
      mrr_10: findMax((e) => e.mrr_10),
      recall_100: findMax((e) => e.recall_100),
      map_100: findMax((e) => e.map_100),
    };
  }, [top5Entries]);

  const isBest = (val: number | null | undefined, max: number | undefined): boolean => {
    if (val === null || val === undefined || isNaN(val) || max === undefined || max === -Infinity) {
      return false;
    }
    return Math.abs(val - max) < 1e-6;
  };

  return (
    <section id="leaderboard-preview" className="home-leaderboard-section" aria-labelledby="preview-title">
      <div className="home-section-inner preview-inner">
        <div className="preview-header-bar">
          <div className="preview-title-group">
            <h2 id="preview-title" className="preview-heading">
              Leaderboard Preview
            </h2>
            <p className="preview-subheading">
              Top 10 models evaluated across all tracks by nDCG@10, Core Relevance.
            </p>
          </div>
        </div>

      {/* Simplified Preview Table: Key Metrics Only (Core Relevance) */}
      <div className="table-wrap">
        <table className="preview-table">
          <thead>
            <tr>
              <th className="th-rank">#</th>
              <th className="th-model">Model</th>
              <th className="th-team">Author</th>
              <th className="th-param" title="Model Parameters">Param</th>
              <th className="th-docker" title="Docker container submitted for reproducible evaluation">
                Docker
              </th>
              <th className="th-date" title="Last Submission Date">
                Last Submission Date
              </th>
              <th className="th-num primary" title="Normalized Discounted Cumulative Gain @ 10 (Primary metric)">
                nDCG@10
              </th>
              <th className="th-num" title="Normalized Discounted Cumulative Gain @ 5">
                nDCG@5
              </th>
              <th className="th-num" title="Mean Reciprocal Rank @ 10 (Core Relevance)">
                MRR@10
              </th>
              <th className="th-num" title="Recall @ 100 (Core Relevance)">
                Recall@100
              </th>
              <th className="th-num" title="Mean Average Precision @ 100 (Core Relevance)">
                MAP@100
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="table-state-cell" colSpan={11}>
                  Loading benchmark preview...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="table-state-cell" colSpan={11}>
                  <span>{error}</span>{' '}
                  <button type="button" className="btn-inline-retry" onClick={onRetry}>
                    Retry
                  </button>
                </td>
              </tr>
            ) : top5Entries.length === 0 ? (
              <tr>
                <td className="table-state-cell" colSpan={11}>
                  No models evaluated yet.
                </td>
              </tr>
            ) : (
              top5Entries.map((item, index) => {
                const url = safeUrl(item.paper_url);
                const is2Stage = item.eval_mode === '2-stage';
                const rankNum = index + 1;

                return (
                  <tr key={item.id || `${item.model_name}-${index}`} className="preview-row">
                    <td className="td-rank">
                      <span className={`rank-value ${rankNum <= 3 ? 'rank-top' : ''}`}>
                        {rankNum}
                      </span>
                    </td>

                    <td className="td-model">
                      <div className="model-name-wrap">
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="model-link"
                            title={`${item.model_name}${is2Stage ? ' (2-Stage track)' : ''} (opens paper/repo)`}
                          >
                            <span>{item.model_name}</span>
                          </a>
                        ) : (
                          <span className="model-name-text">{item.model_name}</span>
                        )}
                        {is2Stage && (
                          <span
                            className="stage-icon"
                            title="2-Stage retrieval track"
                            aria-label="2-Stage retrieval track"
                          >
                            <Layers2 size={13} strokeWidth={2.2} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="td-team" title={item.team_name}>
                      {item.team_name}
                    </td>

                    <td className="td-param">
                      {item.parameters && item.parameters.trim() ? item.parameters.trim() : '-'}
                    </td>

                    <td className="td-docker">
                      <DockerCellStatus docker={item.docker} />
                    </td>

                    <td className="td-date" title={item.submitted_at ? new Date(item.submitted_at).toLocaleString() : undefined}>
                      {formatDate(item.submitted_at)}
                    </td>

                    {/* Key metrics with best-metric highlight */}
                    <td className={`td-num primary ${isBest(item.ndcg_10, bestScores.ndcg_10) ? 'cell-best-metric' : ''}`}>
                      {fmt(item.ndcg_10)}
                    </td>
                    <td className={`td-num ${isBest(item.ndcg_5, bestScores.ndcg_5) ? 'cell-best-metric' : ''}`}>
                      {fmt(item.ndcg_5)}
                    </td>
                    <td className={`td-num ${isBest(item.mrr_10, bestScores.mrr_10) ? 'cell-best-metric' : ''}`}>
                      {fmt(item.mrr_10)}
                    </td>
                    <td className={`td-num ${isBest(item.recall_100, bestScores.recall_100) ? 'cell-best-metric' : ''}`}>
                      {fmt(item.recall_100)}
                    </td>
                    <td className={`td-num ${isBest(item.map_100, bestScores.map_100) ? 'cell-best-metric' : ''}`}>
                      {fmt(item.map_100)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <LeaderboardFootnotes />

      {/* Navigation CTA to Full Leaderboard */}
      <div className="preview-nav-cta">
        <Link to="/leaderboard" className="btn-primary preview-full-btn">
          <span>View Full Leaderboard (All Models & Metrics)</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </section>
);
};
