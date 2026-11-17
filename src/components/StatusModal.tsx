import React, { useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, Circle, Copy, Loader2, X, XCircle } from 'lucide-react';
import { copyTextToClipboard } from '../api';
import { SubmissionScores, StepStatus } from '../types';

interface StatusModalProps {
  isOpen: boolean;
  step1State: StepStatus;
  step2State: StepStatus;
  modelName?: string;
  scores?: SubmissionScores | null;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  submittedToken?: string | null;
  tokenNotice?: string | null;
  isUpdate?: boolean;
  errorMessage?: string | null;
  onDownloadResult?: () => void;
  onClose: () => void;
}

const renderStepIcon = (state: StepStatus) => {
  switch (state) {
    case 'running':
      return <Loader2 className="spin" size={18} strokeWidth={2.5} />;
    case 'completed':
      return <CheckCircle2 size={18} strokeWidth={2.5} />;
    case 'error':
      return <XCircle size={18} strokeWidth={2.5} />;
    case 'idle':
    default:
      return <Circle size={18} strokeWidth={2} />;
  }
};

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  step1State,
  step2State,
  modelName,
  reviewStatus,
  submittedToken,
  tokenNotice,
  errorMessage,
  onDownloadResult,
  onClose,
  isUpdate,
}) => {
  const isPendingReview = reviewStatus === 'pending';
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setCopied(false);
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, [isOpen, submittedToken]);

  if (!isOpen) return null;

  const isSuccess = step1State === 'completed' && step2State === 'completed';
  const isError = step1State === 'error' || step2State === 'error';

  const handleCopyToken = async () => {
    if (!submittedToken) return;
    if (await copyTextToClipboard(submittedToken)) {
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2500);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button
          type="button"
          className="modal-close-icon"
          aria-label="Close modal"
          onClick={onClose}
        >
          <X size={16} />
        </button>

        {/* Title & description */}
        <h3 className="modal-title">
          {isSuccess
            ? isPendingReview
              ? isUpdate
                ? 'Update Submitted for Review'
                : 'Submitted for Review'
              : isUpdate
              ? 'Submission Updated'
              : 'Evaluation Completed'
            : isError
            ? 'Submission Failed'
            : 'Evaluating Submission'}
        </h3>
        <p className="modal-desc">
          {isSuccess
            ? isPendingReview
              ? `Model "${modelName}" has been verified, evaluated, and queued for administrator review. It will appear on the public leaderboard once approved.`
              : `Model "${modelName}" has been successfully verified, evaluated, and ${isUpdate ? 'updated on' : 'ranked on'} the leaderboard.`
            : isError
            ? errorMessage || 'An error occurred during verification or evaluation.'
            : 'Validating format and computing benchmark retrieval metrics.'}
        </p>

        {/* 2-step progress */}
        <div className="modal-steps">
          <div className={`step-item ${step1State}`}>
            <div className="step-icon">{renderStepIcon(step1State)}</div>
            <div className="step-text">
              <div className="step-label">1. Validate Submission Format</div>
              <div className="step-sub">
                {step1State === 'running' && 'Checking TREC syntax, ownership, and query coverage...'}
                {step1State === 'completed' && 'Format and benchmark query coverage verified'}
                {step1State === 'error' && 'Validation failed'}
                {step1State === 'idle' && 'Waiting for verification'}
              </div>
            </div>
          </div>

          <div className={`step-item ${step2State}`}>
            <div className="step-icon">{renderStepIcon(step2State)}</div>
            <div className="step-text">
              <div className="step-label">2. Compute IR Metrics</div>
              <div className="step-sub">
                {step2State === 'running' && 'Calculating rankings against expert qrels...'}
                {step2State === 'completed' &&
                  (isPendingReview
                    ? 'Evaluation complete. Queued for administrator review.'
                    : 'Evaluation complete. Leaderboard updated.')}
                {step2State === 'error' && 'Scoring failed'}
                {step2State === 'idle' && 'Waiting for scoring'}
              </div>
            </div>
          </div>
        </div>

        {/* Copyable backup of user's entered Secret Token (kept client-side only; never sent back by API) */}
        {isSuccess && submittedToken && (
          <div className="modal-token-box" role="region" aria-label="Secret Token">
            <div className="modal-token-header">
              <span>{isUpdate ? 'Your Saved Secret Token' : 'Save Your Secret Token'}</span>
            </div>
            <p className="modal-token-warning">
              {tokenNotice ||
                'Copy and save this Secret Token now so you can overwrite results or submit more models under your team.'}
            </p>
            <div className="modal-token-value-row">
              <code className="modal-token-code" title={submittedToken}>
                {submittedToken}
              </code>
              <button
                type="button"
                className="modal-token-copy-btn"
                onClick={handleCopyToken}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation note fallback if no token box is shown */}
        {isSuccess && !submittedToken && (
          <div className="modal-token-info">
            <span>
              {tokenNotice ||
                (isPendingReview
                  ? 'Secret Token encrypted and saved. Keep using this secret for updates or new models under your team while your submission is reviewed.'
                  : isUpdate
                  ? 'Secret Token verified. Leaderboard entry overwritten cleanly.'
                  : 'Secret Token encrypted and saved. Keep using this secret for updates or new models under your team.')}
            </span>
          </div>
        )}

        {/* Modal actions (never auto-closes) */}
        <div className="modal-actions">
          {isSuccess ? (
            <>
              {onDownloadResult && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onDownloadResult}
                >
                  Download Results (JSON)
                </button>
              )}
              <button type="button" className="btn-primary" onClick={onClose}>
                Close
              </button>
            </>
          ) : isError ? (
            <button type="button" className="btn-secondary" onClick={onClose}>
              Dismiss
            </button>
          ) : (
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
