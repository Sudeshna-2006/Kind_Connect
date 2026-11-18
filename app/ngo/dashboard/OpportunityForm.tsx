
"use client";

import { useState } from "react";

export default function OpportunityForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    opportunityType: "",
    location: "",
    startDate: "",
    endDate: "",
    volunteersRequired: "5",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-500";

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          volunteersRequired: Number(formData.volunteersRequired),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not create opportunity.");
      }

      setSuccess(true);
      setMessage(
        `Opportunity created successfully! Opportunity ID: ${result.opportunityId}`
      );

      setFormData({
        title: "",
        description: "",
        opportunityType: "",
        location: "",
        startDate: "",
        endDate: "",
        volunteersRequired: "5",
      });
    } catch (error) {
      setSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-emerald-900/40 bg-[#0b1712] p-6">
      <h2 className="text-2xl font-bold">Create an Opportunity</h2>

      <p className="mt-2 text-sm text-slate-400">
        Publish a volunteering opportunity and connect with volunteers.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Opportunity Title *
          </label>
          <input
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={150}
            placeholder="e.g. Teaching Underprivileged Children"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the volunteering activity..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Opportunity Type
          </label>
          <select
            name="opportunityType"
            value={formData.opportunityType}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select a category</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Environment">Environment</option>
            <option value="Community Service">Community Service</option>
            <option value="Animal Welfare">Animal Welfare</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Location
          </label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Bengaluru"
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Start Date *
            </label>
            <input
              required
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              min={formData.startDate || undefined}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Number of Volunteers Required *
          </label>
          <input
            required
            type="number"
            name="volunteersRequired"
            min="1"
            step="1"
            value={formData.volunteersRequired}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-[#07110e] transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Publishing..." : "Publish Opportunity"}
        </button>

        {message && (
          <p
            className={`rounded-lg p-3 text-sm ${
              success
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
