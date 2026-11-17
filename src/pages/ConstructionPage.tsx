import React from 'react';
import { ConstructionPipelineDiagram } from '../components/ConstructionPipelineDiagram';

export const ConstructionPage: React.FC = () => {
  return (
    <div className="submission-container">
      <header className="submission-doc-header">
        <div className="doc-badge">Methodology</div>
        <h1 className="submission-doc-title">Benchmark Construction</h1>
        <p className="submission-doc-subtitle">
          How real citizen legal inquiries and 91,406 Vietnamese statutory documents are transformed
          into 143 citation-free queries and 6,131 three-grade relevance judgments.
        </p>
      </header>

      <section className="doc-section doc-section-evaluation" id="section-pipeline-diagram">
        <div className="doc-section-header">
          <h2 className="doc-section-title">End-to-End Construction Pipeline</h2>
          <p className="doc-section-desc">
            Ground-truth extraction and query de-citation run down the left branch (Stages 1–3),
            feeding hybrid candidate mining, blind tri-model re-grading, and specialist adjudication
            up the right branch (Stages 4–7).
          </p>
        </div>

        <figure className="construction-figure-card">
          <ConstructionPipelineDiagram />
          <figcaption className="construction-figure-caption">
            <strong>Figure 1.</strong> Seven-stage construction workflow producing{' '}
            143 citation-free legal queries and 6,131 judged
            query–provision pairs across 3,029,670 Vietnamese statutory chunks.
          </figcaption>
        </figure>
      </section>
    </div>
  );
};

