import React, { useRef, useState } from 'react';
import { Check, Copy, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import {
  copyTextToClipboard,
  formatParamValue,
  generateStrongSecretToken,
  isValidExactParamInput,
  validateSecretTokenInput,
} from '../api';

interface SubmitFormProps {
  onSubmit: (formData: FormData) => Promise<boolean | void>;
  isSubmitting: boolean;
}

export const SubmitForm: React.FC<SubmitFormProps> = ({ onSubmit, isSubmitting }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const copyTimerRef = useRef<number | null>(null);
  const [evalMode, setEvalMode] = useState<'full' | '2-stage'>('full');
  const [modelName, setModelName] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [paramInput, setParamInput] = useState<string>('');
  const [updateToken, setUpdateToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [generatedInForm, setGeneratedInForm] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  const trimmedParam = paramInput.trim();
  const isAbbreviated = /^\d+(?:\.\d+)?\s*[kmbtKMBT]$/.test(trimmedParam);
  const isExactNumber = trimmedParam ? isValidExactParamInput(trimmedParam) : false;
  const isInvalidParam = Boolean(trimmedParam && !isAbbreviated && !isExactNumber);
  const paramPreview = isExactNumber ? formatParamValue(trimmedParam) : null;

  const trimmedToken = updateToken.trim();
  const tokenError = trimmedToken ? validateSecretTokenInput(trimmedToken, modelName, teamName) : null;

  const markCopiedTemporarily = () => {
    setCopiedToken(true);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedToken(false);
      copyTimerRef.current = null;
    }, 2500);
  };

  const handleGenerateToken = async () => {
    const generated = generateStrongSecretToken(teamName);
    setUpdateToken(generated);
    setShowToken(true);
    setGeneratedInForm(true);
    if (await copyTextToClipboard(generated)) {
      markCopiedTemporarily();
    }
  };

  const handleCopyToken = async () => {
    if (!trimmedToken) return;
    if (await copyTextToClipboard(trimmedToken)) {
      markCopiedTemporarily();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || isInvalidParam || !trimmedToken || Boolean(tokenError)) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('eval_mode', evalMode);

    if (trimmedParam) {
      const formatted = formatParamValue(trimmedParam);
      if (formatted) {
        formData.set('parameters', formatted);
      }
    } else {
      formData.delete('parameters');
    }

    formData.delete('vlr_edit_token');
    formData.set('update_token', trimmedToken);

    const succeeded = await onSubmit(formData);
    if (succeeded !== false) {
      form.reset();
      setModelName('');
      setTeamName('');
      setParamInput('');
      setUpdateToken('');
      setShowToken(false);
      setGeneratedInForm(false);
      setCopiedToken(false);
      setEvalMode('full');
    }
  };

  return (
    <div className="submit-form-wrapper">
      <form ref={formRef} onSubmit={handleSubmit} className="submit-form-grid">
        <div className="form-group">
          <label htmlFor="model_name" className="form-label">
            Model Name <span className="req">*</span>
          </label>
          <input
            id="model_name"
            name="model_name"
            type="text"
            className="form-input"
            placeholder="e.g. BM25s, Legal-PhoBERT, MyModel"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="team_name" className="form-label">
            Team / Organization <span className="req">*</span>
          </label>
          <input
            id="team_name"
            name="team_name"
            type="text"
            className="form-input"
            placeholder="e.g. NLP & KD Lab, Ton Duc Thang University"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="parameters" className="form-label">
            Model Parameters <span className="opt">(Optional)</span>
          </label>
          <input
            id="parameters"
            name="parameters"
            type="text"
            inputMode="numeric"
            className="form-input"
            placeholder="e.g. 20012312 or 110,000,000"
            value={paramInput}
            onChange={(e) => setParamInput(e.target.value)}
            aria-invalid={isInvalidParam || undefined}
            disabled={isSubmitting}
          />
          <span className="field-hint">
            {trimmedParam && isAbbreviated && (
              <span className="param-preview-badge param-preview-warn">
                Please enter exact count (e.g. 20012312 or 22,000,000 instead of{' '}
                {trimmedParam.toUpperCase()})
              </span>
            )}
            {isInvalidParam && (
              <span className="param-preview-badge param-preview-warn">
                Please enter a valid positive number (e.g. 20012312 or 22,000,001)
              </span>
            )}
            {trimmedParam && !isAbbreviated && paramPreview && (
              <span className="param-preview-badge">
                Auto-shortened to: <strong>{paramPreview}</strong>
              </span>
            )}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="paper_url" className="form-label">
            Paper or Code URL <span className="opt">(Optional)</span>
          </label>
          <input
            id="paper_url"
            name="paper_url"
            type="url"
            className="form-input"
            placeholder="https://arxiv.org/... or https://github.com/..."
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="update_token" className="form-label">
            <span className="form-label-inline">
              <span>Secret Token <span className="req">*</span></span>
            </span>
          </label>
          <div className="token-input-wrap">
            <input
              id="update_token"
              name="vlr_edit_token"
              type={showToken ? 'text' : 'password'}
              className="form-input token-input"
              placeholder="Choose a strong secret (>= 8 chars), or click Generate"
              value={updateToken}
              onChange={(e) => {
                setUpdateToken(e.target.value);
                setGeneratedInForm(false);
                setCopiedToken(false);
              }}
              aria-invalid={Boolean(tokenError) || undefined}
              autoComplete="one-time-code"
              data-lpignore="true"
              data-1p-ignore="true"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="token-generate-btn"
              onClick={handleGenerateToken}
              title="Generate a strong random secret token"
              disabled={isSubmitting}
            >
              <RefreshCw size={14} />
              <span>Generate</span>
            </button>
            <button
              type="button"
              className={`token-copy-btn ${copiedToken ? 'copied' : ''}`}
              onClick={handleCopyToken}
              title={trimmedToken ? 'Copy secret token' : 'Enter or generate a token first'}
              aria-label={copiedToken ? 'Copied' : 'Copy secret token'}
              disabled={isSubmitting || !trimmedToken}
            >
              {copiedToken ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedToken ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              className="token-toggle-btn"
              onClick={() => setShowToken((prev) => !prev)}
              aria-label={showToken ? 'Hide token' : 'Show token'}
              title={showToken ? 'Hide token' : 'Show token'}
              disabled={isSubmitting}
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span className="field-hint">
            <span>
              Save and reuse this exact secret to overwrite results or submit more models under this team.
            </span>
            {trimmedToken && tokenError && (
              <span className="param-preview-badge param-preview-warn">{tokenError}</span>
            )}
            {trimmedToken && !tokenError && generatedInForm && (
              <span className="param-preview-badge">
                Generated &amp; copied — save it for future updates and new models.
              </span>
            )}
            {trimmedToken && !tokenError && !generatedInForm && (
              <span className="param-preview-badge">
                Valid secret format
              </span>
            )}
          </span>
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="file" className="form-label">
            TREC Run File (.tsv) <span className="req">*</span>
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".tsv,.txt"
            className="form-file-input"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions form-group-full">
          <div className="segmented-control form-track-control" role="group" aria-label="Evaluation Track">
            <button
              type="button"
              className={`segmented-btn ${evalMode === 'full' ? 'active' : ''}`}
              onClick={() => setEvalMode('full')}
              disabled={isSubmitting}
            >
              Full Corpus Retrieval
            </button>
            <button
              type="button"
              className={`segmented-btn ${evalMode === '2-stage' ? 'active' : ''}`}
              onClick={() => setEvalMode('2-stage')}
              disabled={isSubmitting}
            >
              2-Stage Re-ranking
            </button>
          </div>

          <button id="submit" className="btn-primary form-submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Evaluating Submission...</span>
              </>
            ) : (
              <span>Submit Run to Leaderboard</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
