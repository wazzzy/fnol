"""
STPAgent — Straight-Through Processing: auto-approves and initiates payment for simple claims.
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from graph.state import FNOLState
from config.settings import settings


def stp_node(state: FNOLState) -> dict:
    """LangGraph node: auto-settle eligible claims."""
    estimated_cost = state.get("estimated_cost", 0.0)
    deductible = state.get("policy_deductible", 0.0)
    policy_limit = state.get("policy_limit", 50000.0)

    # Payment = min(estimated_cost - deductible, policy_limit)
    payment_amount = max(0.0, min(estimated_cost - deductible, policy_limit))

    summary = (
        f"[STPAgent] Claim {state.get('claim_id', 'N/A')} approved for Straight-Through Processing.\n"
        f"Estimated cost: ${estimated_cost:,.2f}\n"
        f"Deductible applied: ${deductible:,.2f}\n"
        f"Payment amount: ${payment_amount:,.2f}\n"
        f"Status: Payment processing initiated."
    )

    return {
        "messages": [AIMessage(content=summary)],
        "payment_amount": payment_amount,
        "payment_status": "processing",
        "pipeline_stage": "comms",
    }
