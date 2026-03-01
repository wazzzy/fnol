"""
FNOL FastAPI application.
Exposes the LangGraph FNOL agent via the CopilotKit AG-UI protocol at /copilotkit.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAGUIAgent

from config.settings import settings
from graph.orchestrator import fnol_graph
from graph.state import initial_state

app = FastAPI(title="FNOL AI Agents API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── CopilotKit AG-UI endpoint ─────────────────────────────────────────────────
sdk = CopilotKitRemoteEndpoint(
    agents=[
        LangGraphAGUIAgent(
            name="fnolAgent",
            description="Full FNOL automotive insurance claim processing agent",
            graph=fnol_graph,
        )
    ]
)

add_fastapi_endpoint(app, sdk, "/copilotkit")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "fnol-backend"}


# ── Graph visualization ───────────────────────────────────────────────────────
@app.get("/graph/mermaid")
async def graph_mermaid():
    """Return Mermaid diagram of the FNOL graph for debugging."""
    return {"mermaid": fnol_graph.get_graph().draw_mermaid()}


# ── Adjuster decision endpoint ────────────────────────────────────────────────
@app.post("/claims/{claim_id}/decision")
async def adjuster_decision(
    claim_id: str,
    decision: str,  # "approve" | "escalate" | "reject"
    adjuster_id: str,
    notes: str = "",
):
    """
    Adjuster posts a decision to resume the interrupted graph.
    This resumes execution from the human_review_node interrupt.
    """
    from langgraph.types import Command

    thread_config = {"configurable": {"thread_id": claim_id}}

    # Resume the graph with the adjuster's decision injected into state
    result = await fnol_graph.ainvoke(
        Command(
            resume={
                "adjuster_decision": decision,
                "adjuster_id": adjuster_id,
                "adjuster_notes": notes,
            }
        ),
        config=thread_config,
    )

    return {
        "claim_id": claim_id,
        "decision": decision,
        "pipeline_stage": result.get("pipeline_stage"),
        "payment_status": result.get("payment_status"),
    }


# ── Claim state endpoint ──────────────────────────────────────────────────────
@app.get("/claims/{claim_id}/state")
async def get_claim_state(claim_id: str):
    """Return current state of a claim (for adjuster/manager/CXO reads)."""
    thread_config = {"configurable": {"thread_id": claim_id}}
    state = fnol_graph.get_state(thread_config)
    if state and state.values:
        return state.values
    return {"error": "Claim not found", "claim_id": claim_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
