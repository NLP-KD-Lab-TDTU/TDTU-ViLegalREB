# TDTU-ViLegalREB Leaderboard

Leaderboard for the Vietnamese Legal Retrieval Embedding Benchmark (143 queries, 3.03M corpus chunks, 27 legal categories, graded relevance 0/1/2).

- Website: https://nlp-kd-lab-tdtu.github.io/TDTU-ViLegalREB/
- Dataset & Scripts: https://huggingface.co/datasets/NLP-KD-Lab-TDTU/TDTU-ViLegalREB

## Website Guide

- **Overview (`/`)**: Benchmark summary, Top-10 models, and query distribution across 27 legal categories.
- **Construction (`/construction`)**: 7-stage dataset construction pipeline.
- **Leaderboard (`/leaderboard`)**: Full rankings with Core (`grade >= 2`) / All (`grade >= 1`) toggle, track filter (Full Corpus / 2-Stage), sorting, search, and per-model category breakdown.
- **Submit (`/submission`)**: Submission instructions, sample TSV download, upload form, and evaluation metric definitions.

## 1. Download Data & Scripts

Download the Hugging Face dataset repository to get queries, corpora, and scripts:

```bash
pip install -U huggingface_hub
hf download NLP-KD-Lab-TDTU/TDTU-ViLegalREB --repo-type dataset --local-dir TDTU-ViLegalREB
cd TDTU-ViLegalREB
pip install -r requirements.txt
```

Files included:
- `run.py`: Retrieval runner
- `submission.py`: TSV validator
- `data/corpus.json`: Full corpus (3.03M chunks, ~5.5 GB)
- `data/corpus_candidates.json`: 2-Stage candidate pool (347K chunks, ~1.1 GB)
- `data/queries.json`: 143 test queries

## 2. Run Retrieval & Validate TSV

Generate `results/{run_name}_run.tsv`:

```bash
# BM25 (Full Corpus)
python run.py --model bm25 --top-k 100

# Dense Retrieval (Full Corpus)
python run.py --model dense --encoder-name sentence-transformers/all-MiniLM-L6-v2 --device cuda --top-k 100

# 2-Stage Retrieval (Candidate Pool)
python run.py --model dense --encoder-name sentence-transformers/all-MiniLM-L6-v2 --corpus-file corpus_candidates.json --device cuda --top-k 100
```

Validate output format before submitting:

```bash
python submission.py results/my_model_run.tsv
```

TSV format: 6 tab-separated columns without header (`query_id \t Q0 \t chunk_id \t rank \t score \t run_name`), consecutive ranks `1..K`, no duplicate `chunk_id` per query, descending finite scores, covering all 143 queries.

## 3. Submit Results

1. Go to https://nlp-kd-lab-tdtu.github.io/TDTU-ViLegalREB/submission
2. Fill in **Model Name**, **Team / Organization**, optional **Model Parameters** and **Paper or Code URL**.
3. Enter a **Secret Token** (>= 8 chars) or click **Generate**, then save it to update runs or submit new models under your team later.
4. Upload the validated `.tsv` file and select **Full Corpus Retrieval** or **2-Stage Re-ranking**.
5. Click **Submit Run to Leaderboard**. The server validates the file, computes metrics (`{model}_metrics.json` downloadable), and queues the entry for admin review.

## Contact

- Email: leanhcuong@tdtu.edu.vn
- GitHub: https://github.com/NLP-KD-Lab-TDTU/TDTU-ViLegalREB
