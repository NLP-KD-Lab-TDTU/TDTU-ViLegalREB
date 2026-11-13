---
title: TDTU-ViLegalREB Leaderboard
colorFrom: blue
colorTo: indigo
sdk: static
pinned: false
---

# TDTU-ViLegalREB Leaderboard Frontend

Frontend application built with **React 19**, **TypeScript**, **Vite**, and **Lucide React**.

## Features

- **Full Benchmark Metrics**: Displays 10 IR evaluation metrics (nDCG@10, nDCG@5, MRR@10, Recall@10, Recall@100, MAP@10, MAP@100, Recall@5, Recall@50, HNR@10).
- **Core vs. All Relevance Toggle**: Switch dynamically between Core relevance ($\tau \ge 2$) and All relevance ($\tau \ge 1$).
- **Strict User-Provided Model Name**: Retains the exact model name entered by the user without automated heuristic modification.
- **Fixed 10s Submission Delay Modal**: Displays an interactive modal with a spinning `Loader2` indicator during the 10-second processing window.
- **Completion Flow**:
  - Switches to a green `CheckCircle2` checkmark on success with summary metric chips (nDCG@10, Recall@100, MAP@100).
  - 5-second automatic countdown with auto-dismiss.
  - Manual exit button ("Thoát ngay") and close button.

## Development

```bash
# Install dependencies
npm install

# Start Vite dev server (runs at http://localhost:3000, proxies /api to port 8000)
npm run dev

# Typecheck and build for production
npm run build

# Preview production build
npm run preview
```
