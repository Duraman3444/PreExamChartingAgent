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

### 2-A  ⬆️  *Reviewer-text → Visit Transcript*
*(Use with GPT-4 or `gpt-4o-mini` for speed)*
```text
SYSTEM:
You are a medical scribe.  Turn a short consumer WebMD review into a first-person visit transcript spoken by a patient.  Make the language natural, keep the clinical facts.

USER:
<review_text>
—
Required format:
VISIT_NOTE:
<≈150-250 word transcript>
STRUCTURED:
{"drug":"<drugName>","condition":"<condition>","rating":<rating>}
```
**Why this works**  ▸ The model preserves the key metadata while giving us a richly-worded transcript that the agent can later process.

### 2-B  ⬇️  *Transcript → Pre-Exam Chart*  
*(Run by PreExamChartingAgent during benchmarking)*
```text
SYSTEM:
You are PreExamChartingAgent.  Given a patient transcript, extract vitals, HPI, medication list, drug efficacy sentiment (0-10) and create a pre-exam chart JSON.

USER:
<transcript>
```

---
## 3. Generating “a few thousand patients”
```python
from datasets import load_dataset
import openai, json, pathlib, time

ds = load_dataset("shefali2023/webmd-data", split="train").shuffle(seed=42).select(range(3000))
pathlib.Path("synthetic_patients").mkdir(exist_ok=True)

SYSTEM_PROMPT = "You are a medical scribe..."  # see 2-A above
for i, row in enumerate(ds):
    msg = [
        {"role":"system", "content": SYSTEM_PROMPT},
        {"role":"user", "content": row["review"]}
    ]
    while True:
        try:
            rsp = openai.chat.completions.create(model="gpt-4o-mini", messages=msg)
            break
        except openai.RateLimitError:
            time.sleep(2)
    out = rsp.choices[0].message.content
    with open(f"synthetic_patients/patient_{i:04}.txt", "w") as f:
        f.write(out)
```
*Cost*: ~US$1.10 per 1 k patients with `gpt-4o-mini` (June-2025 price).

---
## 4. Feedback-driven prompt tuning
| Symptom | Fix | Example |
|---------|-----|---------|
| Transcript repeats review verbatim | Add *“paraphrase in first person, do **not** copy sentences”* to the system prompt. | 🔄 |
| Missing rating field | Include explicit schema lines in *Required format* section. | 🔄 |
| Unrealistic medical jargon | Add *“Use plain language a real patient would use.”* | 🔄 |

Iterate: sample 50 cases ➜ run agent ➜ inspect JSON / errors ➜ refine prompts.

---
## 5. Linking back to evaluation scripts
After generating the transcripts place them under `evaluation/datasets/webmd_transcripts.jsonl` (one JSON per line with keys `transcript` and `ground_truth`).  The benchmarking runner in `evaluation/run_benchmark.py` will pick them up automatically.

> **Coming soon** – see `evaluation/scripts/fetch_webmd_dataset.py` for an automated end-to-end pipeline (download ➜ generate ➜ benchmark).

---
*Last updated:* <!-- YYY-MM-DD will be auto-filled by commit --> 