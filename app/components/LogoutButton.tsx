
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Logout failed.");
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
      >
        {loading ? "Logging out..." : "Logout"}
      </button>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
