"use client";

import { useState } from "react";
import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { useRouter, useParams } from "next/navigation";
import type { FNOLState } from "@/lib/types/agent-state";

function InfoRow({ label, value }: { label: string; value?: string | number | boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right max-w-xs">
        {String(value)}
      </span>
    </div>
  );
}

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { state } = useCoAgent<FNOLState>({
    name: "fnolAgent",
    initialState: { pipeline_stage: "human_review" } as Partial<FNOLState>,
  });

  const s = state as FNOLState;

  async function submitDecision(decision: "approve" | "escalate" | "reject") {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes, adjuster_id: "adjuster-1" }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => router.push("/claims"), 1500);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/claims")}
          className="text-slate-500 hover:text-slate-700 text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="font-bold text-slate-900">Claim {claimId}</h1>
          <p className="text-xs text-slate-500">Adjuster Review</p>
        </div>
      </header>

      {submitted && (
        <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
          Decision submitted. Redirecting to queue...
        </div>
      )}

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Claimant</h2>
            <InfoRow label="Name" value={s?.claimant_name} />
            <InfoRow label="Phone" value={s?.claimant_phone} />
            <InfoRow label="Email" value={s?.claimant_email} />
            <InfoRow label="Incident Date" value={s?.incident_date} />
            <InfoRow label="Location" value={s?.incident_location} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Vehicle & Damage</h2>
            <InfoRow
              label="Vehicle"
              value={`${s?.vehicle_year} ${s?.vehicle_make} ${s?.vehicle_model}`}
            />
            <InfoRow label="VIN" value={s?.vehicle_vin} />
            <InfoRow label="Damage Severity" value={s?.damage_severity} />
            <InfoRow label="Estimated Cost" value={s?.estimated_cost ? `$${s.estimated_cost.toLocaleString()}` : undefined} />
            <InfoRow label="Description" value={s?.damage_description} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Policy</h2>
            <InfoRow label="Policy #" value={s?.policy_number} />
            <InfoRow label="Valid" value={s?.policy_valid ? "Yes" : "No"} />
            <InfoRow label="Coverage" value={s?.policy_coverage_type} />
            <InfoRow label="Deductible" value={s?.policy_deductible ? `$${s.policy_deductible.toLocaleString()}` : undefined} />
            <InfoRow label="Limit" value={s?.policy_limit ? `$${s.policy_limit.toLocaleString()}` : undefined} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Fraud Analysis</h2>
            <InfoRow
              label="Fraud Score"
              value={s?.fraud_score !== undefined ? `${(s.fraud_score * 100).toFixed(0)}%` : undefined}
            />
            <InfoRow label="Flags" value={s?.fraud_flags?.join(", ") || "None"} />
            <InfoRow label="Triage Notes" value={s?.triage_notes} />
          </div>
        </div>

        {/* Decision panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Adjuster Decision</h2>

            <div className="mb-4">
              <label className="block text-sm text-slate-600 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add review notes..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => submitDecision("approve")}
                disabled={submitting || submitted}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Approve & Process Payment
              </button>
              <button
                onClick={() => submitDecision("escalate")}
                disabled={submitting || submitted}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Escalate to Senior Adjuster
              </button>
              <button
                onClick={() => submitDecision("reject")}
                disabled={submitting || submitted}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Reject Claim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
