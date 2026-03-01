"""
IntakeAgent — conversational FNOL intake.
Extracts structured claim data from the claimant's natural language input.
"""

import uuid
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from graph.state import FNOLState
from config.settings import settings

SYSTEM_PROMPT = """You are an empathetic FNOL (First Notice of Loss) intake agent for an automotive insurance company.

Your job is to:
1. Acknowledge the claimant and express empathy for their situation
2. Extract the following information through natural conversation:
   - Full name, phone number, email
   - Date and location of the incident
   - Vehicle details (make, model, year, VIN if available)
   - Brief description of the damage
   - Policy number (if known)

Be conversational, calm, and reassuring. Ask follow-up questions if information is missing.
Once you have all essential details (name, date, location, vehicle, damage description),
output a JSON summary at the end of your message in this exact format:

<claim_data>
{
  "claimant_name": "...",
  "claimant_phone": "...",
  "claimant_email": "...",
  "incident_date": "...",
  "incident_location": "...",
  "vehicle_make": "...",
  "vehicle_model": "...",
  "vehicle_year": "...",
  "vehicle_vin": "...",
  "damage_description": "...",
  "policy_number": "..."
}
</claim_data>
"""


def intake_node(state: FNOLState) -> dict:
    """LangGraph node: run the intake conversation."""
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0.3,
    )

    messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(state.get("messages", []))
    response = llm.invoke(messages)

    # Parse structured claim data if present
    partial: dict = {
        "messages": [response],
        "pipeline_stage": "intake",
    }

    content = response.content
    if "<claim_data>" in content and "</claim_data>" in content:
        import json
        try:
            raw = content.split("<claim_data>")[1].split("</claim_data>")[0].strip()
            data = json.loads(raw)
            claim_id = data.get("claim_id") or f"FNOL-{uuid.uuid4().hex[:8].upper()}"
            partial.update({
                "claim_id": claim_id,
                "claimant_name": data.get("claimant_name", ""),
                "claimant_phone": data.get("claimant_phone", ""),
                "claimant_email": data.get("claimant_email", ""),
                "incident_date": data.get("incident_date", ""),
                "incident_location": data.get("incident_location", ""),
                "vehicle_make": data.get("vehicle_make", ""),
                "vehicle_model": data.get("vehicle_model", ""),
                "vehicle_year": data.get("vehicle_year", ""),
                "vehicle_vin": data.get("vehicle_vin", ""),
                "damage_description": data.get("damage_description", ""),
                "policy_number": data.get("policy_number", ""),
                "pipeline_stage": "document",
            })
        except (json.JSONDecodeError, IndexError):
            pass  # Keep stage at intake; claimant needs to provide more info

    return partial
