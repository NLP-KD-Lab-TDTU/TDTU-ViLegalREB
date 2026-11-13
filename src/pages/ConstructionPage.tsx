import React from 'react';
// import { Link } from 'react-router-dom';
import { ConstructionPipelineDiagram } from '../components/ConstructionPipelineDiagram';

// interface StageSummary {
//   step: string;
//   title: string;
//   description: string;
//   outcome: string;
// }
//
// const PIPELINE_STAGES: StageSummary[] = [
//   {
//     step: 'Stage 1',
//     title: 'Data Collection & Hierarchical Chunking',
//     description:
//       'Collected 1,100 deduplicated citizen Q&A records across 32 legal categories (pbgdpl.gov.vn) and crawled 91,406 Vietnamese normative documents (vbpl.vn, cutoff 29 Sep 2026). Advisory answers were PII-sanitized, and statutes were parsed into 3,029,670 hierarchical chunks preserving full path context (Document Title | Chapter | Article | Clause | Point | Text).',
//     outcome: '1,100 inquiries · 3.03M chunks (46.5% clauses, 43.0% points, 10.5% articles)',
//   },
//   {
//     step: 'Stage 2',
//     title: 'Legal Grounds Extraction & Preliminary Grading',
//     description:
//       'A Junior Judge (DeepSeek v4.1 Flash) extracted explicit statutory citations from each citizen Q&A advisory answer and aligned them strictly to exact corpus chunks. Only inquiries with complete ground-truth provision mappings were retained and scored under an initial 3-grade rubric.',
//     outcome: '241 fully mapped inquiries (859 partial, unmapped, or error cases excluded)',
//   },
//   {
//     step: 'Stage 3',
//     title: 'Citation-Free Query Reformulation & Tri-Model Approval',
//     description:
//       'To test legal reasoning rather than literal statute matching, queries were rewritten with an explicit exclusion list and regex citation redaction so article numbers and memorization clues were stripped. A Tri-Model Committee (Claude Haiku 5.5, Qwen 3.8 Flash, GPT-5.6 Luna) audited faithfulness and leakage under a strict unanimous 3/3 rule.',
//     outcome: '143 accepted queries (59.34%) · 867 extracted query–provision pairs',
//   },
//   {
//     step: 'Stage 4',
//     title: 'Hybrid Candidate Mining (BM25 + Dense)',
//     description:
//       'For each of the 143 accepted queries, lexical BM25 (bm25s, k₁ = 1.5, b = 0.75) and dense retrieval (text-embedding-3-small) independently surfaced the top-20 unseen corpus provisions. Deduplicated union pools were pre-graded by the Junior Judge before committee verification.',
//     outcome: '5,264 mined pairs (2,404 BM25-only, 2,404 Dense-only, 456 overlap)',
//   },
//   {
//     step: 'Stage 5',
//     title: 'Tri-Model Blind Re-grading',
//     description:
//       'All 6,131 pooled query–provision pairs (867 extracted + 5,264 mined across 5,297 unique chunks) were re-graded blindly in parallel by Claude Haiku 5.5, Qwen 3.8 Flash, and GPT-5.6 Luna. Models agreed unanimously on 3,329 pairs (54.3%) and by 2/3 majority on 2,633 pairs (42.9%), isolating 169 three-way splits (2.8%).',
//     outcome: '169 three-way conflicts + 300 stratified consensus cases flagged for audit',
//   },
//   {
//     step: 'Stages 6 & 7',
//     title: 'Specialist Blind Review & Joint Adjudication',
//     description:
//       'Three legal specialists independently annotated all 169 conflicts alongside a stratified 300-pair consensus audit (120 unanimous, 180 majority) without access to original advisory answers or LLM votes (pre-deliberation Krippendorff’s α = 0.738). Finally, 20 residual disagreements (11 three-way splits and 9 extreme 0-vs-2 reversals) were settled by joint deliberation.',
//     outcome: '469 expert-audited pairs · Final benchmark locked at 6,131 graded qrels',
//   },
// ];

