
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [role, setRole] = useState("Volunteer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    ngoName: "",
    ngoType: "",
    registrationNumber: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      setMessage(result.message);

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        ngoName: "",
        ngoType: "",
        registrationNumber: "",
      });
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
    <main className="min-h-screen bg-[#07110e] px-5 py-12 text-slate-100">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm font-semibold text-emerald-400">
          ← Back to KindConnect
        </Link>

        <div className="mt-10 rounded-2xl border border-emerald-900/50 bg-[#0b1712] p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Join KindConnect</h1>
            <p className="mt-2 text-sm text-slate-400">
              Create an account and start making a difference.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                I want to register as
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setMessage("");
                }}
                className={inputClass}
              >
                <option value="Volunteer">Volunteer</option>
                <option value="NGO">NGO</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                {role === "NGO" ? "Contact Person Name" : "Full Name"}
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                placeholder="Enter your name"
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email Address
              </label>
              <input
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Phone Number
              </label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                placeholder="Enter your phone number"
                autoComplete="tel"
                className={inputClass}
              />
            </div>

            {role === "NGO" && (
              <>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    NGO Name
                  </label>
                  <input
                    required
                    name="ngoName"
                    value={formData.ngoName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter NGO name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    NGO Type
                  </label>
                  <input
                    required
                    name="ngoType"
                    value={formData.ngoType}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Education, Healthcare, Environment"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    NGO Registration Number
                  </label>
                  <input
                    required
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter registration number"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>
              <input
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                minLength={8}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-[#07110e] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
