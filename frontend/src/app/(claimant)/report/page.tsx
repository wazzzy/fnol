"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCoAgent } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { signOut } from "next-auth/react";
import type { FNOLState, PipelineStage } from "@/lib/types/agent-state";
import { STAGE_LABELS } from "@/lib/types/agent-state";
import DocumentUpload, { type UploadedFile } from "@/components/DocumentUpload";

const STAGE_ORDER: PipelineStage[] = [
  "intake", "document", "policy", "damage", "fraud", "triage", "stp", "comms", "complete"
];

function PipelineProgress({ stage }: { stage: PipelineStage }) {
  const currentIdx = STAGE_ORDER.indexOf(stage === "human_review" ? "triage" : stage);
  return (
    <div className="space-y-2">
      {STAGE_ORDER.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                done ? "bg-green-500" : active ? "bg-blue-500 animate-pulse" : "bg-slate-200"
              }`}
            />
            <span
              className={`text-xs ${
                done ? "text-green-700" : active ? "text-blue-700 font-medium" : "text-slate-400"
              }`}
            >
              {STAGE_LABELS[s]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatePanel({ state }: { state: Partial<FNOLState> }) {
  if (!state.claim_id) return null;

  return (
    <div className="space-y-3 text-xs">
      {state.claim_id && (
        <div>
          <span className="text-slate-500">Claim ID</span>
          <div className="font-mono font-medium text-slate-800">{state.claim_id}</div>
        </div>
      )}
      {state.claimant_name && (
        <div>
          <span className="text-slate-500">Claimant</span>
          <div className="text-slate-800">{state.claimant_name}</div>
        </div>
      )}
      {state.vehicle_make && (
        <div>
          <span className="text-slate-500">Vehicle</span>
          <div className="text-slate-800">
            {state.vehicle_year} {state.vehicle_make} {state.vehicle_model}
          </div>
        </div>
      )}
      {state.damage_severity && state.damage_severity !== "unknown" && (
        <div>
          <span className="text-slate-500">Damage</span>
          <div className="capitalize text-slate-800">{state.damage_severity.replace("_", " ")}</div>
        </div>
      )}
      {state.estimated_cost !== undefined && state.estimated_cost > 0 && (
        <div>
          <span className="text-slate-500">Est. Cost</span>
          <div className="text-slate-800">${state.estimated_cost.toLocaleString()}</div>
        </div>
      )}
      {state.fraud_score !== undefined && state.fraud_score > 0 && (
        <div>
          <span className="text-slate-500">Fraud Score</span>
          <div className={state.fraud_score >= 0.7 ? "text-red-600 font-medium" : "text-slate-800"}>
            {(state.fraud_score * 100).toFixed(0)}%
          </div>
        </div>
      )}
      {state.payment_status && (
        <div>
          <span className="text-slate-500">Payment</span>
          <div className="capitalize text-slate-800">{state.payment_status}</div>
        </div>
      )}
      {state.payment_amount !== undefined && state.payment_amount > 0 && (
        <div>
          <span className="text-slate-500">Payment Amount</span>
          <div className="text-green-700 font-medium">${state.payment_amount.toLocaleString()}</div>
        </div>
      )}
      {state.damage_image_urls && state.damage_image_urls.length > 0 && (
        <div>
          <span className="text-slate-500">Documents</span>
          <div className="text-slate-800">{state.damage_image_urls.length} uploaded</div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const { state, setState } = useCoAgent<FNOLState>({
    name: "fnolAgent",
    initialState: {
      pipeline_stage: "intake",
      claim_id: "",
      messages: [],
      damage_image_urls: [],
    } as Partial<FNOLState>,
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    // Wait for CopilotChat to render, then inject a portal mount point above the input
    const timer = setTimeout(() => {
      const container = chatContainerRef.current;
      if (!container) return;
      const inputContainer = container.querySelector(".copilotKitInputContainer");
      if (!inputContainer) return;
      // Create a mount point and insert it as the first child (before the input)
      const mount = document.createElement("div");
      mount.className = "copilot-upload-mount";
      inputContainer.insertBefore(mount, inputContainer.firstChild);
      setPortalTarget(mount);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleUpload = useCallback(
    (file: UploadedFile) => {
      setUploadedFiles((prev) => [...prev, file]);
      setState((prev) => {
        const current = prev ?? {} as FNOLState;
        return {
          ...current,
          damage_image_urls: [...(current.damage_image_urls ?? []), file.url],
        } as FNOLState;
      });
    },
    [setState],
  );

  const handleRemove = useCallback(
    (url: string) => {
      setUploadedFiles((prev) => prev.filter((f) => f.url !== url));
      setState((prev) => {
        const current = prev ?? {} as FNOLState;
        return {
          ...current,
          damage_image_urls: (current.damage_image_urls ?? []).filter((u) => u !== url),
        } as FNOLState;
      });
    },
    [setState],
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left sidebar — pipeline status */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h1 className="font-bold text-slate-900">FNOL AI</h1>
          <p className="text-xs text-slate-500">Report a Claim</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Pipeline
            </h3>
            <PipelineProgress stage={(state as FNOLState)?.pipeline_stage ?? "intake"} />
          </div>

          {state && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Claim Details
              </h3>
              <StatePanel state={state as FNOLState} />
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Documents
              </h3>
              <p className="text-xs text-slate-600">{uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} uploaded</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-xs text-slate-500 hover:text-slate-700 text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-h-0">
        <div ref={chatContainerRef} className="flex-1 min-h-0">
          <CopilotChat
            className="h-full copilot-chat-fixed"
            instructions="You are an FNOL intake agent. Help the user report their automotive insurance claim."
            labels={{
              title: "FNOL Claims Assistant",
              initial: "Hello! I'm here to help you report your vehicle insurance claim. Can you tell me what happened?",
            }}
          />
        </div>
        {portalTarget &&
          createPortal(
            <div className="copilot-upload-zone">
              <DocumentUpload
                files={uploadedFiles}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />
            </div>,
            portalTarget,
          )}
      </main>
    </div>
  );
}
