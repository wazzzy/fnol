# FNOL Automotive AI Agents — Full Multi-Agent Pipeline

A greenfield AI agent system for the First Notice of Loss (FNOL) automotive insurance workflow.
Built as a multi-agent pipeline from intake through settlement using the Anthropic Claude SDK.

## Architecture

```
Claimant Input
     │
     ▼
[Intake Agent] ─────────────────────────────────────────────┐
     │ extracts structured FNOL data                        │
     ▼                                                       │
[Document Agent] ── OCR + IDP ──────────────────────────────┤
     │                                                       │
     ▼                                                       │
[Policy Verification Agent] ── API calls to core system     │
     │                                                       │
     ▼                                                       │
[Damage Assessment Agent] ── Computer Vision                │
     │                                                       │
     ▼                                                       │
[Fraud Detection Agent] ── Risk Score                       │
     │                                                       │
     ▼                                                       │
[Triage & Routing Agent] ──────┬──────────────────────────  │
                               │                            │
               ┌───────────────┤                            │
               ▼               ▼                            │
        [STP Agent]    [Human Adjuster Queue]               │
     (auto-settle)     (data packet prepared)               │
               │                                            │
               └─────────────────────────────────────────── ▼
                                                   [Comms Agent]
                                               (status updates, coordination)
```

## Agents

| # | Agent | Key Tools | Triggers |
|---|-------|-----------|---------|
| 1 | **IntakeAgent** | NLP extraction, form parser | Claimant input (voice/chat/web) |
| 2 | **DocumentAgent** | OCR, IDP classifier, S3 upload | FNOL created |
| 3 | **PolicyAgent** | Policy API lookup, coverage checker | After intake |
| 4 | **DamageAgent** | Computer vision API, cost estimator | After docs received |
| 5 | **FraudAgent** | Anomaly scorer, duplicate checker | After damage assessed |
| 6 | **TriageAgent** | Severity classifier, router | After fraud scored |
| 7 | **STPAgent** | Auto-approver, payment initiator | Triage → simple claims |
| 8 | **CommsAgent** | SMS/email sender, status tracker | Each milestone |

## What AI Agents Solve in FNOL Automotive

### 1. INTAKE & FIRST RESPONSE
**Problem:** Claimants can only report accidents during business hours; intake is manual and slow.
**AI Agent Capabilities:**
- 24/7 voice AI agent for accident reporting via phone (natural language)
- Conversational chatbot / web portal for structured claim submission
- Omnichannel intake: SMS, WhatsApp, mobile app, web, IVR
- Automatic extraction of: date/time of incident, location, vehicle info, parties involved, description of damage
- Auto-generation of FNOL case number and acknowledgment

**Impact:** Claim acknowledgment from 4+ hours → under 10 minutes

---

### 2. DOCUMENT PROCESSING & EXTRACTION
**Problem:** Claims arrive as unstructured PDFs, photos, emails, scanned forms.
**AI Agent Capabilities:**
- OCR + NLP to extract structured data from FNOL forms, police reports, repair estimates
- Intelligent Document Processing (IDP) — classify document type before extraction
- Auto-flag missing or incomplete documents
- Extract and validate: policyholder name, VIN, license plates, coverage details, witness info
- Convert handwritten or scanned damage reports into structured records

**Impact:** 40–50% reduction in manual processing time

---

### 3. VEHICLE DAMAGE ASSESSMENT (COMPUTER VISION)
**Problem:** Damage estimation requires physical adjuster visits, causing delays.
**AI Agent Capabilities:**
- Computer vision analysis of photos/videos submitted via smartphone
- Auto-classify damage type: dent, scratch, structural damage, total loss
- Severity banding: minor / moderate / severe / total loss
- Repair cost estimation from images
- Flag discrepancies between reported damage and visual evidence

**Impact:** Eliminate adjuster dispatch for low-complexity claims; 1–2 day settlement vs. 7–15 days

---

### 4. POLICY & COVERAGE VERIFICATION
**Problem:** Adjusters manually look up policy details, causing bottlenecks.
**AI Agent Capabilities:**
- Auto-lookup policyholder info, active coverage, deductibles, and limits
- Verify vehicle is covered at time of incident
- Check for exclusions, endorsements, and special conditions
- Flag lapsed policies or coverage gaps before proceeding
- Cross-reference against core insurance system APIs

