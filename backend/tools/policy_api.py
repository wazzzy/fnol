"""
Policy API tool — looks up policy details from the core insurance system.
Uses httpx for async-compatible requests.
"""

import httpx
from typing import Optional
from config.settings import settings


async def lookup_policy(policy_number: str) -> dict:
    """
    Fetch policy details from the core system API.
    Falls back to mock data if the API is unavailable.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.policy_api_url}/{policy_number}"
            )
            resp.raise_for_status()
            return resp.json()
    except (httpx.HTTPError, httpx.ConnectError):
        # Mock fallback for development
        return _mock_policy(policy_number)


def _mock_policy(policy_number: str) -> dict:
    """Return a plausible mock policy for development/testing."""
    return {
        "policy_number": policy_number,
        "status": "active",
        "coverage_type": "comprehensive",
        "deductible": 500.0,
        "limit": 50000.0,
        "effective_date": "2024-01-01",
        "expiry_date": "2025-01-01",
        "notes": "[MOCK] Policy data — connect to real API in production",
    }
