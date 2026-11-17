import React, { useMemo } from 'react';
import {
  BENCHMARK_CATEGORIES,
  TOTAL_BENCHMARK_QUERIES,
} from '../data/benchmarkCategories';
import type { LeaderboardEntry } from '../types';

interface QueryCategoryDistributionProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

interface TopModelInfo {
  modelName: string;
  score: number;
  tiedModels: string[];
}

interface CategoryDistributionRow {
  rank: number;
  key: string;
  queries: number;
  sharePct: number;
  topModel: TopModelInfo | null;
}

function extractCoreCategoryScore(
  entry: LeaderboardEntry,
  categoryKey: string
): number | null {
  const val = entry.category_scores?.[categoryKey];
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  return typeof val.core === 'number' && Number.isFinite(val.core) ? val.core : null;
}

/**
 * Find the highest-scoring model (Core nDCG@10) for a given category.
 * Ties on category score are broken by overall leaderboard nDCG@10.
 */
function findTopCategoryModel(
  entries: LeaderboardEntry[],
  categoryKey: string
): TopModelInfo | null {
  let bestEntry: LeaderboardEntry | null = null;
  let bestScore = -Infinity;
  let bestOverall = -Infinity;
  const tiedNames = new Set<string>();

  for (const entry of entries) {
    const score = extractCoreCategoryScore(entry, categoryKey);
    if (score === null) continue;

    const overall = entry.ndcg_10 ?? -Infinity;
    if (score > bestScore + 1e-6) {
      bestScore = score;
      bestOverall = overall;
      bestEntry = entry;
      tiedNames.clear();
      tiedNames.add(entry.model_name);
    } else if (Math.abs(score - bestScore) <= 1e-6) {
      tiedNames.add(entry.model_name);
      if (overall > bestOverall) {
        bestOverall = overall;
        bestEntry = entry;
      }
    }
  }

  if (!bestEntry || bestScore === -Infinity) return null;

  return {
    modelName: bestEntry.model_name,
    score: bestScore,
    tiedModels: Array.from(tiedNames),
  };
}

function truncateModelLabel(name: string, maxLen: number = 36): string {
  return name.length > maxLen ? `${name.slice(0, maxLen - 1)}…` : name;
}

/**
 * Home section showing the query distribution across all 27 legal categories
 * as a ranked horizontal bar chart alongside each category's top-scoring model.
 */
