"""
HumanReviewAgent — pauses the graph and prepares a data packet for the adjuster.
The graph uses interrupt_before=["stp"] so execution halts here until
an adjuster posts a decision via the API.
"""

from langchain_core.messages import AIMessage
from graph.state import FNOLState


def human_review_node(state: FNOLState) -> dict:
    """
    LangGraph node: prepare human review packet and pause for adjuster decision.
    The graph is interrupted before 'stp' — this node just generates the summary.
    """
    claim_id = state.get("claim_id", "N/A")
    fraud_score = state.get("fraud_score", 0.0)
    estimated_cost = state.get("estimated_cost", 0.0)
    damage_severity = state.get("damage_severity", "unknown")
    triage_notes = state.get("triage_notes", "")
    fraud_flags = state.get("fraud_flags", [])
    documents_missing = state.get("documents_missing", [])

    packet = f"""[HumanReviewAgent] Adjuster Review Packet — Claim {claim_id}

═══════════════════════════════════════════
CLAIM SUMMARY
═══════════════════════════════════════════
Claimant:        {state.get('claimant_name', 'N/A')}
Phone:           {state.get('claimant_phone', 'N/A')}
Email:           {state.get('claimant_email', 'N/A')}
Incident Date:   {state.get('incident_date', 'N/A')}
Location:        {state.get('incident_location', 'N/A')}
Vehicle:         {state.get('vehicle_year', '')} {state.get('vehicle_make', '')} {state.get('vehicle_model', '')}
VIN:             {state.get('vehicle_vin', 'N/A')}

DAMAGE ASSESSMENT
─────────────────
Severity:        {damage_severity.upper()}
Estimated Cost:  ${estimated_cost:,.2f}
Description:     {state.get('damage_description', 'N/A')}

POLICY
──────
Policy #:        {state.get('policy_number', 'N/A')}
Valid:           {'YES' if state.get('policy_valid') else 'NO'}
Coverage:        {state.get('policy_coverage_type', 'N/A')}
Deductible:      ${state.get('policy_deductible', 0):,.2f}
Limit:           ${state.get('policy_limit', 0):,.2f}

FRAUD ASSESSMENT
────────────────
Fraud Score:     {fraud_score:.2f} / 1.00
Flags:           {', '.join(fraud_flags) if fraud_flags else 'None'}

DOCUMENTS
─────────
Received:        {', '.join(state.get('documents_received', [])) or 'None'}
Missing:         {', '.join(documents_missing) or 'None'}

TRIAGE NOTES
────────────
{triage_notes or 'N/A'}

═══════════════════════════════════════════
ACTION REQUIRED: Please approve, escalate, or reject this claim.
═══════════════════════════════════════════
"""

    return {
        "messages": [AIMessage(content=packet)],
        "pipeline_stage": "human_review",
        "human_review_requested": True,
    }
