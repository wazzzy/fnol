"""
TriageAgent — classifies claims and determines routing (STP vs human review).
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from graph.state import FNOLState
from config.settings import settings

SYSTEM_PROMPT = """You are an insurance claims triage specialist.

Analyze the complete claim profile and determine:
1. Whether this qualifies for Straight-Through Processing (STP) — fully automated settlement
2. Whether human review is required
3. Routing rationale

STP eligibility criteria (ALL must be true):
- Policy is valid
- Fraud score < 0.3
- Damage severity is "minor" or "moderate"
- Estimated cost < $10,000
- No missing critical documents
- No fraud flags

Output a JSON block:
<triage_result>
{
  "stp_eligible": false,
  "human_review_requested": true,
  "triage_notes": "Claim routed to adjuster: estimated cost $15,000 exceeds STP threshold..."
}
</triage_result>
"""


def triage_node(state: FNOLState) -> dict:
    """LangGraph node: classify and route the claim."""
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0,
    )

    context = f"""
Claim ID: {state.get('claim_id', 'N/A')}
Policy valid: {state.get('policy_valid', False)}
Coverage type: {state.get('policy_coverage_type', 'N/A')}
Deductible: ${state.get('policy_deductible', 0):,.2f}
Coverage limit: ${state.get('policy_limit', 0):,.2f}
Damage severity: {state.get('damage_severity', 'unknown')}
Estimated cost: ${state.get('estimated_cost', 0):,.2f}
Fraud score: {state.get('fraud_score', 0.0):.2f}
Fraud flags: {state.get('fraud_flags', [])}
Documents missing: {state.get('documents_missing', [])}
"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        SystemMessage(content=f"Claim context:\n{context}"),
    ]
    response = llm.invoke(messages)

    partial: dict = {
        "messages": [AIMessage(content=f"[TriageAgent] {response.content}")],
        "pipeline_stage": "triage",
    }

    content = response.content
    if "<triage_result>" in content and "</triage_result>" in content:
        import json
        try:
            raw = content.split("<triage_result>")[1].split("</triage_result>")[0].strip()
            data = json.loads(raw)
            stp = data.get("stp_eligible", False)
            human_review = data.get("human_review_requested", not stp)
            partial.update({
                "stp_eligible": stp,
                "human_review_requested": human_review,
                "triage_notes": data.get("triage_notes", ""),
                "pipeline_stage": "stp" if stp else "human_review",
            })
        except (json.JSONDecodeError, IndexError):
            partial["pipeline_stage"] = "human_review"

    return partial
