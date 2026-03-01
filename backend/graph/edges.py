"""
Conditional routing functions for the FNOL LangGraph.
Each function receives the current FNOLState and returns the name of the next node.
"""

from graph.state import FNOLState


def route_after_intake(state: FNOLState) -> str:
    """After intake: always go to document processing."""
    return "document"


def route_after_fraud(state: FNOLState) -> str:
    """
    After fraud: if score is high, send straight to human_review;
    otherwise continue to triage.
    """
    if state.get("fraud_score", 0.0) >= 0.7:
        return "human_review_node"
    return "triage"


def route_after_triage(state: FNOLState) -> str:
    """
    After triage: if STP-eligible and no human review needed, go to stp;
    otherwise route to human_review.
    """
    if state.get("stp_eligible", False) and not state.get("human_review_requested", False):
        return "stp"
    return "human_review_node"


def route_after_human_review(state: FNOLState) -> str:
    """
    After an adjuster decision:
    - approve  → stp
    - escalate → human_review (loop, stays in human_review)
    - reject   → comms (send rejection notice)
    - (blank)  → stay in human_review (awaiting decision)
    """
    decision = state.get("adjuster_decision", "")
    if decision == "approve":
        return "stp"
    if decision == "reject":
        return "comms"
    # escalate or empty — remain in human_review until resolved
    return "human_review_node"
