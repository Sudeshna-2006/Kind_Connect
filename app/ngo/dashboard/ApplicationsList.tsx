"use client";

import { useEffect, useState } from "react";

type Application = {
  application_id: number;
  status: string;
  application_date: string;
  message: string | null;
  volunteer_name: string;
  volunteer_email: string;
  opportunity_title: string;
};

export default function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadApplications() {
    try {
      const response = await fetch("/api/ngo/applications");
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications);
      } else {
        setMessage(data.message || "Could not load applications.");
      }
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    applicationId: number,
    status: "Accepted" | "Rejected"
  ) {
    setMessage("");

    try {
      const response = await fetch("/api/ngo/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Could not update application.");
        return;
      }

      setMessage(data.message);
      await loadApplications();
    } catch {
      setMessage("Unable to update application.");
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  if (loading) {
    return <p className="mt-6 text-gray-500">Loading applications...</p>;
  }

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">
        Volunteer Applications
      </h2>

      {message && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          {message}
        </p>
      )}

      {applications.length === 0 ? (
        <p className="rounded-xl bg-gray-50 p-6 text-gray-600">
          No applications received yet.
        </p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.application_id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {application.volunteer_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {application.volunteer_email}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                  {application.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-700">
                <strong>Opportunity:</strong> {application.opportunity_title}
              </p>

              <p className="mt-2 text-sm text-gray-700">
                <strong>Message:</strong>{" "}
                {application.message || "No message provided"}
              </p>

              {application.status === "Pending" && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      updateStatus(application.application_id, "Accepted")
                    }
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(application.application_id, "Rejected")
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}