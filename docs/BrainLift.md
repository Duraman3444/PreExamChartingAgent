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
| n8n Documentation | https://docs.n8n.io/ | Visual workflow automation platform for EHR integration |
| n8n Webhook Nodes | https://docs.n8n.io/integrations/core-nodes/n8n-nodes-base.webhook/ | Triggering workflows from EHR systems |
| n8n OpenAI Integration | https://docs.n8n.io/integrations/nodes/n8n-nodes-base.openai/ | AI-powered transcript summarization |
| n8n HTTP Request Nodes | https://docs.n8n.io/integrations/core-nodes/n8n-nodes-base.httprequest/ | EHR API integration patterns |
| n8n Slack Integration | https://docs.n8n.io/integrations/nodes/n8n-nodes-base.slack/ | Nursing team notifications |
| Slack Bot Token Setup | https://api.slack.com/authentication/token-types#bot | Setting up automated notifications |
| EHR Integration Patterns | https://www.hl7.org/fhir/ | Healthcare data exchange standards |
| Automation Workflows Doc | docs/automation-workflows.md | Complete workflow documentation and setup |
| n8n Setup Guide | docs/n8n-workflow-setup.md | Step-by-step n8n installation and configuration |

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
- **v0.2.0** – Added automation workflows section with n8n integration resources, EHR integration patterns, and Slack notification setup guides.
- **v0.3.0** – Added comprehensive n8n setup guide with installation, configuration, and production deployment instructions.

---

> **Tip:** Reference BrainLift in code comments or PR descriptions so reviewers can quickly jump to the underlying reasoning. 