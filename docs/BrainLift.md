# BrainLift 📚✨
*A living knowledge hub for how we "lifted" the codebase with AI workflows.*

## 1. Purpose
BrainLift collects every reference, tutorial, paper, or blog post that helped us design, implement, and improve the Pre-Examination Charting Agent.  
It keeps the whole team (and future contributors) up-to-speed on the rationale behind our AI choices and makes onboarding painless.

## 2. Key Resources
| Topic | Link | Why it's useful |
|-------|------|----------------|
| LangChain "Agents" docs | https://python.langchain.com/docs/modules/agents/ | How we orchestrate external tools + GPT-4o |
| OpenAI Function-calling guide | https://platform.openai.com/docs/guides/function-calling | Safer, structured LLM outputs |
| HIPAA & de-identification | https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html | Ensuring PHI never leaves our control |
| React Diff Viewer | https://github.com/praneshr/react-diff-viewer | The diff UI for nurse verification |
| (Replace-me) Your internal design doc | **TODO: add link** | Full architecture & decision log |

_Add new rows as you discover more material. Keep explanations concise._

## 3. Contribution Guide
1. Found a great article, video, or library?  
   • Add it to the table above with a short description.  
2. Made a significant architectural decision?  
   • Link the design doc, ADR, or PR under "Key Resources".  
3. Updated the LLM prompt or workflow?  
   • Summarize *why* in a bullet under **Changelog** (below).

## 4. Changelog
- **v0.1.0** – Initial BrainLift created (resources on agents, PHI de-ID, diff viewer).

---

> **Tip:** Reference BrainLift in code comments or PR descriptions so reviewers can quickly jump to the underlying reasoning. 