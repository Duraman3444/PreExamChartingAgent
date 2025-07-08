# 📊 WebMD Reviews → Synthetic Patients

This guide shows how we turn the public **WebMD drug-review corpus** into *thousands of artificial patient cases* that PreExamChartingAgent can analyse during offline evaluation.

---
## 1. Fetch the raw dataset (one-liner)
```bash
pip install datasets  # if not yet installed
python - <<'PY'
from datasets import load_dataset
# 161 k reviews split into train / test.
webmd = load_dataset("shefali2023/webmd-data", split="train")
webmd.to_parquet("data/webmd_train.parquet")  # ~60 MB
print(webmd[0])
PY
```
*Fields preserved*: `drugName`, `condition`, `review`, `rating`, `date`, `usefulCount`.

---
## 2. Prompt templates
The two prompt families below let us:
1. **Expand** each review into a realistic clinical *visit note* (“patient prompt”).
2. **Evaluate** the agent’s structured output against ground truth we embed.

### 2-A  ⬆️  *Raw Review → Patient Utterance*
*(We now keep the original text.  No hallucinated details.)*
```text
SYSTEM:
You are PreExamChartingAgent.  A patient wrote the following public WebMD review about their experience with a drug.  Treat the review itself as the patient’s utterance in triage.

USER (patient):
<review_text>
```
The agent should parse the review, extract key symptoms, drug efficacy sentiment (0-10), side-effects, and populate the pre-exam chart.

> We purposely do **not** expand or paraphrase the text – reviews are first-hand accounts from real (already anonymised) individuals.
```

---
## 3. Building an evaluation set of “a few thousand” *real* patients
```python
from datasets import load_dataset
import json, pathlib

raw = load_dataset("shefali2023/webmd-data", split="train").shuffle(seed=7).select(range(3000))
pathlib.Path("evaluation/datasets").mkdir(parents=True, exist_ok=True)

with open("evaluation/datasets/webmd_reviews.jsonl", "w") as f:
    for row in raw:
        # minimal PII scrub: remove any emails / phone numbers with regex if present
        import re
        clean_review = re.sub(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+", "[EMAIL]", row["review"], flags=re.I)
        clean_review = re.sub(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b", "[PHONE]", clean_review)
        f.write(json.dumps({
            "review": clean_review,
            "drug": row["drugName"],
            "condition": row["condition"],
            "rating": row["rating"]
        })+"\n")
```
This produces a **real-patient** test set in one file ready for the benchmark runner.

---
## 4. Feedback-driven prompt tuning
| Issue | Fix |
|-------|-----|
| Agent misses important side-effects expressed in casual language | Add examples of slang ("felt icky", "the sweats") to few-shot prompt |
| Agent mis-reads the 0-10 sentiment | Convert WebMD 1-10 score to 0-10 scale and pass explicitly | 

Iterate: sample 50 cases ➜ run agent ➜ inspect JSON / errors ➜ refine prompts.

---
## 5. Linking back to evaluation scripts
After generating the transcripts place them under `evaluation/datasets/webmd_transcripts.jsonl` (one JSON per line with keys `transcript` and `ground_truth`).  The benchmarking runner in `evaluation/run_benchmark.py` will pick them up automatically.

> **Coming soon** – see `evaluation/scripts/fetch_webmd_dataset.py` for an automated end-to-end pipeline (download ➜ generate ➜ benchmark).

---
*Last updated:* <!-- YYY-MM-DD will be auto-filled by commit --> 