#!/usr/bin/env python3
"""Master script to fetch all anonymized medical datasets for evaluation.

This script downloads multiple datasets and creates a unified evaluation corpus
with thousands of Q&A pairs from various medical sources.

Usage (from repo root):
    python evaluation/scripts/fetch_all_datasets.py --sample_size 5000

This will download 5000 samples from each available dataset.
"""
import argparse
import subprocess
import sys
from pathlib import Path


def run_script(script_name: str, sample_size: int):
    """Run a dataset fetching script with the given sample size."""
    script_path = Path("evaluation/scripts") / script_name
    if not script_path.exists():
        print(f"Warning: {script_name} not found, skipping...")
        return False
    
    cmd = [sys.executable, str(script_path), "--sample_size", str(sample_size)]
    print(f"Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_name}: {e}")
        print(f"stderr: {e.stderr}")
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample_size", type=int, default=5000,
                        help="Number of samples to fetch from each dataset")
    parser.add_argument("--output_dir", type=Path, 
                        default=Path("evaluation/datasets"),
                        help="Directory to store datasets")
    args = parser.parse_args()

    # Ensure output directory exists
    args.output_dir.mkdir(parents=True, exist_ok=True)

    # List of all dataset fetching scripts
    scripts = [
        "fetch_webmd_dataset.py",
        "fetch_medquad_dataset.py", 
        "fetch_icliniq_dataset.py",
        "fetch_healthtap_dataset.py",
        "fetch_pubmedqa_dataset.py",
        "fetch_askdocs_dataset.py",
        "fetch_emrqa_dataset.py"
    ]

    successful = 0
    total = len(scripts)

    print(f"Fetching {args.sample_size} samples from each of {total} datasets...")
    print("=" * 60)

    for script in scripts:
        if run_script(script, args.sample_size):
            successful += 1
        print("-" * 40)

    print(f"Completed: {successful}/{total} datasets downloaded successfully")
    
    # Show summary of created files
    print("\nCreated files:")
    for jsonl_file in args.output_dir.glob("*.jsonl"):
        if jsonl_file.exists():
            # Count lines in file
            with jsonl_file.open() as f:
                line_count = sum(1 for _ in f)
            print(f"  {jsonl_file.name}: {line_count:,} rows")


if __name__ == "__main__":
    main() 