"""
DocumentAgent — processes uploaded documents (police reports, photos, repair estimates).
Uses OCR and classification to extract structured data.
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from graph.state import FNOLState
from config.settings import settings

REQUIRED_DOCS = ["police_report", "photos", "driver_license", "insurance_card"]

SYSTEM_PROMPT = """You are an insurance document processing specialist.

Analyze the claim context and determine:
1. Which documents have been received (based on the claim description)
2. Which required documents are still missing
3. Whether enough documentation exists to proceed

Required documents: police report, damage photos, driver's license, insurance card.

Output a JSON block in this format:
<doc_status>
{
  "documents_received": ["police_report", "photos"],
  "documents_missing": ["driver_license", "insurance_card"],
  "documents_processed": true
}
</doc_status>
"""


def document_node(state: FNOLState) -> dict:
    """LangGraph node: simulate document ingestion and status check."""
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0,
    )

    context = f"""
Claim ID: {state.get('claim_id', 'N/A')}
Claimant: {state.get('claimant_name', 'N/A')}
Damage description: {state.get('damage_description', 'N/A')}
Damage images provided: {state.get('damage_image_urls', [])}
"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        SystemMessage(content=f"Claim context:\n{context}"),
    ]
    response = llm.invoke(messages)

    partial: dict = {
        "messages": [AIMessage(content=f"[DocumentAgent] {response.content}")],
        "pipeline_stage": "document",
    }

    content = response.content
    if "<doc_status>" in content and "</doc_status>" in content:
        import json
        try:
            raw = content.split("<doc_status>")[1].split("</doc_status>")[0].strip()
            data = json.loads(raw)
            partial.update({
                "documents_received": data.get("documents_received", []),
                "documents_missing": data.get("documents_missing", []),
                "documents_processed": data.get("documents_processed", False),
                "pipeline_stage": "policy",
            })
        except (json.JSONDecodeError, IndexError):
            partial["pipeline_stage"] = "policy"

    return partial