export const ConstructionPage: React.FC = () => {
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="submission-container">
      <header className="submission-doc-header">
        <div className="doc-badge">Methodology</div>
        <h1 className="submission-doc-title">Benchmark Construction</h1>
        <p className="submission-doc-subtitle">
          How real citizen legal inquiries and 91,406 Vietnamese statutory documents are transformed
          into 143 citation-free queries and 6,131 three-grade relevance judgments.
        </p>

        {/* <div className="construction-stats-grid" aria-label="Benchmark construction highlights">
          <div className="construction-stat-card">
            <span className="construction-stat-val">143</span>
            <span className="construction-stat-label">Verified Queries (27 Topics)</span>
          </div>
          <div className="construction-stat-card">
            <span className="construction-stat-val">3.03M</span>
            <span className="construction-stat-label">Hierarchical Corpus Chunks</span>
          </div>
          <div className="construction-stat-card">
            <span className="construction-stat-val">6,131</span>
            <span className="construction-stat-label">Multi-Grade Qrels</span>
          </div>
          <div className="construction-stat-card">
            <span className="construction-stat-val">α = 0.738</span>
            <span className="construction-stat-label">3-Specialist Agreement</span>
          </div>
        </div> */}

        <div className="submission-quick-nav">
          <a
            href="#section-pipeline-diagram"
            className="quick-nav-pill"
            onClick={(e) => handleScrollToSection(e, 'section-pipeline-diagram')}
          >
            <span className="quick-nav-step">1</span> Pipeline Diagram
          </a>
          <a
            href="#section-pipeline-stages"
            className="quick-nav-pill"
            onClick={(e) => handleScrollToSection(e, 'section-pipeline-stages')}
          >
            <span className="quick-nav-step">2</span> Stage Walkthrough
          </a>
          <a
            href="#section-final-qrels"
            className="quick-nav-pill"
            onClick={(e) => handleScrollToSection(e, 'section-final-qrels')}
          >
            <span className="quick-nav-step">3</span> Final Qrels Composition
          </a>
        </div>
      </header>

      {/* SECTION 1: Pipeline Diagram */}
      <section className="doc-section" id="section-pipeline-diagram">
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

      {/* SECTION 2: Concise Stage Walkthrough */}
      {/* <section className="doc-section" id="section-pipeline-stages">
        <div className="doc-section-header">
          <div className="doc-section-badge">Overview</div>
          <h2 className="doc-section-title">Stage-by-Stage Summary</h2>
          <p className="doc-section-desc">
            Key filtering rules, committee consensus checks, and yield counts at every step.
          </p>
        </div>

        <div className="construction-stages-grid">
          {PIPELINE_STAGES.map((stage) => (
            <article key={stage.step} className="construction-stage-card">
              <div className="construction-stage-top">
                <span className="construction-stage-step">{stage.step}</span>
                <h3 className="construction-stage-title">{stage.title}</h3>
              </div>
              <p className="construction-stage-desc">{stage.description}</p>
              <div className="construction-stage-outcome">{stage.outcome}</div>
            </article>
          ))}
        </div>
      </section> */}

      {/* SECTION 3: Final Benchmark Composition */}
      {/* <section className="doc-section doc-section-evaluation" id="section-final-qrels">
        <div className="doc-section-header">
          <div className="doc-section-badge doc-badge-reference">Dataset</div>
          <h2 className="doc-section-title">Final Qrels &amp; Graded Relevance</h2>
          <p className="doc-section-desc">
            TDTU-ViLegalREB evaluates retrieval on 143 queries spanning 27 legal fields (42.9 judged
            passages per query on average; 134 queries contain at least one <code>y = 2</code>{' '}
            provision, while 9 peak at <code>y = 1</code>).
          </p>
        </div>

        <div className="doc-relevance-table-wrap">
          <table className="doc-relevance-table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Pairs (Share)</th>
                <th>Definition in Legal Retrieval</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="tier-tag tier-tag-2">Grade 2 · Relevant</span>
                </td>
                <td className="num">684 (11.16%)</td>
                <td>
                  Directly establishes the governing legal rule, right, obligation, or statutory
                  remedy required to answer the citizen inquiry.
                </td>
              </tr>
              <tr>
                <td>
                  <span className="tier-tag tier-tag-1">Grade 1 · Support</span>
                </td>
                <td className="num">1,270 (20.71%)</td>
                <td>
                  Provides useful legal context, cross-referenced definitions, procedural framing, or
                  secondary interpretive background without settling the core issue alone.
                </td>
              </tr>
              <tr>
                <td>
                  <span className="tier-tag tier-tag-0">Grade 0 · Negative</span>
                </td>
                <td className="num">4,177 (68.13%)</td>
                <td>
                  Topically or lexically adjacent hard negative chunks surfaced by BM25/Dense mining
                  that do not substantiate the legal answer.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="construction-footer-links">
          <Link to="/leaderboard" className="btn-secondary">
            Explore Model Rankings
          </Link>
          <Link to="/submission" className="btn-primary">
            Submit Your Retriever
          </Link>
        </div>
      </section> */}
    </div>
  );
};

