"""
FNOL LangGraph orchestrator — wires all 8 nodes into a StateGraph.

Flow:
  START → intake → document → policy → damage → fraud
  fraud → (conditional) → triage | human_review_node
  triage → (conditional) → stp | human_review_node
  human_review_node → (conditional) → stp | comms | human_review_node
  stp → comms → END
"""

from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver

from graph.state import FNOLState
from graph.edges import route_after_fraud, route_after_triage, route_after_human_review
from agents.intake_agent import intake_node
from agents.document_agent import document_node
from agents.policy_agent import policy_node
from agents.damage_agent import damage_node
from agents.fraud_agent import fraud_node
from agents.triage_agent import triage_node
from agents.stp_agent import stp_node
from agents.comms_agent import comms_node
from agents.human_review_agent import human_review_node


def build_fnol_graph():
    """Build and compile the FNOL LangGraph with MemorySaver checkpointing."""
    builder = StateGraph(FNOLState)

    # ── Register nodes ────────────────────────────────────────────────────────
    builder.add_node("intake", intake_node)
    builder.add_node("document", document_node)
    builder.add_node("policy", policy_node)
    builder.add_node("damage", damage_node)
    builder.add_node("fraud", fraud_node)
    builder.add_node("triage", triage_node)
    builder.add_node("human_review_node", human_review_node)
    builder.add_node("stp", stp_node)
    builder.add_node("comms", comms_node)

    # ── Linear edges ──────────────────────────────────────────────────────────
    builder.add_edge(START, "intake")
    builder.add_edge("intake", "document")
    builder.add_edge("document", "policy")
    builder.add_edge("policy", "damage")
    builder.add_edge("damage", "fraud")

    # ── Conditional edges ─────────────────────────────────────────────────────
    builder.add_conditional_edges(
        "fraud",
        route_after_fraud,
        {"triage": "triage", "human_review_node": "human_review_node"},
    )

    builder.add_conditional_edges(
        "triage",
        route_after_triage,
        {"stp": "stp", "human_review_node": "human_review_node"},
    )

    builder.add_conditional_edges(
        "human_review_node",
        route_after_human_review,
        {
            "stp": "stp",
            "comms": "comms",
            "human_review_node": "human_review_node",
        },
    )

    builder.add_edge("stp", "comms")
    builder.add_edge("comms", END)

    # ── Compile with MemorySaver (swap to AsyncPostgresSaver for production) ──
    memory = MemorySaver()
    graph = builder.compile(
        checkpointer=memory,
        interrupt_before=["human_review_node"],  # pause before adjuster review
    )

    return graph


# Module-level graph instance used by FastAPI
fnol_graph = build_fnol_graph()
