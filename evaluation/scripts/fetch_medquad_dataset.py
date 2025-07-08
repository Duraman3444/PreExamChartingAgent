#!/usr/bin/env python3
"""Fetch MedQuad Medical Q&A dataset (keivalya/MedQuad-MedicalQnADataset)
   and convert into a JSONL file that PreExamChartingAgent's evaluation
   pipeline can ingest.

Usage (from project root):
    python evaluation/scripts/fetch_medquad_dataset.py \
        --output evaluation/datasets/medquad_qa.jsonl \
        --sample_size 16407  # set to <= 16407 to limit rows

If --sample_size is omitted, the full dataset is written.
"""
import argparse
import json
from pathlib import Path

from datasets import load_dataset


def dump_jsonl(ds, output_path: Path, sample_size: int | None = None):
    """Write dataset rows to JSON Lines format."""
    if sample_size and sample_size < len(ds):
        ds = ds.shuffle(seed=42).select(range(sample_size))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for row in ds:
            # Each row has keys: qtype, Question, Answer
            obj = {
                "question": row["Question"].strip(),
                "answer": row["Answer"].strip(),
                "qtype": row["qtype"],
            }
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")
    print(f"Wrote {len(ds):,} rows to {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("evaluation/datasets/medquad_qa.jsonl"))
    parser.add_argument("--sample_size", type=int, default=None, help="Limit number of rows written")
    args = parser.parse_args()

    print("Downloading 'keivalya/MedQuad-MedicalQnADataset' …")
    ds = load_dataset("keivalya/MedQuad-MedicalQnADataset", split="train")
    print(f"Dataset loaded with {len(ds):,} rows.")

    dump_jsonl(ds, args.output, args.sample_size)


if __name__ == "__main__":
    main() 