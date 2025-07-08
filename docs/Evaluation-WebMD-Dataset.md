# 📊 WebMD Symptom Q&A → Real-World Evaluation Set

*Dataset used: [`shefali2023/webmd-data`](https://huggingface.co/datasets/shefali2023/webmd-data)*

WebMD hosts thousands of consumer health questions answered by medical editors.  Because the content is already public and **contains no direct identifiers**, it is an ideal, *real-patient* corpus for stress-testing PreExamChartingAgent’s symptom-extraction and reasoning quality.

---
## 1  Fetch & inspect the raw dataset (one-liner)
```bash
pip install datasets  # if not yet installed
python - <<'PY'
from datasets import load_dataset, Dataset

qa_ds = load_dataset("shefali2023/webmd-data", split="train")  # 27 700 rows
print(qa_ds[0]["text"][:300])  # preview – Q&A packed in one string
# OPTIONAL: split the packed "<s>[INST] Q [/INST] A </s>" format into columns ↓
import re, json, pathlib
rows = []
pattern = re.compile(r"\\[INST\\](.*?)\\[/INST\\](.*)", re.S)
for record in qa_ds:
    m = pattern.search(record["text"])
    if not m: continue
    q, a = [s.strip() for s in m.groups()]
    rows.append({"question": q, "answer": a})
Dataset.from_list(rows).to_json("evaluation/datasets/webmd_symptom_qa.jsonl")
PY
```
*Typical fields after split*: `question`, `answer`  (plain text).

---
## 2  Prompt templates
Below prompts allow **direct ingestion** of these real questions and answers.

### 2-A  ⬆️  *Patient Question → Agent Response*
```text
SYSTEM:
You are PreExamChartingAgent.  A patient asks a health-related question.
For the given question, extract any explicit or implied SYMPTOMS, POSSIBLE CAUSES, and RECOMMENDED NEXT STEPS.
Return JSON with keys: symptoms[], differential[], advice.

USER (patient):
<question>
```
Expected JSON example:
```json
{
  "symptoms": ["abdominal pain", "nausea"],
  "differential": ["gastritis", "peptic ulcer"],
  "advice": "Schedule an upper endoscopy and avoid NSAIDs until seen."
}
```

### 2-B  ⬇️  *Ground-Truth Answer → Self-Critique*
```text
SYSTEM:
You are an expert medical QA auditor.  Compare the agent’s JSON output with the WebMD editor’s answer.
List MISSING or INCORRECT symptoms / advice.  Score completeness on a 0-5 scale.

REFERENCE ANSWER:
<answer>

AGENT JSON:
<agent_json>
```

The self-critique can be logged for automatic accuracy scoring in the benchmark runner.

---
## 3  Building an evaluation subset ("a few thousand" rows)
```python
from datasets import load_dataset
import json, pathlib, random

dst = pathlib.Path("evaluation/datasets")
dst.mkdir(parents=True, exist_ok=True)

raw = load_dataset("shefali2023/webmd-data", split="train")
raw = raw.shuffle(seed=42).select(range(4000))  # adjust sample size here

with open(dst/"webmd_symptom_qa_sample.jsonl", "w") as f:
    for rec in raw:
        text = rec["text"]
        # quick split – tolerates slight format drift
        if "[INST]" in text:
            q = text.split("[INST]")[1].split("[/INST]")[0].strip()
            a = text.split("[/INST]")[1].strip()
            f.write(json.dumps({"question": q, "answer": a})+"\n")
```
This produces a real-question test set that can be piped into the benchmark runner.

---
## 4  Feedback-driven prompt tuning
| Observed issue | Suggested fix |
|----------------|---------------|
| Agent misses *implicit* symptom mentions (“been throwing up at night”) | Add exemplar where symptom is implied not explicit |
| Over-diagnosis (lists too many differentials) | Constrain prompt: “return **max 4** differential diagnoses” |
| Advice too generic | Add `role=system` instruction: “Provide *specific* next step eg. ‘see gastroenterologist if pain persists >48 h’” |

Cycle: sample 50 Qs → run agent → review mismatches → patch prompt examples.

---
*Last updated:* <!-- YYYY-MM-DD will be auto-filled by commit --> 