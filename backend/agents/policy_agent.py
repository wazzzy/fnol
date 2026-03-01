"""
PolicyAgent — verifies policy validity, coverage, deductibles, and limits.
In production this calls a real insurance core-system API.
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from graph.state import FNOLState
from config.settings import settings

SYSTEM_PROMPT = """You are an insurance policy verification specialist.

Given the claim information, simulate a policy lookup and determine:
- Whether the policy is valid and active at the time of the incident
- Coverage type (comprehensive, collision, liability, etc.)
- Deductible amount
- Coverage limit
- Any flags (lapsed, exclusions, etc.)

Output a JSON block:
<policy_result>
{
  "policy_valid": true,
  "policy_coverage_type": "comprehensive",
  "policy_deductible": 500.0,
  "policy_limit": 50000.0,
  "notes": "Policy active at time of incident. No exclusions found."
}
</policy_result>
"""


def policy_node(state: FNOLState) -> dict:
    """LangGraph node: verify policy coverage."""
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0,
    )

    context = f"""
Policy number: {state.get('policy_number', 'unknown')}
Claimant: {state.get('claimant_name', 'N/A')}
Vehicle: {state.get('vehicle_year', '')} {state.get('vehicle_make', '')} {state.get('vehicle_model', '')}
VIN: {state.get('vehicle_vin', 'N/A')}
Incident date: {state.get('incident_date', 'N/A')}
"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        SystemMessage(content=f"Claim context:\n{context}"),
    ]
    response = llm.invoke(messages)

    partial: dict = {
        "messages": [AIMessage(content=f"[PolicyAgent] {response.content}")],
        "pipeline_stage": "policy",
    }

    content = response.content
    if "<policy_result>" in content and "</policy_result>" in content:
        import json
        try:
            raw = content.split("<policy_result>")[1].split("</policy_result>")[0].strip()
            data = json.loads(raw)
            partial.update({
                "policy_valid": data.get("policy_valid", False),
                "policy_coverage_type": data.get("policy_coverage_type", ""),
                "policy_deductible": float(data.get("policy_deductible") or 0),
                "policy_limit": float(data.get("policy_limit") or 0),
                "pipeline_stage": "damage",
            })
        except (json.JSONDecodeError, IndexError, ValueError):
            partial["pipeline_stage"] = "damage"

    return partial
