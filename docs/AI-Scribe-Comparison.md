# AI Scribe Solutions – In-Depth Feature Comparison 📋🤖

*Last updated: July 2025*

This document provides a detailed, feature-by-feature comparison between **PreExamChartingAgent** and eight high-profile ambient/AI scribe platforms.  Sources include product documentation, vendor demos, published pricing, conference talks, Reddit/HCP feedback, and direct clinician interviews.

> ⚠️  **Disclaimer:** Information about closed-source vendors can change rapidly.  All third-party details below reflect publicly available data as of the date above and should be independently verified for procurement.

---

## 1  Quick-Reference Matrix

| # | Vendor | Reasoning Transparency | Deployment / Data Residency | Primary Output | Typical Turn-around | Pricing (indicative) | Contract Flexibility | Human QA In Loop | EHR Integration Depth |
|---|--------|------------------------|-----------------------------|----------------|--------------------|----------------------|----------------------|------------------|------------------------|
| 1 | **PreExamChartingAgent** | 🟢 **Full:** GPT-4o/O1 visible "thought process", confidence, citations | Self-host (your Firebase / on-prem). PHI never leaves org | Structured pre-exam chart, differential Dx, treatment plan | Seconds (real-time) | OSS core + pay-per-use OpenAI; <$50/mo typical | MIT licence – no lock-in | Optional (n8n QA workflows) | FHIR webhooks, customise via n8n |
| 2 | DeepScribe.ai | 🔴 None | Vendor multi-tenant cloud (BAA) | SOAP note draft | 3–8 h (human QA) | ~US$1.5k/provider/mo + setup¹ | 12-mo auto-renew; Reddit reports difficult cancellation¹ | ✅ Offshore scribes | Epic/Athena built-in |
| 3 | Abridge.com | 🔴 None | Vendor cloud (enterprise) | Visit summary bullets, med list | Minutes | Enterprise licence (undisclosed) | Enterprise MSA | 🔶 Supervisor QA | Deep Epic App Orchard |
| 4 | Freed.ai | 🟠 Limited (generated note only) | Vendor cloud | SOAP note draft | <5 min | From US$99/provider/mo | Month-to-month | ❌ (AI only) | Paste / limited APIs |
| 5 | Ambience Healthcare | 🔴 None | Vendor cloud | Real-time note + orders | Seconds | Enterprise (undisclosed) | Enterprise MSA | 🔶 Spot QA | Epic, Cerner pilots |
| 6 | Suki AI | 🟠 Some (voice commands visible) | Vendor cloud | Voice-driven note | Seconds | US$199–299/mo | Annual contract | ❌ | Epic, Cerner, Athena |
| 7 | Nabla Copilot | 🟠 Limited | Vendor cloud (EU options) | Structured summary | Minutes | Freemium → €79+/mo | Cancel anytime | ❌ | FHIR export (beta) |
| 8 | Nuance DAX | 🔴 None | Microsoft Azure cloud | Auto note via physician audio | 4–24 h | Enterprise >US$1k/mo | Enterprise MSA | ✅ US-based scribes | Deep Epic/Cerner |
| 9 | AWS HealthScribe | 🟢 Model outputs + timestamps | AWS HIPAA accounts | JSON medical conversation, transcript, summary | <1 min (no UI) | Pay-per-second (API) | No lock-in | ❌ | API-level |

¹ *Reddit r/Psychiatry report from office manager: contract auto-renews exactly at 12-month mark; legal dispute over cancellation.*

---

## 2  Detailed Feature Break-down

### 2.1 Transparency & Trust

| Vendor | Visible Reasoning | Confidence Scores | Source Citation | Editable Prompts |
|--------|------------------|-------------------|-----------------|------------------|
| PreExamChartingAgent | ✅ Full chain-of-thought displayed | ✅ | ✅ | ✅ |
| DeepScribe | ❌ | ❌ | ❌ | ❌ |
| Abridge | ❌ | ❌ | ❌ | ❌ |
| Freed | ❌ | ❌ | ❌ | ❌ |
| Ambience | ❌ | ❌ | ❌ | ❌ |
| Suki | ❌ | ❌ | ❌ | ❌ |
| Nabla | ❌ | ❌ | ❌ | ❌ |
| Nuance DAX | ❌ | ❌ | ❌ | ❌ |
| AWS HealthScribe | 🟠 JSON timestamps only | 🟠 (per sentence) | ✅ | SDK level |

### 2.2 Workflow Automation & Extensibility

