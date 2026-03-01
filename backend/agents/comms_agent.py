"""
CommsAgent — sends status notifications to the claimant at key milestones.
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from graph.state import FNOLState
from config.settings import settings

SYSTEM_PROMPT = """You are an insurance claims communications specialist.

Draft a professional, empathetic customer notification based on the current claim status.
The notification should:
- Address the claimant by name
- Clearly state the claim decision/status
- Include next steps and expected timeline
- Provide contact information for follow-up
- Be concise (under 200 words)

Keep the tone warm, professional, and clear.
"""


def comms_node(state: FNOLState) -> dict:
    """LangGraph node: generate and send customer notifications."""
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0.4,
    )

    pipeline_stage = state.get("pipeline_stage", "complete")
    payment_status = state.get("payment_status", "")
    adjuster_decision = state.get("adjuster_decision", "")

    if adjuster_decision == "reject":
        status_summary = "claim has been reviewed and unfortunately cannot be approved at this time"
    elif payment_status in ("processing", "paid"):
        status_summary = f"claim has been approved and payment of ${state.get('payment_amount', 0):,.2f} is being processed"
    else:
        status_summary = "claim is currently under review and an adjuster will contact you shortly"

    context = f"""
Claimant name: {state.get('claimant_name', 'Valued Customer')}
Claim ID: {state.get('claim_id', 'N/A')}
Claimant email: {state.get('claimant_email', 'N/A')}
Claimant phone: {state.get('claimant_phone', 'N/A')}
Claim status: {status_summary}
Payment amount: ${state.get('payment_amount', 0):,.2f}
Payment status: {payment_status}
Adjuster notes: {state.get('adjuster_notes', 'N/A')}
"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        SystemMessage(content=f"Claim context:\n{context}"),
    ]
    response = llm.invoke(messages)

    notification_text = response.content
    notifications_sent = list(state.get("notifications_sent", []))
    notifications_sent.append(f"email:{state.get('claimant_email', '')}")

    return {
        "messages": [AIMessage(content=f"[CommsAgent] Notification sent:\n\n{notification_text}")],
        "notifications_sent": notifications_sent,
        "last_notification": notification_text,
        "pipeline_stage": "complete",
    }
