export interface CategoryScoreItem {
  core: number;
  all: number;
}

export type CategoryScoreMap = Record<string, CategoryScoreItem | number>;

export interface LeaderboardEntry {
  id?: string;
  model_name: string;
  team_name: string;
  parameters?: string | null;
  docker?: boolean | null;
  eval_mode?: 'full' | '2-stage' | string;
  paper_url?: string | null;

  // Graded nDCG
  ndcg_10?: number | null;
  ndcg_5?: number | null;

  // Core relevance (Grade >= 2)
  mrr_10?: number | null;
  recall_5?: number | null;
  recall_10?: number | null;
  recall_50?: number | null;
  recall_100?: number | null;
  map_10?: number | null;
  map_100?: number | null;
  hnr_10?: number | null;

  // All relevance (Grade >= 1)
  mrr_10_all?: number | null;
  recall_5_all?: number | null;
  recall_10_all?: number | null;
  recall_50_all?: number | null;
  recall_100_all?: number | null;
  map_10_all?: number | null;
  map_100_all?: number | null;

  judged_fraction_10?: number | null;
  category_scores?: CategoryScoreMap | null;
  submitted_at?: string;
}

export interface SubmissionScores {
  ndcg_10?: number | null;
  ndcg_5?: number | null;
  recall_100?: number | null;
  map_100?: number | null;
  mrr_10?: number | null;
  recall_10?: number | null;
  map_10?: number | null;
  [key: string]: number | null | undefined;
}

export interface ValidateResponse {
  status: string;
  message: string;
  submission_mode?: 'create' | 'update' | string;
  validation_token: string;
  total_queries: number;
  detected_run_name?: string;
}

export interface SubmitResponse {
  status: string;
  message: string;
  is_update?: boolean;
  token_notice?: string;
  persistence_synced?: boolean;
  scores: SubmissionScores;
  submission: LeaderboardEntry;
  submission_id?: string;
  download_url?: string;
  result_data?: any;
}

export type RelevanceMode = 'core' | 'all';

export type TrackFilter = 'all' | 'full' | '2-stage';

export type StepStatus = 'idle' | 'running' | 'completed' | 'error';

export type SortField =
  | 'rank'
  | 'model_name'
  | 'team_name'
  | 'parameters'
  | 'docker'
  | 'eval_mode'
  | 'ndcg_10'
  | 'ndcg_5'
  | 'mrr_10'
  | 'recall_5'
  | 'recall_10'
  | 'recall_50'
  | 'recall_100'
  | 'map_10'
  | 'map_100'
  | 'hnr_10';

export type SortDirection = 'asc' | 'desc';
