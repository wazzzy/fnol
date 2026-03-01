"""
Fraud check tools — heuristic and rule-based fraud signal detectors.
"""

from datetime import datetime, timedelta
from typing import List


def check_new_policy_claim(policy_effective_date: str, incident_date: str) -> bool:
    """Flag if claim occurs within 30 days of policy start."""
    try:
        effective = datetime.strptime(policy_effective_date, "%Y-%m-%d")
        incident = datetime.strptime(incident_date, "%Y-%m-%d")
        return (incident - effective).days < 30
    except ValueError:
        return False


def check_high_cost_ratio(estimated_cost: float, vehicle_value: float) -> bool:
    """Flag if estimated repair cost exceeds 90% of vehicle value (possible fraud or total loss staging)."""
    if vehicle_value <= 0:
        return False
    return (estimated_cost / vehicle_value) > 0.9


def check_inconsistent_damage(damage_description: str, estimated_cost: float) -> bool:
    """Simple heuristic: minor description but high cost."""
    minor_keywords = ["scratch", "scuff", "small dent", "minor"]
    is_described_as_minor = any(kw in damage_description.lower() for kw in minor_keywords)
    return is_described_as_minor and estimated_cost > 5000.0


def compute_fraud_score(flags: List[str]) -> float:
    """
    Compute a composite fraud score from a list of flag names.
    Each flag contributes a weight; score is capped at 1.0.
    """
    weights = {
        "new_policy_claim": 0.35,
        "high_cost_ratio": 0.30,
        "inconsistent_damage": 0.25,
        "missing_police_report": 0.15,
        "duplicate_claim": 0.50,
        "suspicious_timing": 0.20,
    }
    score = sum(weights.get(flag, 0.10) for flag in flags)
    return min(score, 1.0)
