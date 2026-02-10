import Link from "next/link";
import { signIn, signUp } from "@/app/actions/auth";

type LoginPageProps = {
  searchParams?: { error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <Link className="text-sm font-semibold text-emerald-600" href="/">
          ← Back to home
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Access your groups and keep expenses synced.
            </p>
            {searchParams?.error ? (
              <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {searchParams.error}
              </p>
            ) : null}
            <form className="mt-6 space-y-4" action={signIn}>
              <label className="block text-sm font-medium text-zinc-700">
                Email
                <input
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
                  name="email"
                  type="email"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Password
                <input
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                />
              </label>
              <button
                className="w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                type="submit"
              >
                Sign in
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-900">Create account</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Start a new trip and invite your friends.
            </p>
            <form className="mt-6 space-y-4" action={signUp}>
              <label className="block text-sm font-medium text-zinc-700">
                Full name
                <input
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
                  name="fullName"
                  type="text"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Email
                <input
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
                  name="email"
                  type="email"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Password
                <input
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                />
              </label>
              <button
                className="w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                type="submit"
              >
                Create account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
