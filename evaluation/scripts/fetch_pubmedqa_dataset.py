#!/usr/bin/env python3
"""Fetch the PubMedQA dataset (pubmed_qa) and convert it
   into JSONL that PreExamChartingAgent's evaluation pipeline can read.

Usage (from repo root):

    python evaluation/scripts/fetch_pubmedqa_dataset.py \
        --output evaluation/datasets/pubmedqa_qa.jsonl \
        --sample_size 500   # optional – keep ≤ 1k labeled

If --sample_size is omitted, the full dataset is written.
"""
import argparse
import json
from pathlib import Path
from typing import Optional

try:
    from datasets import load_dataset
except ImportError:
    print("Please install datasets: pip install datasets")
    exit(1)


def dump_jsonl(ds, output_path: Path, sample_size: Optional[int] = None):
    """Write dataset rows to JSON Lines."""
    if sample_size and sample_size < len(ds):
        ds = ds.shuffle(seed=42).select(range(sample_size))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    with output_path.open("w", encoding="utf-8") as f:
        for row in ds:
            # PubMedQA has 'question', 'context', 'final_decision' fields
            context = " ".join(row["context"]["contexts"]) if "context" in row else ""
            obj = {
                "question": row["question"].strip(),
                "answer": row["final_decision"].strip(),
                "context": context,
                "source": "pubmedqa"
            }
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")
            written += 1
    print(f"Wrote {written:,} rows to {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path,
                        default=Path("evaluation/datasets/pubmedqa_qa.jsonl"))
    parser.add_argument("--sample_size", type=int, default=None,
                        help="Limit number of rows (≤1k labeled)")
    args = parser.parse_args()

    print("Downloading 'pubmed_qa' (pqa_labeled subset) …")
    ds = load_dataset("pubmed_qa", "pqa_labeled", split="train")
    print(f"Dataset loaded with {len(ds):,} rows.")

    dump_jsonl(ds, args.output, args.sample_size)


if __name__ == "__main__":
    main() 