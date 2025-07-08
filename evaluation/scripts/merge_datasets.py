#!/usr/bin/env python3
"""Merge multiple JSONL medical datasets into one unified evaluation corpus.

Usage (from repo root):
    python evaluation/scripts/merge_datasets.py \
        --input_dir evaluation/datasets \
        --output evaluation/datasets/merged_medical_qa.jsonl \
        --shuffle

This will combine all JSONL files in the input directory into one file.
"""
import argparse
import json
import random
from pathlib import Path
from typing import List, Dict, Any


def load_jsonl(file_path: Path) -> List[Dict[str, Any]]:
    """Load JSONL file and return list of records."""
    records = []
    with file_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def save_jsonl(records: List[Dict[str, Any]], output_path: Path):
    """Save records to JSONL file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_dir", type=Path, 
                        default=Path("evaluation/datasets"),
                        help="Directory containing JSONL files to merge")
    parser.add_argument("--output", type=Path,
                        default=Path("evaluation/datasets/merged_medical_qa.jsonl"),
                        help="Output merged JSONL file")
    parser.add_argument("--shuffle", action="store_true",
                        help="Shuffle the merged dataset")
    parser.add_argument("--exclude", nargs="*", default=[],
                        help="JSONL files to exclude from merging")
    args = parser.parse_args()

    if not args.input_dir.exists():
        print(f"Error: Input directory {args.input_dir} does not exist")
        return

    # Find all JSONL files
    jsonl_files = list(args.input_dir.glob("*.jsonl"))
    
    # Exclude specified files
    if args.exclude:
        exclude_names = set(args.exclude)
        jsonl_files = [f for f in jsonl_files if f.name not in exclude_names]
    
    # Exclude the output file if it exists in the same directory
    if args.output.name in [f.name for f in jsonl_files]:
        jsonl_files = [f for f in jsonl_files if f.name != args.output.name]

    if not jsonl_files:
        print("No JSONL files found to merge")
        return

    print(f"Merging {len(jsonl_files)} JSONL files:")
    
    all_records = []
    source_counts = {}

    for jsonl_file in jsonl_files:
        print(f"  Loading {jsonl_file.name}...")
        records = load_jsonl(jsonl_file)
        
        # Add source info if not present
        for record in records:
            if "source" not in record:
                record["source"] = jsonl_file.stem.replace("_qa", "").replace("_dataset", "")
        
        all_records.extend(records)
        source_counts[jsonl_file.name] = len(records)

    print(f"\nLoaded {len(all_records):,} total records")
    print("Source breakdown:")
    for source, count in source_counts.items():
        print(f"  {source}: {count:,} records")

    # Shuffle if requested
    if args.shuffle:
        print("Shuffling dataset...")
        random.seed(42)  # For reproducibility
        random.shuffle(all_records)

    # Save merged dataset
    print(f"Saving merged dataset to {args.output}...")
    save_jsonl(all_records, args.output)
    
    print(f"✅ Successfully merged {len(all_records):,} records from {len(jsonl_files)} datasets")


if __name__ == "__main__":
    main() 