
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Link from "next/link";
import OpportunityList from "./OpportunityList";
import InterestsForm from "./InterestsForm";
import LogoutButton from "../../components/LogoutButton";

export default async function VolunteerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kindconnect_token")?.value;

  if (!token || !process.env.JWT_SECRET) {
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
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    user = verified.payload as typeof user;

    if (user.role !== "Volunteer") {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#07110e] text-slate-100">
      <nav className="flex items-center justify-between border-b border-emerald-900/40 bg-[#0b1712] px-8 py-5">
        <Link href="/" className="text-2xl font-bold text-emerald-400">
          KindConnect
        </Link>

        <div className="flex items-center gap-4">
          <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            Volunteer
          </span>

          <LogoutButton />
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl border border-emerald-900/40 bg-[#0b1712] p-8">
          <p className="text-sm text-emerald-400">
            VOLUNTEER DASHBOARD
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Welcome to KindConnect!
          </h1>

          <p className="mt-3 text-slate-400">
            Discover opportunities, contribute your skills,
            and make a difference in your community.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-[#0b1712] p-6">
            <h2 className="text-lg font-semibold">My Profile</h2>

            <p className="mt-4 text-sm text-slate-400">
              User ID
            </p>
            <p className="mt-1 font-medium">{user.userId}</p>

            <p className="mt-4 text-sm text-slate-400">
              Email Address
            </p>
            <p className="mt-1 font-medium">{user.email}</p>

            <p className="mt-4 text-sm text-slate-400">
              Account Role
            </p>
            <p className="mt-1 font-medium text-emerald-400">
              Volunteer
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0b1712] p-6">
            <h2 className="text-lg font-semibold">
              Volunteer Activities
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              Your volunteering journey starts here.
              Explore opportunities, apply to NGOs, and
              track your applications.
            </p>

            <div className="mt-6 rounded-lg bg-emerald-500/10 p-4">
              <p className="font-semibold text-emerald-400">
                Get Started
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Explore volunteering opportunities and
                find causes that matter to you.
              </p>
            </div>
          </div>
        </div>

        <InterestsForm />
        <OpportunityList />
      </div>
    </main>
  );
}