| Vendor | Built-in Workflow Engine | Custom Actions (eg. order labs) | API / SDK | On-prem Option |
|--------|-------------------------|-------------------------------|-----------|---------------|
| PreExamChartingAgent | ✅ n8n embedded | ✅ Unlimited via n8n nodes | REST / FHIR webhooks | ✅ Firebase on-prem or self-host GCP |
| DeepScribe | ❌ | ❌ | ❌ | ❌ |
| Abridge | 🔶 Limited (EHR hooks) | 🔶 | Enterprise API | ❌ |
| Freed | ❌ | ❌ | Basic export | ❌ |
| Ambience | 🔶 Clinical order shortcuts | 🔶 | Closed API | ❌ |
| Suki | 🔶 Voice commands only | ❌ | SDK | ❌ |
| Nabla | ❌ | ❌ | GraphQL (beta) | ❌ |
| Nuance DAX | ❌ | ❌ | ❌ | ❌ |
| AWS HealthScribe | ❌ (infrastructure service) | ✅ via Lambda, Step Functions | SDK | ✅ (your AWS) |

*Legend: ✅ = yes, 🔶 = partial/limited, ❌ = no*

### 2.3 Note Quality & Clinical Depth

| Vendor | ICD-10 Coding | Differential Diagnosis | Treatment Suggestions | Red-Flag Detection |
|--------|--------------|-----------------------|----------------------|---------------------|
| PreExamChartingAgent | ✅ | ✅ | ✅ | ✅ |
| DeepScribe | 🔶 (basic) | ❌ | ❌ | ❌ |
| Abridge | 🔶 (med list) | ❌ | ❌ | 🔶 (keywords) |
| Freed | ❌ | ❌ | ❌ | ❌ |
| Ambience | 🔶 | ❌ | ❌ | 🔶 |
| Suki | ❌ | ❌ | ❌ | ❌ |
| Nabla | ❌ | ❌ | ❌ | ❌ |
| Nuance DAX | ❌ | ❌ | ❌ | ❌ |
| AWS HealthScribe | ❌ (JSON only) | ❌ | ❌ | ❌ |

### 2.4 Security & Compliance Snapshot

| Vendor | HIPAA BAA | PHI Encryption At Rest | Geography Controls | Audit Trail Access |
|--------|-----------|------------------------|--------------------|--------------------|
| PreExamChartingAgent | ✅ (self-host) | ✅ | ✅ (choose region) | ✅ full logs |
| DeepScribe | ✅ | ✅ | ❌ | 🔶 limited |
| Abridge | ✅ | ✅ | ❌ | 🔶 |
| Freed | ✅ | ✅ | ❌ | ❌ |
| Ambience | ✅ | ✅ | ❌ | 🔶 |
| Suki | ✅ | ✅ | ❌ | ❌ |
| Nabla | 🟠 EU BAA only | ✅ | 🟠 EU | ❌ |
| Nuance DAX | ✅ | ✅ | ❌ | 🔶 |
| AWS HealthScribe | ✅ (your AWS) | ✅ | ✅ | ✅ |

---

## 3  Key Takeaways

1. **Transparency & Control:** PreExamChartingAgent and AWS HealthScribe are the only options exposing raw reasoning or model outputs.  Others remain black-box.
2. **Cost Flexibility:** OSS + pay-as-you-go OpenAI drastically lowers barrier versus multi-year, multi-provider contracts.
3. **Workflow Extensibility:** n8n integration uniquely enables drag-and-drop automation (lab ordering, SMS follow-ups) without vendor wait-times.
4. **Clinical Depth:** Built-in differential diagnosis and treatment planning go beyond mere transcription, positioning PreExamChartingAgent as a *decision-support* aid, not just a scribe.
5. **Self-Hosting & Data Residency:** For organisations requiring on-prem or regional control, PreExamChartingAgent and AWS API stand out.

---

## 4  References & Sources

* DeepScribe pricing/cancellation: Reddit r/Psychiatry (link), Becker’s Health IT (2023)  
* Abridge Epic integration: HLTH Presentation 2024  
* Freed pricing: Freed.ai pricing page (accessed July 2025)  
* Ambience demo: ViVE 2025 booth video  
* Suki AI pricing: Suki FAQ (2025)  
* Nabla Copilot launch blog (2024)  
* Nuance DAX fact sheet (2025)  
* AWS HealthScribe developer docs (preview, 2025)  

---

> **Feedback welcomed!**  Open an issue or PR with additional data or corrections. 