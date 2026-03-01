"""
DamageAgent — assesses vehicle damage severity and estimates repair cost.
In production: calls a computer vision API (e.g., GPT-4V) with damage photos.
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from graph.state import FNOLState
from config.settings import settings

SYSTEM_PROMPT = """You are a vehicle damage assessment specialist.

Based on the damage description and any available photo context, assess:
1. Damage severity: minor | moderate | severe | total_loss
2. Estimated repair cost in USD
3. Key damage observations

Severity guidelines:
- minor: cosmetic damage < $2,000 (scratches, small dents)
- moderate: structural or mechanical damage $2,000-$10,000
- severe: major structural damage $10,000-$25,000
- total_loss: repair cost exceeds 75% of vehicle value or > $25,000

Output a JSON block:
<damage_result>
{
  "damage_severity": "moderate",
  "estimated_cost": 4500.0,
  "observations": "Front bumper and hood damage consistent with frontal collision..."
}
</damage_result>
"""


def damage_node(state: FNOLState) -> dict:
    """LangGraph node: assess damage and estimate costs."""
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0,
    )

    context = f"""
Damage description: {state.get('damage_description', 'N/A')}
Vehicle: {state.get('vehicle_year', '')} {state.get('vehicle_make', '')} {state.get('vehicle_model', '')}
Images provided: {len(state.get('damage_image_urls', []))} photos
Policy coverage type: {state.get('policy_coverage_type', 'N/A')}
"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        SystemMessage(content=f"Claim context:\n{context}"),
    ]
    response = llm.invoke(messages)

    partial: dict = {
        "messages": [AIMessage(content=f"[DamageAgent] {response.content}")],
        "pipeline_stage": "damage",
    }

    content = response.content
    if "<damage_result>" in content and "</damage_result>" in content:
        import json
        try:
            raw = content.split("<damage_result>")[1].split("</damage_result>")[0].strip()
            data = json.loads(raw)
            partial.update({
                "damage_severity": data.get("damage_severity", "unknown"),
                "estimated_cost": float(data.get("estimated_cost") or 0),
                "pipeline_stage": "fraud",
            })
        except (json.JSONDecodeError, IndexError, ValueError):
            partial["pipeline_stage"] = "fraud"

    return partial
