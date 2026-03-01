"""
FNOLState — single shared TypedDict for all 8 agents.
Extends CopilotKitState so the entire state is streamed to the frontend
via AG-UI StateDeltaEvents.
"""

from typing import Annotated, Literal, Optional
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from copilotkit import CopilotKitState


PipelineStage = Literal[
    "intake",
    "document",
    "policy",
    "damage",
    "fraud",
    "triage",
    "stp",
    "comms",
    "complete",
    "human_review",
]

DamageSeverity = Literal["minor", "moderate", "severe", "total_loss", "unknown"]

PaymentStatus = Literal["pending", "approved", "processing", "paid", "rejected", ""]


class FNOLState(CopilotKitState):
    # ── conversation history (append-only via add_messages reducer) ──────────
    messages: Annotated[list, add_messages]

    # ── pipeline progress ─────────────────────────────────────────────────────
    pipeline_stage: PipelineStage

    # ── claim identity ────────────────────────────────────────────────────────
    claim_id: str
    claimant_name: str
    claimant_phone: str
    claimant_email: str
    incident_date: str
    incident_location: str
    vehicle_vin: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: str
    damage_description: str

    # ── policy verification ───────────────────────────────────────────────────
    policy_number: str
    policy_valid: bool
    policy_coverage_type: str
    policy_deductible: float
    policy_limit: float

    # ── document processing ───────────────────────────────────────────────────
    documents_received: list[str]
    documents_missing: list[str]
    documents_processed: bool

    # ── damage assessment ─────────────────────────────────────────────────────
    damage_severity: DamageSeverity
    estimated_cost: float
    damage_image_urls: list[str]

    # ── fraud detection ───────────────────────────────────────────────────────
    fraud_score: float          # 0.0 – 1.0
    fraud_flags: list[str]
    fraud_review_required: bool

    # ── triage & routing ──────────────────────────────────────────────────────
    stp_eligible: bool
    triage_notes: str

    # ── human-in-the-loop ─────────────────────────────────────────────────────
    human_review_requested: bool
    adjuster_id: Optional[str]
    adjuster_notes: str
    adjuster_decision: Literal["approve", "escalate", "reject", ""]

    # ── STP & payment ─────────────────────────────────────────────────────────
    payment_amount: float
    payment_status: PaymentStatus

    # ── communications ────────────────────────────────────────────────────────
    notifications_sent: list[str]
    last_notification: str


def initial_state() -> dict:
    """Return a blank FNOLState-compatible dict."""
    return {
        "messages": [],
        "pipeline_stage": "intake",
        "claim_id": "",
        "claimant_name": "",
        "claimant_phone": "",
        "claimant_email": "",
        "incident_date": "",
        "incident_location": "",
        "vehicle_vin": "",
        "vehicle_make": "",
        "vehicle_model": "",
        "vehicle_year": "",
        "damage_description": "",
        "policy_number": "",
        "policy_valid": False,
        "policy_coverage_type": "",
        "policy_deductible": 0.0,
        "policy_limit": 0.0,
        "documents_received": [],
        "documents_missing": [],
        "documents_processed": False,
        "damage_severity": "unknown",
        "estimated_cost": 0.0,
        "damage_image_urls": [],
        "fraud_score": 0.0,
        "fraud_flags": [],
        "fraud_review_required": False,
        "stp_eligible": False,
        "triage_notes": "",
        "human_review_requested": False,
        "adjuster_id": None,
        "adjuster_notes": "",
        "adjuster_decision": "",
        "payment_amount": 0.0,
        "payment_status": "",
        "notifications_sent": [],
        "last_notification": "",
    }
