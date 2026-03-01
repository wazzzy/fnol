"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const TEST_USERS = [
  { label: "Claimant", email: "claimant@fnol.dev", password: "claimant123" },
  { label: "Adjuster", email: "adjuster@fnol.dev", password: "adjuster123" },
  { label: "Manager", email: "manager@fnol.dev", password: "manager123" },
  { label: "CXO", email: "cxo@fnol.dev", password: "cxo123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function quickLogin(user: (typeof TEST_USERS)[0]) {
    setEmail(user.email);
    setPassword(user.password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">FNOL AI</h1>
          <p className="text-slate-500 mt-2">Automotive Insurance Claims Portal</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign in</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@fnol.dev"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Quick-login buttons for prototype */}
          <div className="mt-6">
            <p className="text-xs text-slate-500 text-center mb-3">Quick login (prototype)</p>
            <div className="grid grid-cols-2 gap-2">
              {TEST_USERS.map((user) => (
                <button
                  key={user.label}
                  onClick={() => quickLogin(user)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 text-left"
                >
                  <span className="font-medium">{user.label}</span>
                  <br />
                  <span className="text-slate-400">{user.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