**Impact:** Instant eligibility determination; eliminates manual lookup steps

---

### 5. FRAUD DETECTION & RISK SCORING
**Problem:** $40B+ in insurance fraud annually; hard to detect at intake stage.
**AI Agent Capabilities:**
- Anomaly detection: unusual claim patterns, repeat claimants, suspicious timelines
- Duplicate claim detection across policyholders
- Cross-reference with telematics/black box data to validate incident details
- Staged accident pattern recognition (e.g., short gap between policy start and claim)
- AI risk score attached to every FNOL before routing

**Impact:** Proactive fraud flagging before claim progresses; lower loss-adjustment costs

---

### 6. TRIAGE & INTELLIGENT ROUTING
**Problem:** All claims go to same queue regardless of complexity; high-value claims get delayed.
**AI Agent Capabilities:**
- Auto-classify claims: simple / complex / litigated / SIU (Special Investigation Unit)
- Route based on: severity score, fraud risk, coverage type, geographic adjuster availability
- Straight-Through Processing (STP) for low-complexity claims (e.g., windshield, minor fender bender)
- Escalate high-risk or high-value claims to senior adjusters with a pre-populated data packet
- Auto-assign repair shops or rental car providers based on location

**Impact:** 60–80% of low-complexity claims resolved without human intervention

---

### 7. CUSTOMER COMMUNICATION & STATUS UPDATES
**Problem:** Claimants left in the dark; call center overloaded with status queries.
**AI Agent Capabilities:**
- Automated outbound SMS/email/push notifications at each claim milestone
- Conversational agent to answer "Where is my claim?" queries 24/7
- Collect additional documents or information proactively
- Coordinate rental car, repair shop appointments via agent
- Empathetic AI agent for initial trauma/accident conversation

**Impact:** Reduce inbound call volume by 40–60%; improve NPS

---

### 8. STRAIGHT-THROUGH PROCESSING (STP) — FULLY AUTOMATED CLAIMS
**Problem:** Simple claims still require human touchpoints, inflating costs.
**AI Agent Capabilities:**
- End-to-end automated handling: intake → verify → assess → approve → pay
- Suitable for: glass claims, minor parking damage, theft of small items
- Auto-approve within defined authority limits
- Auto-initiate payment (direct deposit or digital wallet)
- Full audit trail for regulatory compliance

**Impact:** Sub-1-day claim resolution for qualifying events; 40–50% cost reduction

---

## Priority Recommendation

| Priority | Agent | Why |
|----------|-------|-----|
| 1 | Intake Agent | Foundation — all other agents depend on structured FNOL data |
| 2 | Policy Verification Agent | Instant eligibility check eliminates #1 manual bottleneck |
| 3 | Damage Assessment Agent | Highest wow-factor; most visible ROI |
| 4 | Fraud Detection Agent | Critical for insurer trust and adoption |
| 5 | Triage & Routing Agent | Enables STP; closes the automation loop |
| 6 | STP Agent | The ultimate outcome: zero-touch claims |
| 7 | Customer Comms Agent | Strong CX improvement; easy wins |
| 8 | Telematics Integration | Differentiator; requires data partnerships |

## Quick Start

```bash
npm install
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm run demo                # run the CLI demo harness
npm test                    # run tests
```

## Key Sources
- [Newgen: Role of AI Agents in Transforming FNOL](https://newgensoft.com/resources/article/the-role-of-ai-agents-in-transforming-fnol-and-accelerating-claims/)
- [ValueMomentum: Agentic Systems from FNOL to Settlement](https://www.valuemomentum.com/blogs/agentic-systems-for-claims-processing-from-first-notice-of-loss-to-settlement/)
- [ClaimGenius: AI for Auto Insurance FNOL](https://claimgenius.com/ai-for-auto-insurance/)
- [Neutrinos: How AI Transforms FNOL with Automation](https://www.neutrinos.com/resource-hub/how-ai-transforms-first-notice-of-loss-fnol-with-automation/)
- [Insillion: AI in Auto Insurance Claims FNOL](https://insillion.com/blog/ai-in-auto-insurance-claims-fnol)
- [Beam.ai: FNOL Agentic Workflows](https://beam.ai/workflows/fnol-claim-request)
- [Neudesic: STP for Auto Insurance Claims](https://www.neudesic.com/blog/ai-driven-stp-auto-insurance-claims/)
