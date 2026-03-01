"use client";

import { useCoAgent } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { FNOLState } from "@/lib/types/agent-state";

// Mock claim list for prototype — in production, fetch from /claims API
const MOCK_CLAIMS = [
  {
    id: "FNOL-A1B2C3",
    claimant: "Sarah Johnson",
    date: "2026-02-28",
    stage: "human_review" as const,
    severity: "moderate" as const,
    cost: 6500,
    fraud_score: 0.12,
  },
  {
    id: "FNOL-D4E5F6",
    claimant: "Marcus Williams",
    date: "2026-02-27",
    stage: "human_review" as const,
    severity: "severe" as const,
    cost: 18200,
    fraud_score: 0.45,
  },
  {
    id: "FNOL-G7H8I9",
    claimant: "Jennifer Lee",
    date: "2026-02-26",
    stage: "complete" as const,
    severity: "minor" as const,
    cost: 1200,
    fraud_score: 0.05,
  },
];

const SEVERITY_COLORS = {
  minor: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  severe: "bg-orange-100 text-orange-800",
  total_loss: "bg-red-100 text-red-800",
  unknown: "bg-slate-100 text-slate-600",
};

export default function ClaimsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-900 text-lg">Claim Queue</h1>
          <p className="text-sm text-slate-500">Adjuster Review Portal</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Sign out
        </button>
      </header>

      {/* Claims table */}
      <main className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Claim ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Claimant</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Severity</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Est. Cost</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Fraud Score</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_CLAIMS.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-800">{claim.id}</td>
                  <td className="px-4 py-3 text-slate-700">{claim.claimant}</td>
                  <td className="px-4 py-3 text-slate-500">{claim.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        claim.stage === "human_review"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {claim.stage === "human_review" ? "Needs Review" : "Complete"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_COLORS[claim.severity]}`}
                    >
                      {claim.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    ${claim.cost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={claim.fraud_score >= 0.5 ? "text-red-600 font-medium" : "text-slate-500"}>
                      {(claim.fraud_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/claims/${claim.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