export const QueryCategoryDistribution: React.FC<QueryCategoryDistributionProps> = ({
  entries,
  isLoading = false,
}) => {
  const rows: CategoryDistributionRow[] = useMemo(() => {
    const sorted = [...BENCHMARK_CATEGORIES].sort((a, b) => b.queries - a.queries);
    return sorted.map((cat, idx) => ({
      rank: idx + 1,
      key: cat.key,
      queries: cat.queries,
      sharePct: (cat.queries / TOTAL_BENCHMARK_QUERIES) * 100,
      topModel: findTopCategoryModel(entries, cat.key),
    }));
  }, [entries]);

  // Explicit SVG geometry (no CSS transforms)
  const width = 1160;
  const pad = { top: 38, right: 20, bottom: 44, left: 266 };
  const rowHeight = 23;
  const xMax = 20;
  const plotWidth = 460; // 23px per query
  const plotHeight = rows.length * rowHeight; // 621
  const height = pad.top + plotHeight + pad.bottom; // 703
  const xTicks = [0, 5, 10, 15, 20];
  const getBarX = (val: number) => pad.left + (val / xMax) * plotWidth;

  const modelColX = 824;
  const scoreColX = width - pad.right;

  return (
    <section
      id="query-distribution"
      className="home-distribution-section"
      aria-labelledby="distribution-title"
    >
      <div className="home-section-inner distribution-inner">
        <div className="preview-header-bar">
          <div className="preview-title-group">
            <h2 id="distribution-title" className="preview-heading">
              Query Category Distribution
            </h2>
            <p className="preview-subheading">
              Distribution of {TOTAL_BENCHMARK_QUERIES} benchmark queries across {rows.length}{' '}
              legal categories, with the top-scoring model (nDCG@10, Core Relevance) per category.
            </p>
          </div>
        </div>

        <div className="distribution-card">
          <div className="distribution-chart-scroll">
            <svg
              className="distribution-bar-svg"
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={`Horizontal bar chart of ${TOTAL_BENCHMARK_QUERIES} benchmark queries across ${rows.length} legal categories and top-scoring model per category.`}
            >
              {/* Column Headers */}
              <g aria-hidden="true">
                <text x={pad.left - 12} y={18} textAnchor="end" className="dist-col-head">
                  CATEGORY
                </text>
                <text x={pad.left} y={18} textAnchor="start" className="dist-col-head">
                  QUERIES (SHARE)
                </text>
                <text x={modelColX} y={18} textAnchor="start" className="dist-col-head">
                  TOP MODEL
                </text>
                <text x={scoreColX} y={18} textAnchor="end" className="dist-col-head">
                  CORE nDCG@10
                </text>
                <line
                  x1={8}
                  y1={28}
                  x2={width - 8}
                  y2={28}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
              </g>

              {/* Vertical Gridlines & X-Axis */}
              <g aria-hidden="true">
                {xTicks.map((tick) => {
                  const x = getBarX(tick);
                  const isOrigin = tick === 0;
                  return (
                    <g key={tick}>
                      <line
                        x1={x}
                        y1={pad.top}
                        x2={x}
                        y2={pad.top + plotHeight}
                        stroke={isOrigin ? 'var(--border-strong)' : 'var(--border)'}
                        strokeDasharray={isOrigin ? undefined : '3,3'}
                        strokeWidth={isOrigin ? 1.5 : 1}
                      />
                      <line
                        x1={x}
                        y1={pad.top + plotHeight}
                        x2={x}
                        y2={pad.top + plotHeight + 5}
                        stroke="var(--border-strong)"
                        strokeWidth={1.25}
                      />
                      <text
                        x={x}
                        y={pad.top + plotHeight + 18}
                        textAnchor="middle"
                        className="dist-axis-tick"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                <line
                  x1={pad.left}
                  y1={pad.top + plotHeight}
                  x2={pad.left + plotWidth}
                  y2={pad.top + plotHeight}
                  stroke="var(--border-strong)"
                  strokeWidth={1.25}
                />

                <text
                  x={pad.left + plotWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  className="dist-axis-title"
                >
                  Number of Queries
                </text>
              </g>

              {/* Category Rows */}
              <g>
                {rows.map((row, idx) => {
                  const rowY = pad.top + idx * rowHeight;
                  const centerY = rowY + rowHeight / 2;
                  const barW = Math.max(4, (row.queries / xMax) * plotWidth);
                  const topInfo = row.topModel;
                  const tieNote =
                    topInfo && topInfo.tiedModels.length > 1
                      ? ` (tied with ${topInfo.tiedModels
                          .filter((name) => name !== topInfo.modelName)
                          .join(', ')})`
                      : '';
                  const tooltip = topInfo
                    ? `${row.key}: ${row.queries} queries (${row.sharePct.toFixed(
                        1
                      )}%) — Top model: ${topInfo.modelName} (${topInfo.score.toFixed(4)})${tieNote}`
                    : `${row.key}: ${row.queries} queries (${row.sharePct.toFixed(1)}%)`;

                  return (
                    <g key={row.key} className="dist-bar-row">
                      <title>{tooltip}</title>

                      {/* Row hover highlight */}
                      <rect
                        x={8}
                        y={rowY + 1}
                        width={width - 16}
                        height={rowHeight - 2}
                        rx={4}
                        className="dist-row-bg"
                      />

                      {/* Rank */}
                      <text
                        x={28}
                        y={centerY}
                        textAnchor="end"
                        dominantBaseline="central"
                        className="dist-rank-label"
                      >
                        {String(row.rank).padStart(2, '0')}
                      </text>

                      {/* Category Name */}
                      <text
                        x={pad.left - 12}
                        y={centerY}
                        textAnchor="end"
                        dominantBaseline="central"
                        className="dist-cat-label"
                      >
                        {row.key}
                      </text>

                      {/* Horizontal Bar */}
                      <rect
                        x={pad.left}
                        y={centerY - 7}
                        width={barW}
                        height={14}
                        rx={2.5}
                        className="dist-bar-rect"
                      />

                      {/* Query Count & Percentage */}
                      <text
                        x={pad.left + barW + 8}
                        y={centerY}
                        dominantBaseline="central"
                        className="dist-value-label"
                      >
                        <tspan className="dist-value-count">{row.queries}</tspan>
                        <tspan className="dist-value-pct"> ({row.sharePct.toFixed(1)}%)</tspan>
                      </text>

                      {/* Highest-Scoring Model for this Category */}
                      {topInfo ? (
                        <>
                          <text
                            x={modelColX}
                            y={centerY}
                            textAnchor="start"
                            dominantBaseline="central"
                            className="dist-model-name"
                          >
                            {truncateModelLabel(topInfo.modelName)}
                          </text>
                          <text
                            x={scoreColX}
                            y={centerY}
                            textAnchor="end"
                            dominantBaseline="central"
                            className="dist-model-score"
                          >
                            {topInfo.score.toFixed(4)}
                          </text>
                        </>
                      ) : (
                        <text
                          x={modelColX}
                          y={centerY}
                          textAnchor="start"
                          dominantBaseline="central"
                          className="dist-model-empty"
                        >
                          {isLoading ? 'Loading…' : '—'}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
          <ol className="distribution-mobile-list" aria-label="Category query distribution">
            {rows.map((row) => {
              const barPct = Math.min(100, (row.queries / xMax) * 100);
              return (
                <li key={row.key} className="distribution-mobile-item">
                  <div className="distribution-mobile-head">
                    <span className="distribution-mobile-cat">
                      <span className="distribution-mobile-rank">
                        {String(row.rank).padStart(2, '0')}
                      </span>
                      <span>{row.key}</span>
                    </span>
                    <span className="distribution-mobile-count">
                      <strong>{row.queries}</strong> ({row.sharePct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="distribution-mobile-bar-track" aria-hidden="true">
                    <div
                      className="distribution-mobile-bar-fill"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <div className="distribution-mobile-model-row">
                    {row.topModel ? (
                      <>
                        <span className="distribution-mobile-model-name">
                          Top: {row.topModel.modelName}
                        </span>
                        <span className="distribution-mobile-model-score">
                          {row.topModel.score.toFixed(4)}
                        </span>
                      </>
                    ) : (
                      <span className="distribution-mobile-model-empty">
                        Top: {isLoading ? 'Loading…' : '—'}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};
