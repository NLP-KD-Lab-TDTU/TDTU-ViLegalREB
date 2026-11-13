import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { LeaderboardPreview } from '../components/LeaderboardPreview';
import { useLeaderboard } from '../context/LeaderboardContext';

const INFO_CELL_COUNT = 6;

interface BenchmarkInfoCell {
  id: string;
  label: string;
  value: React.ReactNode;
  posClass: string;
  channelCode: string;
}

export const HomePage: React.FC = () => {
  const { entries, isLoading, error, refreshLeaderboard } = useLeaderboard();
  const [activeCells, setActiveCells] = useState<boolean[]>(() => Array(INFO_CELL_COUNT).fill(false));

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let isCancelled = false;
    let fadeOutTimer: number | undefined;
    let nextPulseTimer: number | undefined;

    const triggerPulse = () => {
      if (isCancelled) return;

      const count = 2 + Math.floor(Math.random() * 3);
      const indices = Array.from({ length: INFO_CELL_COUNT }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      const nextMask = Array(INFO_CELL_COUNT).fill(false);
      for (let i = 0; i < count; i += 1) {
        nextMask[indices[i]] = true;
      }

      setActiveCells(nextMask);

      fadeOutTimer = window.setTimeout(() => {
        if (isCancelled) return;
        setActiveCells(Array(INFO_CELL_COUNT).fill(false));

        nextPulseTimer = window.setTimeout(() => {
          triggerPulse();
        }, 1550);
      }, 2000);
    };

    const startTimer = window.setTimeout(() => {
      triggerPulse();
    }, 250);

    return () => {
      isCancelled = true;
      window.clearTimeout(startTimer);
      if (fadeOutTimer !== undefined) window.clearTimeout(fadeOutTimer);
      if (nextPulseTimer !== undefined) window.clearTimeout(nextPulseTimer);
    };
  }, []);

  const benchmarkCells: BenchmarkInfoCell[] = [
    {
      id: 'query',
      label: 'Query',
      value: '143',
      posClass: 'info-pos-r2c6',
      channelCode: '01',
    },
    {
      id: 'models',
      label: 'Models',
      value: isLoading ? '—' : entries.length,
      posClass: 'info-pos-r3c5',
      channelCode: '02',
    },
    {
      id: 'corpus',
      label: 'Corpus',
      value: '3.03M Chunks',
      posClass: 'info-pos-r3c6',
      channelCode: '03',
    },
    {
      id: 'primary-metric',
      label: 'Primary Metric',
      value: 'nDCG@10',
      posClass: 'info-pos-r4c4',
      channelCode: '04',
    },
    {
      id: 'relevance-scale',
      label: 'Relevance Scale',
      value: 'Graded (0 1 2)',
      posClass: 'info-pos-r4c5',
      channelCode: '05',
    },
    {
      id: 'tracks',
      label: 'Tracks',
      value: 'Full & Candidate',
      posClass: 'info-pos-r4c6',
      channelCode: '06',
    },
  ];

  return (
    <div className="home-page">
      {/* Section 1: Hero (4x6 Grid Layout) */}
      <section id="about-benchmark" className="home-hero-section" aria-labelledby="overview-title">
        <div className="home-section-inner hero-inner">
          <div className="hero-reactor-grid" role="region" aria-label="Benchmark Overview and Metadata">
            {/* 2x4 Text Cell (Rows 1-2, Cols 1-4) */}
            <div className="hero-text-cell">
              <div className="overview-header">
                <h1 id="overview-title" className="overview-title">
                  TDTU-ViLegalREB
                </h1>
                <p className="overview-subtitle">
                  Vietnamese Legal Retrieval Embedding Benchmark
                </p>
                <p className="overview-desc">
                  Standardized benchmark for evaluating retrieval models and language models on Vietnamese statutory collections, featuring multi-level graded relevance annotations and standardized evaluation tracks.
                </p>
              </div>
            </div>

            {/* Row 3, Cols 1-2: Two Adjacent Action Button Cells */}
            <Link to="/submission" className="hero-btn-cell hero-btn-primary">
              <span className="hero-btn-top">
                <span className="hero-btn-index">01</span>
                <ArrowUpRight size={18} className="hero-btn-icon" aria-hidden="true" />
              </span>
              <span className="hero-btn-label">Submit Run</span>
            </Link>

            <Link to="/leaderboard" className="hero-btn-cell hero-btn-secondary">
              <span className="hero-btn-top">
                <span className="hero-btn-index">02</span>
                <ArrowRight size={18} className="hero-btn-icon" aria-hidden="true" />
              </span>
              <span className="hero-btn-label">Full Leaderboard</span>
            </Link>

            {/* Row 3, Col 3: 1 Spacer Cell */}
            <div className="hero-spacer-cell" aria-hidden="true" />

            {/* Remaining 6 Cells: Benchmark Metadata Tiles */}
            {benchmarkCells.map((cell, index) => (
              <div
                key={cell.id}
                className={`hero-info-cell metadata-item ${cell.posClass}${activeCells[index] ? ' is-active' : ''}`}
              >
                <div className="hero-info-top">
                  <span className="hero-btn-index">{cell.label}</span>
                </div>
                <span className="metadata-val">{cell.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue to Leaderboard section */}
        <div className="hero-scroll-cue">
          <a href="#leaderboard-preview" className="hero-scroll-btn" aria-label="Scroll to Leaderboard Preview">
            <span className="hero-scroll-text">Leaderboard Preview</span>
            <ChevronDown size={15} className="hero-scroll-icon" />
          </a>
        </div>
      </section>

      {/* Section 2: Leaderboard Preview + View Full Button (Full Height) */}
      <LeaderboardPreview
        entries={entries}
        isLoading={isLoading}
        error={error}
        onRetry={refreshLeaderboard}
      />
    </div>
  );
};
