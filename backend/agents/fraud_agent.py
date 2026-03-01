"""
FraudAgent — computes a fraud risk score and flags suspicious patterns.
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from graph.state import FNOLState
from config.settings import settings

SYSTEM_PROMPT = """You are an insurance fraud detection specialist.

Analyze the claim for fraud indicators including:
- New policy with immediate claim (< 30 days)
- High estimated cost relative to vehicle age
- Inconsistencies between damage description and vehicle info
- Multiple claims from same claimant recently
- Suspicious incident timing or location
- Missing or incomplete documentation

Return a fraud risk score between 0.0 (no risk) and 1.0 (definite fraud).
Threshold: score >= 0.7 triggers mandatory human review (SIU referral).

Output a JSON block:
<fraud_result>
{
  "fraud_score": 0.15,
  "fraud_flags": ["new_policy_claim"],
  "fraud_review_required": false,
  "summary": "Low risk. Minor flag for new policy, but damage is consistent with description."
}
</fraud_result>
"""


def fraud_node(state: FNOLState) -> dict:
    """LangGraph node: compute fraud risk score."""
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0,
    )

    context = f"""
Claim ID: {state.get('claim_id', 'N/A')}
Claimant: {state.get('claimant_name', 'N/A')}
Policy number: {state.get('policy_number', 'N/A')}
Policy valid: {state.get('policy_valid', False)}
Incident date: {state.get('incident_date', 'N/A')}
Damage severity: {state.get('damage_severity', 'unknown')}
Estimated cost: ${state.get('estimated_cost', 0):,.2f}
Vehicle: {state.get('vehicle_year', '')} {state.get('vehicle_make', '')} {state.get('vehicle_model', '')}
Documents received: {state.get('documents_received', [])}
Documents missing: {state.get('documents_missing', [])}
"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        SystemMessage(content=f"Claim context:\n{context}"),
    ]
    response = llm.invoke(messages)

    partial: dict = {
        "messages": [AIMessage(content=f"[FraudAgent] {response.content}")],
        "pipeline_stage": "fraud",
    }

    content = response.content
    if "<fraud_result>" in content and "</fraud_result>" in content:
        import json
        try:
            raw = content.split("<fraud_result>")[1].split("</fraud_result>")[0].strip()
            data = json.loads(raw)
            partial.update({
                "fraud_score": float(data.get("fraud_score", 0.0)),
                "fraud_flags": data.get("fraud_flags", []),
                "fraud_review_required": data.get("fraud_review_required", False),
                "pipeline_stage": "triage",
            })
        except (json.JSONDecodeError, IndexError, ValueError):
            partial["pipeline_stage"] = "triage"

    return partial
