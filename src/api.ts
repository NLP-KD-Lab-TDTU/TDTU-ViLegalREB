import { LeaderboardEntry, ValidateResponse, SubmitResponse } from './types';

export type AppEnvironmentMode = 'development' | 'production';

export const DEFAULT_LOCAL_API_BASE = 'http://127.0.0.1:8000';
export const DEFAULT_PROD_API_BASE = 'https://tdtu-vilegalreb-backend.onrender.com';

function normalizeModeValue(raw?: string | null): AppEnvironmentMode | null {
  const cleaned = (raw || '').trim().toLowerCase();
  if (cleaned === 'prod' || cleaned === 'production') return 'production';
  if (cleaned === 'dev' || cleaned === 'development' || cleaned === 'local') return 'development';
  return null;
}

export function getApiMode(): AppEnvironmentMode {
  const urlParams = new URLSearchParams(window.location.search);
  const queryMode = normalizeModeValue(urlParams.get('mode'));
  if (queryMode) return queryMode;

  const envMode = normalizeModeValue(import.meta.env.VITE_API_MODE);
  if (envMode) return envMode;

  if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
    return 'production';
  }
  return 'development';
}

export function getApiBase(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const param = (urlParams.get('api') || '').trim();
  if (param && /^https?:\/\//i.test(param)) {
    return param.replace(/\/+$/, '');
  }

  if (getApiMode() === 'development') {
    return (import.meta.env.VITE_LOCAL_API_BASE || DEFAULT_LOCAL_API_BASE)
      .trim()
      .replace(/\/+$/, '');
  }

  const configured = (import.meta.env.VITE_API_BASE || '').trim();
  if (configured && !configured.includes('YOUR-RENDER-SERVICE')) {
    return configured.replace(/\/+$/, '');
  }

  return DEFAULT_PROD_API_BASE;
}

export const API_MODE: AppEnvironmentMode = getApiMode();
export const API_BASE = getApiBase();

export const fmt = (n?: number | null): string =>
  n === null || n === undefined || isNaN(n) ? '—' : n.toFixed(4);

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return '—';
  }
};

function normalizeExactParamDigits(raw: string): string {
  let cleaned = raw.trim().replace(/[,_\s]/g, '');
  if ((cleaned.match(/\./g) || []).length > 1) {
    cleaned = cleaned.replace(/\./g, '');
  }
  return cleaned;
}

export function isValidExactParamInput(val?: string | null): boolean {
  if (!val) return false;
  const cleaned = normalizeExactParamDigits(val);
  if (!/^\d+(?:\.\d+)?$/.test(cleaned)) return false;
  const num = Number(cleaned);
  return Number.isFinite(num) && num > 0;
}

export function formatParamValue(val?: string | null): string | null {
  if (!val) return null;
  const s = String(val).trim();
  if (!s || s === '--' || s === '—' || s === '-') return null;

  const suffixMatch = s.match(/^(\d+(?:\.\d+)?)\s*([KMBTkmbt])$/);
  if (suffixMatch) {
    const num = Number(suffixMatch[1]);
    const unit = suffixMatch[2].toUpperCase();
    if (!Number.isFinite(num) || num <= 0) return s;
    return `${num}${unit}`;
  }

  const cleaned = normalizeExactParamDigits(s);
  if (!/^\d+(?:\.\d+)?$/.test(cleaned)) return s;

  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) return s;

  if (num >= 1e12) {
    const v = Math.round((num / 1e12) * 10) / 10;
    return `${v}T`;
  }
  if (num >= 1e9) {
    const v = Math.round((num / 1e9) * 10) / 10;
    return `${v}B`;
  }
  if (num >= 1e6) {
    const v = Math.round((num / 1e6) * 10) / 10;
    return `${v}M`;
  }
  if (num >= 1e3) {
    const v = Math.round((num / 1e3) * 10) / 10;
    return `${v}K`;
  }

  return String(Math.round(num));
}

export function safeUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

const WEAK_SECRET_SET = new Set([
  '12345678',
  '123456789',
  '1234567890',
  '00000000',
  '11111111',
  'password',
  'password1',
  'password123',
  'qwertyui',
  'qwerty123',
  'abcdefgh',
  'admin123',
  'vilegalreb',
]);

function normalizeIdentityClient(val: string): string {
  return val.trim().replace(/\s+/g, ' ').toLowerCase();
}

function slugifyTokenPartClient(val: string, maxLen: number = 128): string {
  return val
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase()
    .slice(0, maxLen);
}

export function validateSecretTokenInput(
  secret: string,
  modelName: string,
  teamName: string
): string | null {
  const clean = secret.trim();
  if (!clean) return null;

  if (clean.length < 8) {
    return 'Secret token must be at least 8 characters.';
  }
  if (clean.length > 128) {
    return 'Secret token must be at most 128 characters.';
  }

  const normSecret = normalizeIdentityClient(clean);
  const normTeam = normalizeIdentityClient(teamName);
  const normModel = normalizeIdentityClient(modelName);
  const slugSecret = slugifyTokenPartClient(clean);
  const slugTeam = slugifyTokenPartClient(teamName);
  const slugModel = slugifyTokenPartClient(modelName);

  if (
    (normTeam && normSecret === normTeam) ||
    (normModel && normSecret === normModel) ||
    (slugSecret && ((slugTeam && slugSecret === slugTeam) || (slugModel && slugSecret === slugModel)))
  ) {
    return 'Secret token cannot be identical to your Team Name or Model Name.';
  }

  const uniqueChars = new Set(clean).size;
  if (uniqueChars < 2 || (clean.length < 12 && uniqueChars < 3) || WEAK_SECRET_SET.has(clean.toLowerCase())) {
    return 'Secret token is too weak or repetitive. Choose a stronger secret or click Generate.';
  }

  return null;
}

export function generateStrongSecretToken(teamName?: string): string {
  const bytes = new Uint8Array(18);
  window.crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const randomPart = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const slug = slugifyTokenPartClient(teamName || '', 10) || 'team';
  return `vlr_${slug}_${randomPart}`;
}

export async function copyTextToClipboard(value: string): Promise<boolean> {
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

export function downloadFile(content: string, filename: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function fetchLeaderboardApi(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/api/leaderboard`);
  if (!res.ok) {
    throw new Error(`Server returned ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function postFormData<T>(path: string, formData: FormData, label: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errDetail = `${label} (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.detail) errDetail = errJson.detail;
    } catch {}
    throw new Error(errDetail);
  }

  return (await res.json()) as T;
}

export const validateSubmissionApi = (formData: FormData): Promise<ValidateResponse> =>
  postFormData<ValidateResponse>('/api/validate', formData, 'Validation error');

export const computeResultApi = (formData: FormData): Promise<SubmitResponse> =>
  postFormData<SubmitResponse>('/api/result', formData, 'Evaluation error');

