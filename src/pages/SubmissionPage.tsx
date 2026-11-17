import React, { useState, useRef } from 'react';
import { Download, ExternalLink, Layers2 } from 'lucide-react';
import { SubmitForm } from '../components/SubmitForm';
import { StatusModal } from '../components/StatusModal';
import { MathFormula } from '../components/MathFormula';
import { useLeaderboard } from '../context/LeaderboardContext';
import { validateSubmissionApi, computeResultApi, formatParamValue } from '../api';
import { StepStatus, SubmissionScores, ValidateResponse, SubmitResponse } from '../types';

export const SubmissionPage: React.FC = () => {
  const { refreshLeaderboard } = useLeaderboard();

  // 2-step progress states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [step1State, setStep1State] = useState<StepStatus>('idle');
  const [step2State, setStep2State] = useState<StepStatus>('idle');
  const [submittedModelName, setSubmittedModelName] = useState<string>('');
  const [submissionScores, setSubmissionScores] = useState<SubmissionScores | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>(
    undefined
  );
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [tokenNotice, setTokenNotice] = useState<string | null>(null);
  const [isUpdateSubmission, setIsUpdateSubmission] = useState<boolean>(false);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const [downloadResultData, setDownloadResultData] = useState<any | null>(null);

  const isCancelledRef = useRef<boolean>(false);

  const handleCloseModal = () => {
    isCancelledRef.current = true;
    setModalOpen(false);
    setIsSubmitting(false);
    setSubmittedToken(null);
  };

  const handleDownloadResult = () => {
    const dataToSave = downloadResultData || {
      model_name: submittedModelName,
      scores: submissionScores,
    };

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = submittedModelName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') || 'submission';
    link.href = url;
    link.download = `${safeName}_metrics.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleTsv = () => {
    const sampleContent =
      "q1\tQ0\tdoc_001\t1\t15.42\tMyModel\n" +
      "q1\tQ0\tdoc_042\t2\t12.85\tMyModel\n" +
      "q1\tQ0\tdoc_108\t3\t10.12\tMyModel\n" +
      "q2\tQ0\tdoc_005\t1\t16.20\tMyModel\n" +
      "q2\tQ0\tdoc_088\t2\t14.05\tMyModel\n";

    const blob = new Blob([sampleContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_trec_run.tsv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (formData: FormData): Promise<boolean> => {
    isCancelledRef.current = false;

    const modelName = (formData.get('model_name') as string)?.trim() || 'Your Model';
    const teamName = (formData.get('team_name') as string)?.trim() || '';
    const evalMode = (formData.get('eval_mode') as string)?.trim() || 'full';
    const paperUrl = (formData.get('paper_url') as string)?.trim() || '';
    const rawParams = (formData.get('parameters') as string)?.trim() || '';
    const parameters = formatParamValue(rawParams) || rawParams;
    const updateToken = (formData.get('update_token') as string)?.trim() || '';
    const file = formData.get('file') as File;

    setSubmittedModelName(modelName);
    setSubmissionScores(null);
    setReviewStatus(undefined);
    setDownloadResultData(null);
    setSubmittedToken(updateToken || null);
    setTokenNotice(null);
    setIsUpdateSubmission(false);
    setModalErrorMessage(null);

    setStep1State('running');
    setStep2State('idle');
    setModalOpen(true);
    setIsSubmitting(true);

    const STEP_DELAY_MS = 1200;

    // STEP 1: Validate
    const step1Start = Date.now();
    let valData: ValidateResponse | null = null;
    let step1Error: string | null = null;

    try {
      const valFormData = new FormData();
      valFormData.append('file', file);
      valFormData.append('eval_mode', evalMode);
      if (modelName) valFormData.append('model_name', modelName);
      if (teamName) valFormData.append('team_name', teamName);
      if (paperUrl) valFormData.append('paper_url', paperUrl);
      if (parameters) valFormData.append('parameters', parameters);
      if (updateToken) valFormData.append('update_token', updateToken);

      valData = await validateSubmissionApi(valFormData);
    } catch (err: any) {
      step1Error = err.message || 'Validation failed.';
    }

    const elapsed1 = Date.now() - step1Start;
    if (elapsed1 < STEP_DELAY_MS) {
      await new Promise((r) => setTimeout(r, STEP_DELAY_MS - elapsed1));
    }

    if (isCancelledRef.current) return false;

    if (step1Error || !valData) {
      setStep1State('error');
      setModalErrorMessage(step1Error || 'File validation failed.');
      setIsSubmitting(false);
      return false;
    }

    setStep1State('completed');
    setStep2State('running');

    // STEP 2: Compute
    const step2Start = Date.now();
    let resData: SubmitResponse | null = null;
    let step2Error: string | null = null;

    try {
      const resFormData = new FormData();
      resFormData.append('validation_token', valData.validation_token);
      resFormData.append('model_name', modelName);
      resFormData.append('team_name', teamName);
      resFormData.append('eval_mode', evalMode);
      if (paperUrl) resFormData.append('paper_url', paperUrl);
      if (parameters) resFormData.append('parameters', parameters);
      if (updateToken) resFormData.append('update_token', updateToken);

      resData = await computeResultApi(resFormData);
    } catch (err: any) {
      step2Error = err.message || 'Metric computation failed.';
    }

    const elapsed2 = Date.now() - step2Start;
    if (elapsed2 < STEP_DELAY_MS) {
      await new Promise((r) => setTimeout(r, STEP_DELAY_MS - elapsed2));
    }

    if (isCancelledRef.current) return false;

    setIsSubmitting(false);

    if (step2Error || !resData) {
      setStep2State('error');
      setModalErrorMessage(step2Error || 'Evaluation failed.');
      return false;
    }

    setStep2State('completed');
    setSubmissionScores(resData.scores || null);
    setReviewStatus(resData.review_status);
    setTokenNotice(resData.token_notice || null);
    setIsUpdateSubmission(Boolean(resData.is_update));
    setDownloadResultData(resData.scores ? resData.result_data || resData : null);

    if (resData.review_status !== 'pending') {
      refreshLeaderboard();
    }
    return true;
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;
    const headerHeight = 66;
    const extraPadding = 20;
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementTop - headerHeight - extraPadding,
      behavior: 'smooth',
    });
  };

  return (
    <div className="submission-container">
      {/* Page Header */}
      <header className="submission-doc-header">
        <div className="doc-badge">How to appear on the leaderboard</div>        
        <h1 className="submission-doc-title">Benchmark Submission</h1>
        <p className="submission-doc-subtitle">
          Run retrieval using the official runner, validate the TSV format, and submit results to the Leaderboard.
        </p>
        <div className="submission-quick-nav">
          <a
            href="#section-dataset-code"
            className="quick-nav-pill"
            onClick={(e) => handleScrollToSection(e, 'section-dataset-code')}
          >
            <span className="quick-nav-step">1</span> Run Retrieval
          </a>
          <a
            href="#section-submit"
            className="quick-nav-pill"
            onClick={(e) => handleScrollToSection(e, 'section-submit')}
          >
            <span className="quick-nav-step">2</span> Submit Run
          </a>
          <a
            href="#section-evaluation"
            className="quick-nav-pill"
            onClick={(e) => handleScrollToSection(e, 'section-evaluation')}
          >
            <span className="quick-nav-step">!</span> Evaluation Reference
          </a>
        </div>
      </header>

      {/* STEP 1: Chạy retrieval & chuẩn bị file */}
      <section className="doc-section" id="section-dataset-code">
        <div className="doc-section-header">
          <div className="doc-section-badge">Step 1</div>
          <h2 className="doc-section-title">Run Retrieval & Prepare Submission</h2>
          <p className="doc-section-desc">
            Download the benchmark assets, run retrieval models, and validate your TSV output.
          </p>
        </div>

        <div className="doc-section-body">
          {/* 1.1 Dataset & Repository */}
          <div className="doc-block">
            <h3 className="doc-block-title">1.1 Dataset & Repository</h3>
            <div className="doc-link-card">
              <a
                href="https://huggingface.co/datasets/NLP-KD-Lab-TDTU/TDTU-ViLegalREB"
                target="_blank"
                rel="noopener noreferrer"
                className="doc-hf-link"
              >
                <span className="doc-hf-name">NLP-KD-Lab-TDTU/TDTU-ViLegalREB</span>
                <ExternalLink size={14} />
              </a>
              <span className="doc-hf-desc">
                Contains 143 test queries, 3.03M corpus chunks, 347K candidate pool, and runner scripts.
              </span>
            </div>

            <div className="doc-code-wrap">
              {/* <div className="doc-code-label">Repository Structure</div> */}
              <pre className="doc-code"><code>{`.
├── run.py                     # Retrieval runner
├── submission.py              # TSV format validator
├── requirements.txt
└── data/
    ├── corpus.json            # Full corpus (3.03M chunks, ~5.5 GB)
    ├── corpus_candidates.json # Candidate pool (347K chunks, ~1.1 GB)
    └── queries.json           # 143 test queries`}</code></pre>
            </div>
          </div>

          {/* 1.2 Installation */}
          <div className="doc-block">
            <h3 className="doc-block-title">1.2 Installation</h3>
            <div className="doc-code-wrap">
              <pre className="doc-code"><code>pip install -r requirements.txt</code></pre>
            </div>
          </div>

          {/* 1.3 Running Retrieval */}
          <div className="doc-block">
            <h3 className="doc-block-title">1.3 Running Retrieval</h3>
            <p className="doc-text">
              Run retrieval models to generate <code>results/&#123;run_name&#125;_run.tsv</code>:
            </p>

            <div className="doc-subblock">
              <div className="doc-subblock-title">Option A: BM25 (Full Corpus — 3.03M chunks)</div>
              <div className="doc-code-wrap">
                <pre className="doc-code"><code>python run.py --model bm25 --top-k 100</code></pre>
              </div>
            </div>

            <div className="doc-subblock">
              <div className="doc-subblock-title">Option B: Dense Retrieval (Full Corpus)</div>
              <div className="doc-code-wrap">
                <pre className="doc-code"><code>{`python run.py \\
    --model dense \\
    --encoder-name sentence-transformers/all-MiniLM-L6-v2 \\
    --device cuda \\
    --top-k 100`}</code></pre>
              </div>
            </div>

            <div className="doc-subblock">
              <div className="doc-subblock-title">Option C: 2-Stage Retrieval (Candidate Pool — 347K chunks)</div>
              <div className="doc-code-wrap">
                <pre className="doc-code"><code>{`python run.py \\
    --model dense \\
    --encoder-name sentence-transformers/all-MiniLM-L6-v2 \\
    --corpus-file corpus_candidates.json \\
    --device cuda \\
    --top-k 100`}</code></pre>
              </div>
            </div>
          </div>

          {/* 1.4 Validating Submission File */}
          <div className="doc-block">
            <h3 className="doc-block-title">1.4 Validate Submission TSV</h3>
            <p className="doc-text">
              Verify format compliance before uploading:
            </p>
            <div className="doc-code-wrap">
              <pre className="doc-code"><code>python submission.py results/my_model_run.tsv</code></pre>
            </div>
            <ul className="doc-check-list">
              <li><strong>Format:</strong> Exactly 6 tab-separated columns without header (<code>query_id \t Q0 \t chunk_id \t rank \t score \t run_name</code>).</li>
              <li><strong>Ranks:</strong> Consecutive integers from 1 to <i>K</i> per query.</li>
              <li><strong>Uniqueness:</strong> No duplicate chunk IDs within any query.</li>
              <li><strong>Scores:</strong> Finite numeric values in descending order.</li>
              <li><strong>Coverage:</strong> Must include all 143 test queries.</li>
            </ul>
            <div className="doc-actions-bar">
              <button
                type="button"
                className="btn-download-sample"
                onClick={handleDownloadSampleTsv}
              >
                <Download size={14} />
                <span>Download sample_trec_run.tsv</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2: Submit kết quả */}
      <section className="doc-section" id="section-submit">
        <div className="doc-section-header">
          <div className="doc-section-badge">Step 2</div>
          <h2 className="doc-section-title">Submit Benchmark Run</h2>
          <p className="doc-section-desc">
            Enter model metadata, select the evaluation track, and upload your validated TSV run file.
          </p>
        </div>

        <div className="doc-section-body">
          <SubmitForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </section>

      {/* REFERENCE SECTION: Cách đánh giá model */}
      <section className="doc-section doc-section-evaluation" id="section-evaluation">
        <div className="doc-section-header">
          <h2 className="doc-section-title">How We Evaluate Models</h2>
          <p className="doc-section-desc">
            Relevance scale, ranking metric definitions, and benchmark tracks.
          </p>
        </div>

        <div className="doc-section-body">
          {/* Relevance Scale */}
          <div className="doc-block">
            <h3 className="doc-block-title">Relevance Scale</h3>
            <p className="doc-text">
              Ground truth is annotated across 3 relevance tiers:
            </p>
            <div className="doc-relevance-table-wrap">
              <table className="doc-relevance-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Grade</th>
                    <th style={{ width: '180px' }}>Label</th>
                    <th>Annotation Criteria</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="tier-row-2">
                    <td><span className="tier-tag tier-tag-2">Grade 2</span></td>
                    <td><strong>Core Relevance</strong></td>
                    <td>Direct statutory provisions that govern and resolve the legal query.</td>
                  </tr>
                  <tr className="tier-row-1">
                    <td><span className="tier-tag tier-tag-1">Grade 1</span></td>
                    <td><strong>Supporting Relevance</strong></td>
                    <td>Provisions providing definitions, context, or procedural background.</td>
                  </tr>
                  <tr className="tier-row-0">
                    <td><span className="tier-tag tier-tag-0">Grade 0</span></td>
                    <td><strong>Non-relevant</strong></td>
                    <td>Irrelevant provisions or hard negatives sharing terminology but no governing substance.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Primary Ranking Metric: Graded nDCG */}
          <div className="doc-block">
            <h3 className="doc-block-title">Graded nDCG (nDCG@10 & nDCG@5)</h3>
            <p className="doc-text">
              Primary ranking metric. Evaluates ranked lists with logarithmic discounting, giving highest weight to Grade 2 provisions:
            </p>
            <div className="doc-formula-box">
              <MathFormula
                block
                math="\text{DCG}@K = \sum_{i=1}^{K} \frac{2^{r(i)} - 1}{\log_2(i + 1)}, \qquad \text{nDCG}@K = \frac{\text{DCG}@K}{\text{IDCG}@K}"
              />
            </div>
            <p className="doc-formula-caption">
              Where <MathFormula math="r(i) \in \{0, 1, 2\}" /> is the grade at rank <MathFormula math="i" />, and <MathFormula math="\text{IDCG}@K" /> is the Ideal DCG from optimal sorting.
            </p>
          </div>

          {/* Coverage Metric: Recall */}
          <div className="doc-block">
            <h3 className="doc-block-title">Recall (R@5, R@10, R@50, R@100)</h3>
            <p className="doc-text">
              Proportion of gold-standard relevant chunks <MathFormula math="\mathcal{R}_q" /> captured in top-<MathFormula math="K" />:
            </p>
            <div className="doc-formula-box">
              <MathFormula
                block
                math="\text{Recall}@K = \frac{|\mathcal{D}_q(K) \cap \mathcal{R}_q|}{|\mathcal{R}_q|}"
              />
            </div>
            <p className="doc-formula-caption">
              Reported for <strong>Core</strong> (<MathFormula math="r \ge 2" />) and <strong>All</strong> (<MathFormula math="r \ge 1" />) relevance.
            </p>
          </div>

          {/* Precision & Reciprocal Rank: MAP & MRR */}
          <div className="doc-block">
            <h3 className="doc-block-title">MAP & MRR</h3>
            <p className="doc-text">
              Precision across ranks and rank of the first relevant document:
            </p>
            <div className="doc-formula-box">
              <MathFormula
                block
                math="\text{AP}@K = \frac{1}{\min(K, |\mathcal{R}_q|)} \sum_{i=1}^{K} P(i) \cdot \mathbb{I}[d_i \in \mathcal{R}_q], \qquad \text{MAP}@K = \frac{1}{|\mathcal{Q}|} \sum_{q \in \mathcal{Q}} \text{AP}_q@K"
              />
              <MathFormula
                block
                math="\text{MRR}@10 = \frac{1}{|\mathcal{Q}|} \sum_{q \in \mathcal{Q}} \frac{1}{\text{rank}_q}"
              />
            </div>
            <p className="doc-formula-caption">
              Where <MathFormula math="P(i)" /> is precision at rank <MathFormula math="i" />, and <MathFormula math="\text{rank}_q" /> is the rank of the first relevant document in top-10.
            </p>
          </div>

          {/* Diagnostic Metric: Hard Negative Rate */}
          <div className="doc-block">
            <h3 className="doc-block-title">Hard Negative Rate (HNR@10)</h3>
            <p className="doc-text">
              Proportion of top-10 retrieved documents judged as negative (Grade 0). <strong>Lower is better:</strong>
            </p>
            <div className="doc-formula-box">
              <MathFormula
                block
                math="\text{HNR}@10 = \frac{1}{|\mathcal{Q}|} \sum_{q \in \mathcal{Q}} \frac{\sum_{i=1}^{10} \mathbb{I}[r(i) = 0]}{10}"
              />
            </div>
            <p className="doc-formula-caption">
              Diagnoses whether models are misled by superficial terminology overlap on non-governing statutory chunks.
            </p>
          </div>

          {/* Official Benchmark Tracks */}
          <div className="doc-block">
            <h3 className="doc-block-title">Evaluation Tracks</h3>
            <ul className="doc-tracks-list">
              <li>
                <strong>Full Corpus Retrieval Track:</strong> Index and search the full <strong>3.03M chunks</strong> (~5.5 GB).
              </li>
              <li>
                <strong>2-Stage Re-ranking Track:</strong> Re-rank the pre-filtered candidate pool of <strong>347K chunks</strong> (~1.1 GB). Marked with (<Layers2 size={13} strokeWidth={2.2} className="stage-icon stage-icon-inline" aria-hidden="true" />) on the Leaderboard.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <StatusModal
        isOpen={modalOpen}
        step1State={step1State}
        step2State={step2State}
        modelName={submittedModelName}
        scores={submissionScores}
        reviewStatus={reviewStatus}
        submittedToken={submittedToken}
        tokenNotice={tokenNotice}
        isUpdate={isUpdateSubmission}
        errorMessage={modalErrorMessage}
        onDownloadResult={downloadResultData ? handleDownloadResult : undefined}
        onClose={handleCloseModal}
      />
    </div>
  );
};
