"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { signOut } from "next-auth/react";

// Mock KPI data — in production, derive from useCoAgent streaming state
const SETTLEMENT_DATA = [
  { month: "Sep", stp: 68, manual: 32 },
  { month: "Oct", stp: 72, manual: 28 },
  { month: "Nov", stp: 75, manual: 25 },
  { month: "Dec", stp: 78, manual: 22 },
  { month: "Jan", stp: 81, manual: 19 },
  { month: "Feb", stp: 84, manual: 16 },
];

const COST_DATA = [
  { month: "Sep", avg: 5200 },
  { month: "Oct", avg: 4900 },
  { month: "Nov", avg: 5100 },
  { month: "Dec", avg: 4700 },
  { month: "Jan", avg: 4500 },
  { month: "Feb", avg: 4300 },
];

const SEVERITY_DATA = [
  { name: "Minor", value: 42, color: "#22c55e" },
  { name: "Moderate", value: 35, color: "#f59e0b" },
  { name: "Severe", value: 18, color: "#f97316" },
  { name: "Total Loss", value: 5, color: "#ef4444" },
];

const FRAUD_DATA = [
  { month: "Sep", score: 0.18 },
  { month: "Oct", score: 0.15 },
  { month: "Nov", score: 0.22 },
  { month: "Dec", score: 0.14 },
  { month: "Jan", score: 0.12 },
  { month: "Feb", score: 0.10 },
];

function KPICard({
  title,
  value,
  subtitle,
  color = "text-slate-900",
}: {
  title: string;
  value: string;
  subtitle: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-900 text-lg">Executive Dashboard</h1>
          <p className="text-sm text-slate-500">FNOL AI — Claims KPIs</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Sign out
        </button>
      </header>

      <main className="p-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="STP Rate"
            value="84%"
            subtitle="+16pp YoY"
            color="text-green-700"
          />
          <KPICard
            title="Avg Settlement Cost"
            value="$4,300"
            subtitle="-17% vs prior year"
            color="text-blue-700"
          />
          <KPICard
            title="Avg Cycle Time"
            value="1.2 days"
            subtitle="down from 8.4 days"
            color="text-purple-700"
          />
          <KPICard
            title="Fraud Flagged"
            value="10%"
            subtitle="of claims this month"
            color="text-red-700"
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STP vs Manual */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Settlement Rate — STP vs Manual (%)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={SETTLEMENT_DATA} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stp" name="STP" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="manual" name="Manual" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Avg cost trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Average Settlement Cost ($)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={COST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, "Avg Cost"]} />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Damage severity breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Damage Severity Breakdown</h2>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={SEVERITY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {SEVERITY_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {SEVERITY_DATA.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-slate-600">{entry.name}</span>
                    <span className="text-sm font-medium text-slate-800 ml-auto">
                      {entry.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Avg fraud score trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Avg Fraud Score Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={FRAUD_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${(v * 100).toFixed(0)}%`, "Fraud Score"]} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
