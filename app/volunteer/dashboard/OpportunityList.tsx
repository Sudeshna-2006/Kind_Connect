
"use client";

import { useEffect, useState } from "react";

interface Opportunity {
  opportunity_id: number;
  title: string;
  description: string | null;
  opportunity_type: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  volunteers_required: number;
  status: string;
  ngo_name: string;
}

interface Application {
  opportunity_id: number;
  status: string;
}

export default function OpportunityList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendations, setRecommendations] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendationError, setRecommendationError] = useState("");
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [applicationStatuses, setApplicationStatuses] =
    useState<Record<number, string>>({});

  async function fetchApplications() {
    try {
      const response = await fetch("/api/applications", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load applications.");
      }

      const statuses: Record<number, string> = {};

      (result.applications || []).forEach((application: Application) => {
        statuses[application.opportunity_id] = application.status;
      });

      setApplicationStatuses(statuses);
    } catch (err) {
      console.error("Could not load applications:", err);
    }
  }

  async function fetchOpportunities() {
    try {
      const response = await fetch("/api/opportunities", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load opportunities.");
      }

      setOpportunities(result.opportunities || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecommendations() {
    try {
      const response = await fetch("/api/recommendations", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not load recommendations."
        );
      }

      setRecommendations(result.recommendations || []);
      setRecommendationError("");
    } catch (err) {
      setRecommendationError(
        err instanceof Error
          ? err.message
          : "Could not load recommendations."
      );
    } finally {
      setRecommendationsLoading(false);
    }
  }

  useEffect(() => {
    fetchOpportunities();
    fetchApplications();
    fetchRecommendations();

    function refreshApplications() {
      fetchApplications();
    }

    window.addEventListener("focus", refreshApplications);

    return () => {
      window.removeEventListener("focus", refreshApplications);
    };
  }, []);

  async function handleApply(opportunityId: number) {
    setApplyingId(opportunityId);

    setMessages((previous) => ({
      ...previous,
      [opportunityId]: "",
    }));

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Application failed.");
      }

      await fetchApplications();

      setMessages((previous) => ({
        ...previous,
        [opportunityId]: "Application submitted successfully!",
      }));
    } catch (err) {
      setMessages((previous) => ({
        ...previous,
        [opportunityId]:
          err instanceof Error ? err.message : "Something went wrong.",
      }));
    } finally {
      setApplyingId(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "Accepted":
        return "bg-green-500/10 text-green-400";
      case "Rejected":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-yellow-500/10 text-yellow-400";
    }
  }

  function renderOpportunityCard(opportunity: Opportunity) {
    const applicationStatus =
      applicationStatuses[opportunity.opportunity_id];

    return (
      <article
        key={opportunity.opportunity_id}
        className="rounded-2xl border border-slate-800 bg-[#0b1712] p-6 transition duration-300 hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-950/20"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            {opportunity.opportunity_type || "General"}
          </span>

          {applicationStatus ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(applicationStatus)}`}
            >
              {applicationStatus}
            </span>
          ) : (
            <span className="text-xs text-emerald-400">
              {opportunity.status}
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-bold text-white">
          {opportunity.title}
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Posted by {opportunity.ngo_name}
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          {opportunity.description || "No description provided."}
        </p>

        <div className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-sm text-slate-400">
          <p>
            <span className="text-emerald-400">Location:</span>{" "}
            {opportunity.location || "Not specified"}
          </p>

          <p>
            <span className="text-emerald-400">Start Date:</span>{" "}
            {formatDate(opportunity.start_date)}
          </p>

          <p>
            <span className="text-emerald-400">End Date:</span>{" "}
            {opportunity.end_date
              ? formatDate(opportunity.end_date)
              : "Not specified"}
          </p>

          <p>
            <span className="text-emerald-400">Volunteers Needed:</span>{" "}
            {opportunity.volunteers_required}
          </p>
        </div>

        {!applicationStatus && (
          <button
            onClick={() => handleApply(opportunity.opportunity_id)}
            disabled={applyingId === opportunity.opportunity_id}
            className="mt-5 w-full rounded-lg bg-emerald-500 py-3 font-semibold text-[#07110e] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applyingId === opportunity.opportunity_id
              ? "Applying..."
              : "Apply Now"}
          </button>
        )}

        {applicationStatus && (
          <p className="mt-5 text-sm text-slate-300">
            You have already applied for this opportunity.
          </p>
        )}

        {messages[opportunity.opportunity_id] && (
          <p className="mt-3 text-sm text-emerald-400">
            {messages[opportunity.opportunity_id]}
          </p>
        )}
      </article>
    );
  }

  const recommendedIds = new Set(
    recommendations.map((item) => item.opportunity_id)
  );

  const otherOpportunities = opportunities.filter(
    (item) => !recommendedIds.has(item.opportunity_id)
  );

  return (
    <section className="mt-10 space-y-12">

      {/* RECOMMENDED OPPORTUNITIES */}
      <div>
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-wider text-emerald-400">
            ✨ PERSONALIZED FOR YOU
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Recommended Opportunities
          </h2>

          <p className="mt-2 text-slate-400">
            Discover volunteering opportunities selected for your interests.
          </p>
        </div>

        {recommendationsLoading && (
          <p className="text-slate-400">
            Loading recommended opportunities...
          </p>
        )}

        {!recommendationsLoading && recommendationError && (
          <p className="rounded-xl border border-red-800/40 bg-red-500/10 p-4 text-sm text-red-400">
            {recommendationError}
          </p>
        )}

        {!recommendationsLoading &&
          !recommendationError &&
          recommendations.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#0b1712] p-7">
              <p className="font-semibold text-slate-200">
                No recommendations available yet.
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Select your interests to discover volunteering opportunities
                that may suit you.
              </p>
            </div>
          )}

        {!recommendationsLoading &&
          !recommendationError &&
          recommendations.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {recommendations.map((opportunity) =>
                renderOpportunityCard(opportunity)
              )}
            </div>
          )}
      </div>

      {/* ALL AVAILABLE OPPORTUNITIES */}
      <div>
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-wider text-emerald-400">
            EXPLORE AND CONTRIBUTE
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Available Opportunities
          </h2>

          <p className="mt-2 text-slate-400">
            Explore all open volunteering opportunities posted by NGOs.
          </p>
        </div>

        {loading && (
          <p className="text-slate-400">
            Loading opportunities...
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 p-4 text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && opportunities.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-[#0b1712] p-8 text-center">
            <p className="text-slate-300">
              No open opportunities available right now.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          opportunities.length > 0 &&
          otherOpportunities.length === 0 && (
            <p className="text-sm text-slate-400">
              All available opportunities are displayed in your recommendations above.
            </p>
          )}

        <div className="grid gap-6 md:grid-cols-2">
          {otherOpportunities.map((opportunity) =>
            renderOpportunityCard(opportunity)
          )}
        </div>
      </div>
    </section>
  );
}
