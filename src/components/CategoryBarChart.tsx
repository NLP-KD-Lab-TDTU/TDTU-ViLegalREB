import React, { useMemo } from 'react';
import type { CategoryScoreMap } from '../types';
import {
  BENCHMARK_CATEGORIES,
  type BenchmarkCategoryDef,
} from '../data/benchmarkCategories';

export { BENCHMARK_CATEGORIES, type BenchmarkCategoryDef };

interface CategoryBarChartProps {
  categoryScores?: CategoryScoreMap | null;
  modelName: string;
}

interface BarItem {
  id: string;
  label: string;
  shortLabel: string;
  coreScore: number;
  allScore: number;
  queries: number;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  categoryScores,
  modelName,
}) => {
  // Helper to extract { core, all } score for any category
  const getScorePair = (catKey: string): { core: number; all: number } => {
    if (!categoryScores) return { core: 0, all: 0 };
    const val = categoryScores[catKey];
    if (val === undefined || val === null) return { core: 0, all: 0 };
    if (typeof val === 'number') {
      return { core: val, all: val };
    }
    return {
      core: typeof val.core === 'number' ? val.core : 0,
      all: typeof val.all === 'number' ? val.all : 0,
    };
  };

  // Build items for all 27 categories
  const chartItems: BarItem[] = useMemo(() => {
    return BENCHMARK_CATEGORIES.map((cat) => {
      const { core, all } = getScorePair(cat.key);
      return {
        id: cat.key,
        label: cat.key,
        shortLabel: cat.short,
        coreScore: core,
        allScore: all,
        queries: cat.queries,
      };
    });
  }, [categoryScores]);

  // Find max category score across all 27 categories
  const { maxScore, bestCategory, meanCore, meanAll } = useMemo(() => {
    let maxVal = 0;
    let bestCat = '';
    let sumCore = 0;
    let sumAll = 0;

    chartItems.forEach((item) => {
      sumCore += item.coreScore;
      sumAll += item.allScore;
      const m = Math.max(item.coreScore, item.allScore);
      if (m > maxVal) {
        maxVal = m;
        bestCat = item.label;
      }
    });

    const count = chartItems.length;
    return {
      maxScore: maxVal,
      bestCategory: bestCat,
      meanCore: count > 0 ? sumCore / count : 0,
      meanAll: count > 0 ? sumAll / count : 0,
    };
  }, [chartItems]);

  // Geometry dimensions
  const width = 1180;
  const height = 460;
  const padding = { top: 38, right: 30, bottom: 180, left: 56 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Chart limit: strictly capped to the maximum score of all categories
  // Round up to nearest 0.05 step for clean grid lines (minimum 0.10)
  const yMax = useMemo(() => {
    if (maxScore <= 0) return 0.2;
    const rounded = Math.ceil(maxScore * 20) / 20; // 0.05 step
    return Math.min(1.0, Math.max(0.1, rounded));
  }, [maxScore]);

  // Dynamic Y-axis ticks (4 intervals)
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      ticks.push((yMax / steps) * i);
    }
    return ticks;
  }, [yMax]);

  const numGroups = chartItems.length;
  const groupWidth = innerWidth / numGroups;
  const barWidth = 22; // Unified 1-bar width (11px Core + 11px All)

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(yMax, val));
    return padding.top + innerHeight - (clamped / yMax) * innerHeight;
  };

  const getBarHeight = (val: number) => {
    const clamped = Math.max(0, Math.min(yMax, val));
    return (clamped / yMax) * innerHeight;
  };

  return (
    <div className="bar-chart-card">
      {/* Header: Title, Controls & Legend */}
      <div className="bar-chart-header">
        <div className="bar-chart-title-group">
          <div className="bar-chart-title-row">
            <h5 className="bar-chart-title">Category Performance Breakdown</h5>
          </div>
        </div>

        <div className="bar-chart-controls">
          {/* Legend */}
          <div className="bar-chart-legend" role="group" aria-label="Metric Legend">
            <div className="legend-item" title="Core Relevance: Only judged documents with Grade >= 2">
              <span className="legend-swatch swatch-core" />
              <span className="legend-label">Core (Grade ≥ 2)</span>
            </div>
            <div className="legend-item" title="All Relevance: All judged documents with Grade >= 1">
              <span className="legend-swatch swatch-all" />
              <span className="legend-label">All (Grade ≥ 1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="bar-chart-stats-banner">
        <div className="bar-stat-chip">
          <span className="stat-chip-label">Total Categories:</span>
          <strong className="stat-chip-val">27</strong>
        </div>
        <div className="bar-stat-chip">
          <span className="stat-chip-label">Max Score:</span>
          <strong className="stat-chip-val max-val">{maxScore.toFixed(4)} ({bestCategory})</strong>
        </div>
        <div className="bar-stat-chip">
          <span className="stat-chip-label">Macro Mean (Core):</span>
          <strong className="stat-chip-val core-val">{meanCore.toFixed(4)}</strong>
        </div>
        <div className="bar-stat-chip">
          <span className="stat-chip-label">Macro Mean (All):</span>
          <strong className="stat-chip-val all-val">{meanAll.toFixed(4)}</strong>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="bar-chart-scroll-wrap">
        <svg
          className="bar-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          aria-label={`Category performance breakdown for ${modelName} (All 27 categories)`}
        >
          {/* Background Grid Lines & Ticks */}
          <g className="grid-lines">
            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick} className="grid-tick">
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray={tick === 0 ? undefined : '3,3'}
                    strokeWidth={tick === 0 ? 1.5 : 1}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="grid-tick-label"
                  >
                    {tick.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 27 Category Bars (Core & All merged into 1 bar per category) */}
          <g className="bars-layer">
            {chartItems.map((item, index) => {
              const groupX = padding.left + index * groupWidth;
              const barCenterX = groupX + groupWidth / 2;
              const barLeft = barCenterX - barWidth / 2;

              const coreH = getBarHeight(item.coreScore);
              const allH = getBarHeight(item.allScore);

              const coreY = getY(item.coreScore);
              const allY = getY(item.allScore);

              const isBest = item.label === bestCategory;

              return (
                <g
                  key={item.id}
                  className="bar-group"
                >
                  {/* Column Hover Background */}
                  <rect
                    x={groupX + 1}
                    y={padding.top}
                    width={groupWidth - 2}
                    height={innerHeight}
                    className="group-hover-bg"
                    rx="3"
                  />

                  {/* MERGED 1 BAR: Left half Core (11px), Right half All (11px) touching seamlessly with 0 gap */}
                  <g className="merged-bar-split">
                    {/* Core Half (Left) */}
                    <rect
                      x={barLeft}
                      y={coreY}
                      width={barWidth / 2}
                      height={coreH}
                      rx="2"
                      className="bar-rect bar-core"
                    />
                    {/* All Half (Right) */}
                    <rect
                      x={barLeft + barWidth / 2}
                      y={allY}
                      width={barWidth / 2}
                      height={allH}
                      rx="2"
                      className="bar-rect bar-all"
                    />
                  </g>

                  {/* X-Axis Tick Mark at the foot of the bar */}
                  <line
                    x1={barCenterX}
                    y1={padding.top + innerHeight}
                    x2={barCenterX}
                    y2={padding.top + innerHeight + 6}
                    stroke="var(--border-strong)"
                    strokeWidth="1.25"
                  />

                  {/* X-Axis Category Name at the foot of the bar (Rotated cleanly at -60°) */}
                  <g transform={`translate(${barCenterX}, ${padding.top + innerHeight + 8}) rotate(-60)`}>
                    <text
                      x={-2}
                      y={0}
                      textAnchor="end"
                      dominantBaseline="central"
                      className={`category-x-label ${isBest ? 'label-best' : ''}`}
                    >
                      {item.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Bottom Baseline */}
          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={width - padding.right}
            y2={padding.top + innerHeight}
            stroke="var(--border-strong)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
};
