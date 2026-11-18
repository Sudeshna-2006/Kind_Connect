
"use client";

import { useEffect, useState } from "react";

const interestOptions = [
  { name: "Environment", icon: "🌱", description: "Protect nature and our planet" },
  { name: "Education", icon: "📚", description: "Help people learn and grow" },
  { name: "Animal Welfare", icon: "🐾", description: "Care for animals in need" },
  { name: "Community Service", icon: "🤝", description: "Make a difference locally" },
  { name: "Healthcare", icon: "❤️", description: "Support healthier communities" },
  { name: "Women Empowerment", icon: "🌸", description: "Promote equality and opportunity" },
  { name: "Child Welfare", icon: "🧸", description: "Support children's wellbeing" },
  { name: "Elderly Care", icon: "👵", description: "Make seniors feel supported" },
  { name: "Disaster Relief", icon: "🆘", description: "Help communities recover" },
  { name: "Poverty Alleviation", icon: "🏠", description: "Support people in need" },
  { name: "Human Rights", icon: "⚖️", description: "Stand up for equal rights" },
  { name: "Rural Development", icon: "🌾", description: "Strengthen rural communities" },
];

export default function InterestsForm() {
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadInterests() {
      try {
        const response = await fetch("/api/volunteer/interests");
        const data = await response.json();

        if (response.ok && data.success) {
          setInterests(data.interests || []);
        }
      } catch (error) {
        console.error("Could not load interests:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInterests();
  }, []);

  function toggleInterest(interest: string) {
    setInterests((previous) =>
      previous.includes(interest)
        ? previous.filter((item) => item !== interest)
        : [...previous, interest]
    );

    setMessage("");
    setSaved(false);
  }

  async function handleSave() {
    if (interests.length === 0) {
      setMessage("Please select at least one interest.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/volunteer/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save interests.");
      }

      setSaved(true);
      setMessage("Your interests have been saved successfully!");
    } catch (error) {
      setSaved(false);
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const progress = Math.round(
    (interests.length / interestOptions.length) * 100
  );

  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-emerald-900/60 bg-gradient-to-br from-[#0d1d16] via-[#0b1712] to-[#09130f] p-6 shadow-xl sm:p-8">

      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-2xl">
              🌿
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Personalize your experience
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              What causes do you care about?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Choose the causes that matter to you. Your interests help
              us understand your passions and discover volunteering
              opportunities that align with them.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-2xl font-bold text-emerald-400">
              {interests.length}
              <span className="text-sm text-emerald-500/70">
                /{interestOptions.length}
              </span>
            </p>
            <p className="text-xs text-slate-400">Selected</p>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-medium text-slate-300">
              Your interests
            </span>
            <span className="text-emerald-400">{progress}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            Loading your interests...
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {interestOptions.map((interest) => {
                const selected = interests.includes(interest.name);

                return (
                  <label
                    key={interest.name}
                    className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200 ${
                      selected
                        ? "border-emerald-500/70 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.06)]"
                        : "border-slate-800 bg-[#0a1510] hover:border-emerald-700/60 hover:bg-emerald-500/[0.04]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleInterest(interest.name)}
                      className="peer sr-only"
                    />

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800/70 text-xl transition group-hover:scale-105">
                      {interest.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm font-semibold ${
                        selected ? "text-emerald-300" : "text-slate-200"
                      }`}>
                        {interest.name}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {interest.description}
                      </p>
                    </div>

                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      selected
                        ? "border-emerald-400 bg-emerald-500 text-[#07110e]"
                        : "border-slate-600 bg-transparent"
                    }`}>
                      {selected && (
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            d="M4 10L8 14L16 6"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-4 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  {interests.length === 0
                    ? "Start choosing your interests"
                    : `${interests.length} cause${interests.length === 1 ? "" : "s"} selected`}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  You can update your choices anytime.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3 font-semibold text-[#07110e] shadow-lg shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07110e]/30 border-t-[#07110e]" />
                    Saving...
                  </>
                ) : saved ? (
                  <>✓ Saved Successfully</>
                ) : (
                  <>Save My Interests →</>
                )}
              </button>
            </div>

            {message && (
              <p className={`mt-4 rounded-lg border p-3 text-sm ${
                saved
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/20 bg-red-500/10 text-red-300"
              }`}>
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
