
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Link from "next/link";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import OpportunityForm from "./OpportunityForm";
import ApplicationsList from "./ApplicationsList";
import LogoutButton from "../../components/LogoutButton";

interface NGOProfile extends RowDataPacket {
  ngo_id: number;
  ngo_name: string;
  ngo_type: string;
  registration_number: string;
  email: string | null;
  contact_number: string | null;
  city: string | null;
  state: string | null;
}

export default async function NGODashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kindconnect_token")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    redirect("/login");
  }

  let user: {
    userId: number;
    email: string;
    role: string;
  };

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    user = verified.payload as typeof user;
  } catch {
    redirect("/login");
  }

  if (user.role !== "NGO") {
    redirect("/login");
  }

  const [rows] = await pool.execute<NGOProfile[]>(
    `SELECT ngo_id, ngo_name, ngo_type, registration_number,
            email, contact_number, city, state
     FROM NGO
     WHERE user_id = ?`,
    [user.userId]
  );

  const ngo = rows[0];

  if (!ngo) {
    return (
      <main className="min-h-screen bg-[#07110e] p-10 text-white">
        <h1 className="text-2xl font-bold">NGO profile not found</h1>
        <p className="mt-3 text-slate-400">
          Please contact the administrator.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07110e] text-slate-100">
      <nav className="flex items-center justify-between border-b border-emerald-900/40 bg-[#0b1712] px-8 py-5">
        <Link href="/" className="text-2xl font-bold text-emerald-400">
          KindConnect
        </Link>

        <div className="flex items-center gap-4">
          <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            NGO Dashboard
          </span>

          <LogoutButton />
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <section className="rounded-2xl border border-emerald-900/40 bg-[#0b1712] p-8">
          <p className="text-sm text-emerald-400">
            ORGANIZATION DASHBOARD
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Welcome, {ngo.ngo_name}!
          </h1>

          <p className="mt-3 text-slate-400">
            Manage your volunteering opportunities and connect
            with people who want to make a difference.
          </p>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-[#0b1712] p-6">
            <h2 className="text-xl font-semibold">NGO Profile</h2>

            <p className="mt-5 text-sm text-slate-400">NGO Name</p>
            <p className="mt-1 font-medium">{ngo.ngo_name}</p>

            <p className="mt-4 text-sm text-slate-400">NGO ID</p>
            <p className="mt-1">{ngo.ngo_id}</p>

            <p className="mt-4 text-sm text-slate-400">NGO Type</p>
            <p className="mt-1">{ngo.ngo_type}</p>

            <p className="mt-4 text-sm text-slate-400">
              Registration Number
            </p>
            <p className="mt-1">{ngo.registration_number}</p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-[#0b1712] p-6">
            <h2 className="text-xl font-semibold">Contact Details</h2>

            <p className="mt-5 text-sm text-slate-400">Email</p>
            <p className="mt-1">{ngo.email || "Not provided"}</p>

            <p className="mt-4 text-sm text-slate-400">Phone</p>
            <p className="mt-1">
              {ngo.contact_number || "Not provided"}
            </p>

            <p className="mt-4 text-sm text-slate-400">Location</p>
            <p className="mt-1">
              {[ngo.city, ngo.state].filter(Boolean).join(", ") ||
                "Not provided"}
            </p>
          </section>
        </div>

        <OpportunityForm />
        <ApplicationsList />
      </div>
    </main>
  );
}
