"""
Vision tool — analyzes vehicle damage photos using GPT-4V.
"""

import base64
from typing import Optional
from openai import OpenAI
from config.settings import settings


def analyze_damage_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Send an image to GPT-4V for damage analysis.
    Returns severity, estimated cost, and observations.
    """
    client = OpenAI(api_key=settings.openai_api_key)
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{b64}"

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Analyze this vehicle damage photo. Provide:\n"
                            "1. Damage severity: minor | moderate | severe | total_loss\n"
                            "2. Estimated repair cost in USD\n"
                            "3. Key observations (2-3 sentences)\n\n"
                            "Respond in JSON: {severity, estimated_cost, observations}"
                        ),
                    },
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
        max_tokens=300,
    )

    import json
    try:
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return {
            "severity": "unknown",
            "estimated_cost": 0,
            "observations": response.choices[0].message.content,
        }
