#!/usr/bin/env python3
"""Fetch the WebMD symptom Q&A dataset (shefali2023/webmd-data) and convert it
   into JSONL that PreExamChartingAgent's evaluation pipeline can read.

Usage (from repo root):

    python evaluation/scripts/fetch_webmd_dataset.py \
        --output evaluation/datasets/webmd_symptom_qa.jsonl \
        --sample_size 4000   # optional – keep ≤ 27 700

If --sample_size is omitted, the full dataset is written.
"""
import argparse
import json
import re
from pathlib import Path
from typing import Optional, Tuple

try:
    from datasets import load_dataset
except ImportError:
    print("Please install datasets: pip install datasets")
    exit(1)


_INST_RE = re.compile(r"\[INST\](.*?)\[/INST\](.*)", re.S)


def _split_q_a(packed_text: str) -> Optional[Tuple[str, str]]:
    """Return (question, answer) or None if pattern not found."""
    m = _INST_RE.search(packed_text)
    if not m:
        return None
    question, answer = m.groups()
    return question.strip(), answer.strip()


def dump_jsonl(ds, output_path: Path, sample_size: Optional[int] = None):
    """Write dataset rows to JSON Lines."""
    if sample_size and sample_size < len(ds):
        ds = ds.shuffle(seed=42).select(range(sample_size))
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with output_path.open("w", encoding="utf-8") as f:
        for row in ds:
            parsed = _split_q_a(row["Prompt"])
            if not parsed:
                continue  # skip irregular rows
            
            question, answer = parsed
            record = {
                "question": question,
                "answer": answer,
                "source": "webmd"
            }
            f.write(json.dumps(record) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Fetch WebMD Q&A dataset")
    parser.add_argument("--output", type=Path, required=True, help="Output JSONL file")
    parser.add_argument("--sample_size", type=int, help="Max number of samples")
    args = parser.parse_args()

    print("Downloading 'shefali2023/webmd-data' …")
    ds = load_dataset("shefali2023/webmd-data", split="train")
    print(f"Dataset loaded with {len(ds):,} rows.")

    dump_jsonl(ds, args.output, args.sample_size)
    print(f"Saved to {args.output}")


if __name__ == "__main__":
    main() 