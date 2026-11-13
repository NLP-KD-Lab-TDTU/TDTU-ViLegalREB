import React, { useState, useMemo } from 'react';
import { Download, Search, X, ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Layers2 } from 'lucide-react';
import { LeaderboardEntry, RelevanceMode, TrackFilter, SortField, SortDirection } from '../types';
import { fmt, safeUrl, formatDate } from '../api';
import { CategoryBarChart } from './CategoryBarChart';
import { DockerIcon, DockerCellStatus, hasDockerSubmission } from './DockerIcon';
import { LeaderboardFootnotes } from './LeaderboardFootnotes';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  mode: RelevanceMode;
  onModeChange: (mode: RelevanceMode) => void;
  track: TrackFilter;
  onTrackChange: (track: TrackFilter) => void;
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
}

interface RankedLeaderboardEntry extends LeaderboardEntry {
  benchmarkRank: number;
}

function parseParamValue(param?: string | null): number {
  if (!param) return -1;
  const p = param.trim().replace(/[,_\s]/g, '').toUpperCase();
  if (p === '--' || p === '—' || p === '-') return -1;
  const match = p.match(/^([0-9.]+)\s*([KMBT]?)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return -1;
  const unit = match[2];
  if (unit === 'B') return num * 1e9;
  if (unit === 'M') return num * 1e6;
  if (unit === 'K') return num * 1e3;
  if (unit === 'T') return num * 1e12;
  return num;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  mode,
  onModeChange,
  track,
  onTrackChange,
  isLoading,
  error,
  onRetry,
}) => {
  const isCore = mode === 'core';

  // Table state
  const [sortField, setSortField] = useState<SortField>('ndcg_10');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // Track filter
      if (track !== 'all') {
        const itemTrack = item.eval_mode === '2-stage' ? '2-stage' : 'full';
        if (itemTrack !== track) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.model_name.toLowerCase().includes(q);
        const matchTeam = item.team_name.toLowerCase().includes(q);
        if (!matchName && !matchTeam) return false;
      }
      return true;
    });
  }, [entries, track, searchQuery]);

  // Baseline benchmark rank computed from primary metric (ndcg_10 descending)
  const rankedEntries = useMemo<RankedLeaderboardEntry[]>(() => {
    const list = [...filteredEntries];
    list.sort((a, b) => {
      const diff = (b.ndcg_10 ?? -Infinity) - (a.ndcg_10 ?? -Infinity);
      if (diff !== 0) return diff;
      return a.model_name.localeCompare(b.model_name);
    });

    return list.map((item, idx) => ({
      ...item,
      benchmarkRank: idx + 1,
    }));
  }, [filteredEntries]);

  // Sort entries
  const sortedEntries = useMemo<RankedLeaderboardEntry[]>(() => {
    const list = [...rankedEntries];

    list.sort((a, b) => {
      if (sortField === 'rank') {
        return sortDirection === 'asc'
          ? a.benchmarkRank - b.benchmarkRank
          : b.benchmarkRank - a.benchmarkRank;
      }
      if (sortField === 'model_name') {
        const diff = a.model_name.localeCompare(b.model_name);
        return sortDirection === 'asc' ? diff : -diff;
      }
      if (sortField === 'team_name') {
        const diff = a.team_name.localeCompare(b.team_name);
        return sortDirection === 'asc' ? diff : -diff;
      }
      if (sortField === 'eval_mode') {
        const diff = (a.eval_mode || 'full').localeCompare(b.eval_mode || 'full');
        return sortDirection === 'asc' ? diff : -diff;
      }
      if (sortField === 'parameters') {
        const valA = parseParamValue(a.parameters);
        const valB = parseParamValue(b.parameters);
        if (valA !== valB) {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return a.benchmarkRank - b.benchmarkRank;
      }
      if (sortField === 'docker') {
        const valA = hasDockerSubmission(a) ? 1 : 0;
        const valB = hasDockerSubmission(b) ? 1 : 0;
        if (valA !== valB) {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return a.benchmarkRank - b.benchmarkRank;
      }

      // Numeric comparator helper
      const getVal = (item: LeaderboardEntry): number => {
        switch (sortField) {
          case 'ndcg_10':
            return item.ndcg_10 ?? -Infinity;
          case 'ndcg_5':
            return item.ndcg_5 ?? -Infinity;
          case 'mrr_10':
            return (isCore ? item.mrr_10 : item.mrr_10_all) ?? -Infinity;
          case 'recall_5':
            return (isCore ? item.recall_5 : item.recall_5_all) ?? -Infinity;
          case 'recall_10':
            return (isCore ? item.recall_10 : item.recall_10_all) ?? -Infinity;
          case 'recall_50':
            return (isCore ? item.recall_50 : item.recall_50_all) ?? -Infinity;
          case 'recall_100':
            return (isCore ? item.recall_100 : item.recall_100_all) ?? -Infinity;
          case 'map_10':
            return (isCore ? item.map_10 : item.map_10_all) ?? -Infinity;
          case 'map_100':
            return (isCore ? item.map_100 : item.map_100_all) ?? -Infinity;
          case 'hnr_10':
            return item.hnr_10 ?? -Infinity;
          default:
            return item.ndcg_10 ?? -Infinity;
        }
      };

      const valA = getVal(a);
      const valB = getVal(b);
      if (valA !== valB) {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return a.benchmarkRank - b.benchmarkRank;
    });

    return list;
  }, [rankedEntries, sortField, sortDirection, isCore]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else if (field === 'rank' && sortField === 'ndcg_10') {
      // If currently sorted by primary metric (ndcg_10 desc, ranks 1->N), clicking rank flips to desc (N->1)
      setSortField('rank');
      setSortDirection(sortDirection === 'desc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      const ascFields: SortField[] = ['rank', 'model_name', 'team_name', 'eval_mode'];
      setSortDirection(ascFields.includes(field) ? 'asc' : 'desc');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDownloadModelJson = (entry: LeaderboardEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataToSave = {
      model_name: entry.model_name,
      team_name: entry.team_name,
      parameters: entry.parameters || null,
      docker: hasDockerSubmission(entry),
      eval_mode: entry.eval_mode,
      paper_url: entry.paper_url,
      submitted_at: entry.submitted_at,
      metrics: {
        graded: {
          ndcg_10: entry.ndcg_10,
          ndcg_5: entry.ndcg_5,
        },
        core_relevance: {
          mrr_10: entry.mrr_10,
          recall_5: entry.recall_5,
          recall_10: entry.recall_10,
          recall_50: entry.recall_50,
          recall_100: entry.recall_100,
          map_10: entry.map_10,
          map_100: entry.map_100,
        },
        all_relevance: {
          mrr_10: entry.mrr_10_all,
          recall_5: entry.recall_5_all,
          recall_10: entry.recall_10_all,
          recall_50: entry.recall_50_all,
          recall_100: entry.recall_100_all,
          map_10: entry.map_10_all,
          map_100: entry.map_100_all,
        },
        diagnostics: {
          hnr_10: entry.hnr_10,
          judged_fraction_10: entry.judged_fraction_10,
        },
      },
    };

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = entry.model_name.replace(/[^a-zA-Z0-9_\-\.]/g, '_') || 'model';
    link.href = url;
    link.download = `${safeName}_metrics.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSortIndicator = (field: SortField) => {
    const isActive = sortField === field;
    return (
      <span className="sort-indicator-slot" aria-hidden="true">
        {isActive ? (
          sortDirection === 'asc' ? (
            <ArrowUp size={11} className="icon-active" strokeWidth={2.2} />
          ) : (
            <ArrowDown size={11} className="icon-active" strokeWidth={2.2} />
          )
        ) : (
          <ArrowUpDown size={11} className="icon-neutral" strokeWidth={1.75} />
        )}
      </span>
    );
  };

  // Best scores across evaluated entries (excluding HNR@10)
  const bestScores = useMemo(() => {
    if (sortedEntries.length === 0) return {};

    const findMax = (getter: (e: RankedLeaderboardEntry) => number | null | undefined): number => {
      let max = -Infinity;
      for (const e of sortedEntries) {
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
      recall_5: findMax((e) => (isCore ? e.recall_5 : e.recall_5_all)),
      recall_10: findMax((e) => (isCore ? e.recall_10 : e.recall_10_all)),
      recall_50: findMax((e) => (isCore ? e.recall_50 : e.recall_50_all)),
      recall_100: findMax((e) => (isCore ? e.recall_100 : e.recall_100_all)),
      map_10: findMax((e) => (isCore ? e.map_10 : e.map_10_all)),
      map_100: findMax((e) => (isCore ? e.map_100 : e.map_100_all)),
      mrr_10: findMax((e) => (isCore ? e.mrr_10 : e.mrr_10_all)),
    };
  }, [sortedEntries, isCore]);

  const isBest = (val: number | null | undefined, max: number | undefined): boolean => {
    if (val === null || val === undefined || isNaN(val) || max === undefined || max === -Infinity) {
      return false;
    }
    return Math.abs(val - max) < 1e-6;
  };

  return (
    <section aria-labelledby="leaderboard-heading" className="leaderboard-section">
      {/* Controls Bar: Track switch, Relevance switch, Search */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          {/* Track Filter */}
          <div className="segmented-control" role="group" aria-label="Evaluation Track Filter">
            <button
              type="button"
              className={`segmented-btn ${track === 'all' ? 'active' : ''}`}
              onClick={() => onTrackChange('all')}
            >
              All Tracks
            </button>
            <button
              type="button"
              className={`segmented-btn ${track === 'full' ? 'active' : ''}`}
              onClick={() => onTrackChange('full')}
            >
              Full Corpus
            </button>
            <button
              type="button"
              className={`segmented-btn ${track === '2-stage' ? 'active' : ''}`}
              onClick={() => onTrackChange('2-stage')}
            >
              2-Stage
            </button>
          </div>

          {/* Relevance Mode Switch */}
          <div className="segmented-control" role="group" aria-label="Relevance Evaluation Mode">
            <button
              type="button"
              className={`segmented-btn ${isCore ? 'active' : ''}`}
              onClick={() => onModeChange('core')}
            >
              Core (Grade ≥ 2)
            </button>
            <button
              type="button"
              className={`segmented-btn ${!isCore ? 'active' : ''}`}
              onClick={() => onModeChange('all')}
            >
              All (Grade ≥ 1)
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          {/* Instant Search Input */}
          <div className="search-box">
            <Search size={14} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="search-input"
              placeholder="Search models or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search models or authors"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="table-stats-count" aria-live="polite">
            Showing <strong>{sortedEntries.length}</strong> of {entries.length} models
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-wrap">
        <table className="leaderboard-table">
          <colgroup>
            <col className="col-rank" />
            <col className="col-model" />
            <col className="col-param" />
            <col className="col-docker" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-num" />
            {/* Diag. column hidden: <col className="col-num" /> */}
          </colgroup>
          <thead>
            {/* Top row: Metric Group Super-Headers */}
            <tr className="super-header-row">
              <th
                rowSpan={2}
                className="th-rank sortable"
                onClick={() => handleSort('rank')}
                title="Sort by Rank"
              >
                #
              </th>
              <th
                rowSpan={2}
                className="th-model sortable"
                onClick={() => handleSort('model_name')}
                title="Sort by Model Name"
              >
                Model {renderSortIndicator('model_name')}
              </th>
              <th
                rowSpan={2}
                className="th-param sortable"
                onClick={() => handleSort('parameters')}
                title="Model Parameters"
              >
                par. {renderSortIndicator('parameters')}
              </th>
              <th
                rowSpan={2}
                className="th-docker sortable"
                onClick={() => handleSort('docker')}
                title="Sort by Docker Container Submission"
              >
                Doc. {renderSortIndicator('docker')}
              </th>

              {/* Group Super-Headers */}
              <th colSpan={2} className="th-group">Graded nDCG</th>
              <th colSpan={4} className="th-group">Recall</th>
              <th colSpan={2} className="th-group">MAP</th>
              <th colSpan={1} className="th-group">MRR</th>
              {/* <th colSpan={1} className="th-group">Diag.</th> */}
            </tr>

            {/* Sub row: Specific Metric Cutoffs */}
            <tr className="sub-header-row">
              <th
                className="th-num primary sortable"
                onClick={() => handleSort('ndcg_10')}
                title="Normalized Discounted Cumulative Gain @ 10 (Primary ranking metric)"
              >
                nDCG@10 {renderSortIndicator('ndcg_10')}
              </th>
              <th
                className="th-num sortable"
                onClick={() => handleSort('ndcg_5')}
                title="Normalized Discounted Cumulative Gain @ 5"
              >
                nDCG@5 {renderSortIndicator('ndcg_5')}
              </th>
              <th
                className="th-num sortable"
                onClick={() => handleSort('recall_5')}
                title="Recall @ 5"
              >
                R@5 {renderSortIndicator('recall_5')}
              </th>
              <th
                className="th-num sortable"
                onClick={() => handleSort('recall_10')}
                title="Recall @ 10"
              >
                R@10 {renderSortIndicator('recall_10')}
              </th>
              <th
                className="th-num sortable"
                onClick={() => handleSort('recall_50')}
                title="Recall @ 50"
              >
                R@50 {renderSortIndicator('recall_50')}
              </th>
              <th
                className="th-num sortable"
                onClick={() => handleSort('recall_100')}
                title="Recall @ 100"
              >
                R@100 {renderSortIndicator('recall_100')}
              </th>
              <th
                className="th-num sortable"
                onClick={() => handleSort('map_10')}
                title="Mean Average Precision @ 10"
              >
                MAP@10 {renderSortIndicator('map_10')}
              </th>
              <th
                className="th-num sortable"
                onClick={() => handleSort('map_100')}
                title="Mean Average Precision @ 100"
              >
                MAP@100 {renderSortIndicator('map_100')}
              </th>
              <th
                className="th-num sortable"
                onClick={() => handleSort('mrr_10')}
                title="Mean Reciprocal Rank @ 10"
              >
                MRR@10 {renderSortIndicator('mrr_10')}
              </th>
              {/* <th
                className="th-num sortable"
                onClick={() => handleSort('hnr_10')}
                title="Hard Negative Rate @ 10 (Judged negative ratio)"
              >
                HNR@10 {renderSortIndicator('hnr_10')}
              </th> */}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="table-state-cell" colSpan={13}>
                  Loading benchmark results...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="table-state-cell" colSpan={13}>
                  <span>{error}</span>{' '}
                  <button type="button" className="btn-inline-retry" onClick={onRetry}>
                    Retry
                  </button>
                </td>
              </tr>
            ) : sortedEntries.length === 0 ? (
              <tr>
                <td className="table-state-cell" colSpan={13}>
                  No models found matching the selected filters.
                </td>
              </tr>
            ) : (
              sortedEntries.map((item, index) => {
                const rowKey = item.id || `${item.model_name}-${item.eval_mode}-${index}`;
                const isExpanded = expandedId === rowKey;
                const url = safeUrl(item.paper_url);
                const is2Stage = item.eval_mode === '2-stage';
                const rankNum = item.benchmarkRank;

                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      className={`model-row ${isExpanded ? 'row-expanded' : ''}`}
                      onClick={() => toggleExpand(rowKey)}
                      tabIndex={0}
                      role="button"
                      aria-expanded={isExpanded}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpand(rowKey);
                        }
                      }}
                    >
                      {/* Rank */}
                      <td className="td-rank">
                        <span className={`rank-value ${rankNum <= 3 ? 'rank-top' : ''}`}>
                          {rankNum}
                        </span>
                      </td>

                      {/* Model Name: shows 2-Stage icon if 2-stage */}
                      <td className="td-model">
                        <div className="model-name-wrap">
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="model-link"
                              title={`${item.model_name}${is2Stage ? ' (2-Stage track)' : ''} (opens paper/repo)`}
                              onClick={(e) => e.stopPropagation()}
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

                      {/* Parameters */}
                      <td className="td-param">
                        {item.parameters && item.parameters.trim() ? item.parameters.trim() : '-'}
                      </td>

                      {/* Docker Submission */}
                      <td className="td-docker">
                        <DockerCellStatus docker={item.docker} />
                      </td>

                      {/* Graded nDCG */}
                      <td className={`td-num primary ${isBest(item.ndcg_10, bestScores.ndcg_10) ? 'cell-best-metric' : ''}`}>
                        {fmt(item.ndcg_10)}
                      </td>
                      <td className={`td-num ${isBest(item.ndcg_5, bestScores.ndcg_5) ? 'cell-best-metric' : ''}`}>
                        {fmt(item.ndcg_5)}
                      </td>

                      {/* Recall */}
                      <td className={`td-num ${isBest(isCore ? item.recall_5 : item.recall_5_all, bestScores.recall_5) ? 'cell-best-metric' : ''}`}>
                        {fmt(isCore ? item.recall_5 : item.recall_5_all)}
                      </td>
                      <td className={`td-num ${isBest(isCore ? item.recall_10 : item.recall_10_all, bestScores.recall_10) ? 'cell-best-metric' : ''}`}>
                        {fmt(isCore ? item.recall_10 : item.recall_10_all)}
                      </td>
                      <td className={`td-num ${isBest(isCore ? item.recall_50 : item.recall_50_all, bestScores.recall_50) ? 'cell-best-metric' : ''}`}>
                        {fmt(isCore ? item.recall_50 : item.recall_50_all)}
                      </td>
                      <td className={`td-num ${isBest(isCore ? item.recall_100 : item.recall_100_all, bestScores.recall_100) ? 'cell-best-metric' : ''}`}>
                        {fmt(isCore ? item.recall_100 : item.recall_100_all)}
                      </td>

                      {/* MAP */}
                      <td className={`td-num ${isBest(isCore ? item.map_10 : item.map_10_all, bestScores.map_10) ? 'cell-best-metric' : ''}`}>
                        {fmt(isCore ? item.map_10 : item.map_10_all)}
                      </td>
                      <td className={`td-num ${isBest(isCore ? item.map_100 : item.map_100_all, bestScores.map_100) ? 'cell-best-metric' : ''}`}>
                        {fmt(isCore ? item.map_100 : item.map_100_all)}
                      </td>

                      {/* MRR */}
                      <td className={`td-num ${isBest(isCore ? item.mrr_10 : item.mrr_10_all, bestScores.mrr_10) ? 'cell-best-metric' : ''}`}>
                        {fmt(isCore ? item.mrr_10 : item.mrr_10_all)}
                      </td>

                      {/* Diagnostic: strictly excluded from highlight ("trừ HNR@10") */}
                      {/* <td className="td-num">{fmt(item.hnr_10)}</td> */}
                    </tr>

                    {/* Expandable Model Details Panel */}
                    {isExpanded && (
                      <tr className="details-panel-row">
                        <td colSpan={13} className="details-panel-cell">
                          <div className="details-container">
                            {/* Header: Title, Track & Actions */}
                            <div className="details-header">
                              <div className="details-title-area">
                                <div className="details-title-row">
                                  <h4 className="details-model-name">{item.model_name}</h4>
                                  <span className={`details-track-badge ${is2Stage ? 'track-badge-2stage' : 'track-badge-full'}`}>
                                    {is2Stage ? '2-Stage Re-ranking' : 'Full Corpus Retrieval'}
                                  </span>
                                </div>

                                <div className="details-meta-row">
                                  <div className="details-meta-item">
                                    <span className="details-meta-label">Author:</span>
                                    <span className="details-meta-value">{item.team_name}</span>
                                  </div>                             
                                  <div className="details-meta-item">
                                    <span className="details-meta-label">Params:</span>
                                    <span className="details-meta-value">
                                      {item.parameters && item.parameters.trim() ? item.parameters.trim() : '—'}
                                    </span>
                                  </div>
                                  <div className="details-meta-item">
                                    <span className="details-meta-label">Docker:</span>
                                    <span className="details-meta-value details-meta-docker">
                                      {hasDockerSubmission(item) ? (
                                        <>
                                          <DockerIcon size={14} />
                                          <span>Submitted</span>
                                        </>
                                      ) : (
                                        '—'
                                      )}
                                    </span>
                                  </div>
                                  {item.submitted_at && (
                                    <>
                                      <div className="details-meta-item">
                                        <span className="details-meta-label">Last Submission:</span>
                                        <span className="details-meta-value">{formatDate(item.submitted_at)}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="details-actions">
                                {url && (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="details-btn-link"
                                    title="Open Paper or Code Repository"
                                  >
                                    <ExternalLink size={13} />
                                    <span>Paper / Code</span>
                                  </a>
                                )}
                                <button
                                  type="button"
                                  className="details-btn-export"
                                  onClick={(e) => handleDownloadModelJson(item, e)}
                                  title="Export all evaluation metrics as JSON"
                                >
                                  <Download size={13} />
                                  <span>Export Metrics (JSON)</span>
                                </button>
                              </div>
                            </div>

                            {/* Split Container: Left = Metric Comparison Table, Right = Category Radar Chart */}
                            <div className="details-split-container">
                              {/* Left Side: Metric Comparison Table */}
                              {/* <div className="details-table-panel">
                                <div className="details-metrics-grid">
                                  <table className="details-comparison-table">
                                    <thead>
                                      <tr>
                                        <th className="metric-th">Evaluation Metric</th>
                                        <th className="num-th">
                                          <span className="th-title">Core</span>
                                        </th>
                                        <th className="num-th">
                                          <span className="th-title">All</span>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
    
                                      <tr className="metric-primary-row">
                                        <td>
                                          <div className="metric-name-wrap">
                                            <strong>nDCG@10</strong>
                                          </div>
                                        </td>
                                        <td className="num-td highlight-num">{fmt(item.ndcg_10)}</td>
                                        <td className="num-td highlight-num">{fmt(item.ndcg_10)}</td>
                                      </tr>
                                      <tr>
                                        <td><strong>nDCG@5</strong></td>
                                        <td className="num-td">{fmt(item.ndcg_5)}</td>
                                        <td className="num-td">{fmt(item.ndcg_5)}</td>
                                      </tr>
                                      <tr>
                                        <td><strong>MRR@10</strong></td>
                                        <td className="num-td">{fmt(item.mrr_10)}</td>
                                        <td className="num-td">{fmt(item.mrr_10_all)}</td>
                                      </tr>

                                      <tr>
                                        <td><strong>Recall@5</strong></td>
                                        <td className="num-td">{fmt(item.recall_5)}</td>
                                        <td className="num-td">{fmt(item.recall_5_all)}</td>
                                      </tr>
                                      <tr>
                                        <td><strong>Recall@10</strong></td>
                                        <td className="num-td">{fmt(item.recall_10)}</td>
                                        <td className="num-td">{fmt(item.recall_10_all)}</td>
                                      </tr>
                                      <tr>
                                        <td><strong>Recall@50</strong></td>
                                        <td className="num-td">{fmt(item.recall_50)}</td>
                                        <td className="num-td">{fmt(item.recall_50_all)}</td>
                                      </tr>
                                      <tr>
                                        <td><strong>Recall@100</strong></td>
                                        <td className="num-td">{fmt(item.recall_100)}</td>
                                        <td className="num-td">{fmt(item.recall_100_all)}</td>
                                      </tr>

                                      <tr>
                                        <td><strong>MAP@10</strong></td>
                                        <td className="num-td">{fmt(item.map_10)}</td>
                                        <td className="num-td">{fmt(item.map_10_all)}</td>
                                      </tr>
                                      <tr>
                                        <td><strong>MAP@100</strong></td>
                                        <td className="num-td">{fmt(item.map_100)}</td>
                                        <td className="num-td">{fmt(item.map_100_all)}</td>
                                      </tr>

                                      <tr>
                                        <td><strong>HNR@10</strong></td>
                                        <td className="num-td">{fmt(item.hnr_10)}</td>
                                        <td className="num-td" style={{ color: 'var(--text-muted)' }}>—</td>
                                      </tr>
                                      {item.judged_fraction_10 !== undefined && item.judged_fraction_10 !== null && (
                                        <tr>
                                          <td><strong>Judged Fraction @ 10</strong></td>
                                          <td className="num-td">{fmt(item.judged_fraction_10)}</td>
                                          <td className="num-td">{fmt(item.judged_fraction_10)}</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div> */}

                              {/* Category Performance Bar Chart (Core vs All) */}
                              <div className="details-chart-panel">
                                <CategoryBarChart
                                  categoryScores={item.category_scores}
                                  modelName={item.model_name}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <LeaderboardFootnotes />
    </section>
  );
};
