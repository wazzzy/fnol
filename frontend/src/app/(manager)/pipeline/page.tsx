"use client";

import { signOut } from "next-auth/react";
import type { PipelineStage } from "@/lib/types/agent-state";
import { STAGE_LABELS } from "@/lib/types/agent-state";

// Mock data for prototype — in production, stream from useCoAgent
const MOCK_CLAIMS = [
  { id: "FNOL-A1B2C3", claimant: "Sarah Johnson", stage: "human_review" as PipelineStage, cost: 6500, severity: "moderate" },
  { id: "FNOL-D4E5F6", claimant: "Marcus Williams", stage: "fraud" as PipelineStage, cost: 18200, severity: "severe" },
  { id: "FNOL-G7H8I9", claimant: "Jennifer Lee", stage: "complete" as PipelineStage, cost: 1200, severity: "minor" },
  { id: "FNOL-J0K1L2", claimant: "Robert Chen", stage: "damage" as PipelineStage, cost: 4300, severity: "moderate" },
  { id: "FNOL-M3N4O5", claimant: "Patricia Davis", stage: "policy" as PipelineStage, cost: 9800, severity: "severe" },
  { id: "FNOL-P6Q7R8", claimant: "James Wilson", stage: "intake" as PipelineStage, cost: 0, severity: "unknown" },
  { id: "FNOL-S9T0U1", claimant: "Lisa Anderson", stage: "stp" as PipelineStage, cost: 1800, severity: "minor" },
  { id: "FNOL-V2W3X4", claimant: "Michael Brown", stage: "comms" as PipelineStage, cost: 3200, severity: "moderate" },
];

const KANBAN_COLUMNS: PipelineStage[] = [
  "intake", "document", "policy", "damage", "fraud", "triage", "human_review", "stp", "comms", "complete"
];

const COLUMN_COLORS: Partial<Record<PipelineStage, string>> = {
  intake: "border-blue-200 bg-blue-50",
  document: "border-purple-200 bg-purple-50",
  policy: "border-indigo-200 bg-indigo-50",
  damage: "border-orange-200 bg-orange-50",
  fraud: "border-red-200 bg-red-50",
  triage: "border-yellow-200 bg-yellow-50",
  human_review: "border-amber-200 bg-amber-50",
  stp: "border-emerald-200 bg-emerald-50",
  comms: "border-teal-200 bg-teal-50",
  complete: "border-green-200 bg-green-50",
};

const SEVERITY_DOT: Record<string, string> = {
  minor: "bg-green-400",
  moderate: "bg-yellow-400",
  severe: "bg-orange-500",
  total_loss: "bg-red-600",
  unknown: "bg-slate-300",
};

export default function PipelinePage() {
  const claimsByStage = KANBAN_COLUMNS.reduce<Record<PipelineStage, typeof MOCK_CLAIMS>>(
    (acc, stage) => {
      acc[stage] = MOCK_CLAIMS.filter((c) => c.stage === stage);
      return acc;
    },
    {} as Record<PipelineStage, typeof MOCK_CLAIMS>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-bold text-slate-900 text-lg">Pipeline View</h1>
          <p className="text-sm text-slate-500">
            {MOCK_CLAIMS.length} active claims — Manager
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Sign out
        </button>
      </header>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {KANBAN_COLUMNS.map((stage) => {
            const claims = claimsByStage[stage] ?? [];
            const colorClass = COLUMN_COLORS[stage] ?? "border-slate-200 bg-slate-50";
            return (
              <div key={stage} className="w-52 flex-shrink-0">
                <div className={`rounded-xl border ${colorClass} p-3 min-h-32`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-700">
                      {STAGE_LABELS[stage]}
                    </h3>
                    {claims.length > 0 && (
                      <span className="text-xs bg-white rounded-full px-2 py-0.5 border border-slate-200 font-medium text-slate-600">
                        {claims.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {claims.map((claim) => (
                      <div
                        key={claim.id}
                        className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${SEVERITY_DOT[claim.severity]}`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">
                              {claim.claimant}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">{claim.id}</p>
                            {claim.cost > 0 && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                ${claim.cost.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {claims.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">Empty</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
