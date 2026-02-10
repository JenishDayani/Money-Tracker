import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createGroup } from "@/app/actions/groups";

type DashboardPageProps = {
  searchParams?: { error?: string };
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return null;
  }

  const { data: groups } = await supabase
    .from("groups")
    .select("id,name,created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-zinc-900">Your trip groups</h1>
        <p className="text-sm text-zinc-600">
          Create a group for each trip and add expenses as you go.
        </p>
      </header>

      {searchParams?.error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {searchParams.error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          action={createGroup}
        >
          <h2 className="text-lg font-semibold text-zinc-900">New group</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Example: Goa 2026 or Weekend getaway.
          </p>
          <label className="mt-6 block text-sm font-medium text-zinc-700">
            Group name
            <input
              className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
              name="name"
              required
            />
          </label>
          <button
            className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            type="submit"
          >
            Create group
          </button>
        </form>

        <div className="lg:col-span-2">
          {groups && groups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-emerald-200"
                >
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {group.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600">
                    View expenses and settle up.
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
              No groups yet. Create one to start tracking.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
