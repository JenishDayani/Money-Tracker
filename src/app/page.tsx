import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20">
        <header className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Split Spend
            </span>
            <Link
              className="rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
              href="/login"
            >
              Sign in
            </Link>
          </div>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Track shared expenses and settle trips without spreadsheets.
            </h1>
            <p className="text-lg text-zinc-600">
              Keep your data in the cloud, add only the friends involved in each expense, and instantly see who owes whom.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              className="flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              href="/login"
            >
              Get started
            </Link>
            <Link
              className="flex items-center justify-center rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
              href="/login"
            >
              Create a trip group
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Secure authentication",
              description:
                "Sign in to keep your data off-device and available anywhere you go.",
            },
            {
              title: "Flexible participants",
              description:
                "Select only the friends who joined a ride, meal, or ticket purchase.",
            },
            {
              title: "Instant settle up",
              description:
                "See a clear list of who pays whom at the end of the trip.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
