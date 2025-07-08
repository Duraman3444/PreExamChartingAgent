# 🩺 MedQuad Medical Q&A → Evaluation Corpus

*Core dataset:* [`keivalya/MedQuad-MedicalQnADataset`](https://huggingface.co/datasets/keivalya/MedQuad-MedicalQnADataset)  
*Optional baseline model:* [`Kabatubare/web-md-llama2-7b-3000`](https://huggingface.co/Kabatubare/web-md-llama2-7b-3000)

The **MedQuad** corpus contains **16 407** real, de-identified medical question–answer pairs scraped from quality-controlled websites (NIH, CDC, MedlinePlus, etc.).  Each row provides:

| Column | Description |
|--------|-------------|
| `qtype`    | One of 16 coarse categories (causes, symptoms, treatment, prognosis, …) |
| `Question` | Consumer-facing medical question (free text) |
| `Answer`   | Expert answer text (often multi-paragraph) |

Because the questions reflect genuine patient information-needs—and are already public with no direct identifiers—MedQuad is an excellent *real-world* benchmark for PreExamChartingAgent’s symptom-extraction and reasoning pipeline.

---
## 1  Quick download & inspect
```bash
pip install datasets  # ↳ once
python - <<'PY'
from datasets import load_dataset, Dataset

medquad = load_dataset("keivalya/MedQuad-MedicalQnADataset", split="train")
print(medquad[0])
print(f"Rows: {len(medquad):,}")
PY
```

---
## 2  Export JSONL for the benchmark runner
Run the helper script we just added:
```bash
python evaluation/scripts/fetch_medquad_dataset.py \
       --output evaluation/datasets/medquad_qa.jsonl  \
       --sample_size 16000   # optional cap
```
This yields a newline-delimited JSON file where every object has:
```json
{
  "question": "Can anemia cause chest pain?",
  "answer":   "Chest pain can occur when…",
  "qtype":    "causes"
}
```
The benchmark harness will treat **`question`** as the *patient utterance* and compare the agent’s structured chart + advice against **`answer`**.

---
## 3  Prompt templates
### 3-A  Patient question → Pre-exam chart
```
SYSTEM:
You are PreExamChartingAgent.  The text below is a real patient question.
Extract key symptoms, possible differentials, red-flag signs, and
populate the structured pre-exam chart.  Cite supporting phrases from
the question ("evidence") and assign a confidence 0-1.

PATIENT QUESTION:
<question_text>
```
Expected JSON response:
```json
{
  "chief_complaint": "Chest pain",
  "symptoms": [ … ],
  "differential_diagnoses": [ … ],
  "follow_up_questions": [ … ],
  "evidence": [ … ],
  "confidence": 0.82
}
```

### 3-B  Agent answer → Automated grading (BLEU / ROUGE / exact-match)
After running the agent over the JSONL file, an evaluation script will:
1. Concatenate the agent’s *explanatory* fields into a plain-text answer.  
2. Compute *ROUGE-L* and *BLEU-2* against MedQuad’s authoritative `answer`.  
3. Flag cases with ROUGE-L < 0.2 for manual review.

---
## 4  Using the *web-md-llama2-7b-3000* baseline (optional)
The community model [`Kabatubare/web-md-llama2-7b-3000`](https://huggingface.co/Kabatubare/web-md-llama2-7b-3000)—fine-tuned on 24 000 WebMD Q&A exchanges—provides a handy *non-production* baseline.

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
from datasets import load_dataset

tok = AutoTokenizer.from_pretrained("Kabatubare/web-md-llama2-7b-3000")
model = AutoModelForCausalLM.from_pretrained("Kabatubare/web-md-llama2-7b-3000", device_map="auto")

sample = load_dataset("keivalya/MedQuad-MedicalQnADataset", split="train")[0]
prompt = f"### Question:\n{sample['Question']}\n### Answer:"
inputs = tok(prompt, return_tensors="pt").to(model.device)
output = model.generate(**inputs, max_new_tokens=256)
print(tok.decode(output[0], skip_special_tokens=True))
```
> **Disclaimer:** This baseline is *not* HIPAA-compliant and should never touch production data.

---
## 5  Feedback-driven prompt tuning
| Issue observed | Quick tweak |
|----------------|------------|
| Agent lists too many irrelevant differentials | Increase `temperature` penalty, add "limit to top-5" in instructions |
| Missing red-flag extraction | Include explicit *"Identify RED FLAG signs"* bullet |
| Low ROUGE-L vs ground truth | Inject chain-of-thought reasoning before final JSON |

Track metrics (`scripts/eval/score.py`) after each tweak to avoid regressions.

---
## 6  Folder conventions
| Path | Purpose |
|------|---------|
| `evaluation/datasets/medquad_qa.jsonl` | Gold corpus (real patient Q&A) |
| `evaluation/runs/<date>/` | Agent outputs + metrics |

With MedQuad integrated, we now cover *both* consumer drug reviews (WebMD) **and** medical Q&A queries, giving broader coverage across symptom narratives and advice quality. 