"use client";

import { useState } from "react";

const opportunities = [
  {
    title: "Teach Children",
    category: "Education",
    location: "Bengaluru",
    time: "Weekends",
    icon: "📚",
    color: "bg-amber-950/60",
  },
  {
    title: "Community Healthcare",
    category: "Healthcare",
    location: "Bengaluru",
    time: "Part-time",
    icon: "🩺",
    color: "bg-rose-950/60",
  },
  {
    title: "Green Earth Initiative",
    category: "Environment",
    location: "Bengaluru",
    time: "Flexible",
    icon: "🌱",
    color: "bg-emerald-950/60",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");

  const filtered = opportunities.filter((item) =>
    `${item.title} ${item.category} ${item.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#07110e] text-slate-100">
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-[#20372c] bg-[#0b1712] px-6 py-5 md:px-16">
        <a href="/" className="text-xl font-bold tracking-tight text-white">
          <span className="text-emerald-400">Kind</span>Connect<span className="text-emerald-400">.</span>
        </a>

        <div className="flex gap-5 text-sm font-medium text-slate-200 md:gap-8">
          <a href="#opportunities" className="hover:text-emerald-300">Opportunities</a>
          <a href="#about" className="hover:text-emerald-300">About us</a>
        </div>

        <div className="flex gap-3">
          <a href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-[#1b3025]">
            Log in
          </a>
          <a href="/register" className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-[#06110b] hover:bg-emerald-400">
            Join us
          </a>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-16 md:py-24">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-emerald-800 bg-emerald-950/70 px-4 py-2 text-sm font-semibold text-emerald-300">
            ♡ Every small act makes a difference
          </div>

          <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Find your purpose.
            <span className="block text-emerald-400">Make an impact.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Connect your skills and passion with NGOs that are making a real difference in our communities.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#opportunities" className="rounded-full bg-emerald-500 px-7 py-4 font-semibold text-[#06110b] shadow-sm hover:bg-emerald-400">
              Explore opportunities →
            </a>
            <a href="/register?role=NGO" className="rounded-full border border-[#456353] bg-[#0b1712] px-7 py-4 font-semibold text-slate-100 hover:border-emerald-400">
              I'm an NGO
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            A little of your time can change someone's world.
          </p>
        </div>

        <div className="relative rounded-[2rem] border border-emerald-900/60 bg-[#10271c] p-6 md:p-10">
          <div className="absolute right-7 top-4 text-5xl text-emerald-400">✳</div>

          <div className="rounded-3xl border border-[#294b38] bg-[#0b1712] p-7 shadow-lg md:p-9">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Your next chapter
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">Do good. Feel good.</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Share what you know, learn from others, and be part of something bigger than yourself.
            </p>

            <div className="mt-7 space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-emerald-900 bg-[#10271c] p-4">
                <span className="text-3xl">🤝</span>
                <div>
                  <p className="font-semibold text-white">Meaningful connections</p>
                  <p className="text-sm text-slate-300">People united by purpose</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-amber-900/60 bg-[#211d13] p-4">
                <span className="text-3xl">✨</span>
                <div>
                  <p className="font-semibold text-white">Skills that matter</p>
                  <p className="text-sm text-slate-300">Make your strengths count</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="opportunities" className="border-y border-[#20372c] bg-[#0b1712] px-6 py-16 md:px-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-semibold tracking-widest text-emerald-400">MAKE A DIFFERENCE</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Find where you belong.
              </h2>
              <p className="mt-3 text-slate-300">
                Discover ways to share your time and talent.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search opportunities..."
              aria-label="Search opportunities"
              className="w-full rounded-full border border-[#456353] bg-[#07110e] px-5 py-3 text-slate-100 outline-none placeholder:text-slate-400 focus:border-emerald-400 md:max-w-sm"
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-[#20372c] bg-[#0e1b15] p-6 transition hover:-translate-y-1 hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-950/30"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${item.color}`}>
                  {item.icon}
                </div>

                <p className="mt-6 text-sm font-semibold text-emerald-400">{item.category}</p>
                <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-300">📍 {item.location}</p>
                <p className="mt-2 text-sm text-slate-300">◷ {item.time}</p>

                <a href="/register" className="mt-6 inline-block font-semibold text-emerald-400 hover:text-emerald-300">
                  Get involved →
                </a>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-slate-300">
              No matching opportunities found. Try another search.
            </p>
          )}

          <p className="mt-6 text-sm text-slate-400">
            These are sample opportunities. We will connect them to MySQL later.
          </p>
        </div>
      </section>

      <section id="about" className="px-6 py-20 text-center">
        <p className="font-semibold tracking-widest text-emerald-400">OUR PURPOSE</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold text-white md:text-4xl">
          The right people. The right cause. A better world.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
          KindConnect brings volunteers and NGOs together through skills, interests, location, and availability.
        </p>
      </section>

      <footer className="border-t border-[#20372c] bg-[#07110e] px-6 py-8 text-center text-sm text-slate-400">
        © 2026 KindConnect · Connecting people with purpose.
      </footer>
    </main>
  );
}