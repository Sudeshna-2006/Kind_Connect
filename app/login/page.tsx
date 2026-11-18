
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed.");
      }

      setMessage("Login successful! Redirecting...");

      if (result.user.role === "Volunteer") {
        router.push("/volunteer/dashboard");
      } else if (result.user.role === "NGO") {
        router.push("/ngo/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-500";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07110e] px-5 py-12 text-slate-100">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm font-semibold text-emerald-400">
          ← Back to KindConnect
        </Link>

        <div className="mt-8 rounded-2xl border border-emerald-900/50 bg-[#0b1712] p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Welcome Back!</h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to continue with KindConnect.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-[#07110e] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {message && (
              <p
                className={`text-center text-sm ${
                  error ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-400 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
