import Link from "next/link";
import { addExpense, addMember } from "@/app/actions/groups";
import { createClient } from "@/lib/supabase/server";
import MembersList from "@/app/(app)/groups/[groupId]/MembersList";
import ExpensesList from "@/app/(app)/groups/[groupId]/ExpensesList";

type GroupPageProps = {
  params: { groupId: string };
  searchParams?: { error?: string };
};

type ExpenseRow = {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  payer_member_id: string;
};

type ParticipantRow = {
  expense_id: string;
  member_id: string;
  share_amount: number;
};

type MemberRow = {
  id: string;
  name: string;
};

export default async function GroupPage({ params, searchParams }: GroupPageProps) {
  const resolvedParams = await Promise.resolve(params as GroupPageProps["params"]);
  const groupId = resolvedParams?.groupId;

  if (!groupId) {
    return (
      <section className="space-y-6">
        <Link className="text-sm font-semibold text-emerald-600" href="/dashboard">
          ← Back to dashboard
        </Link>
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">Missing group id</h1>
          <p className="mt-2 text-sm text-zinc-600">
            The group link is incomplete. Open a group from the dashboard.
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return null;
  }

  const { data: group } = await supabase
    .from("groups")
    .select("id,name,owner_id")
    .eq("id", groupId)
    .single();

  if (!group || group.owner_id !== user.id) {
    return (
      <section className="space-y-6">
        <Link className="text-sm font-semibold text-emerald-600" href="/dashboard">
          ← Back to dashboard
        </Link>
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">Group not found</h1>
          <p className="mt-2 text-sm text-zinc-600">
            This group doesn’t exist or isn’t linked to your account.
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    );
  }

  const { data: members } = await supabase
    .from("group_members")
    .select("id,name")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id,description,amount,created_at,payer_member_id")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  const expenseIds = expenses?.map((expense) => expense.id) ?? [];
  let participants: ParticipantRow[] = [];

  if (expenseIds.length > 0) {
    const { data: participantRows } = await supabase
      .from("expense_participants")
      .select("expense_id,member_id,share_amount")
      .in("expense_id", expenseIds);

    participants = participantRows ?? [];
  }

  const membersList: MemberRow[] = members ?? [];
  const expenseList: ExpenseRow[] = expenses ?? [];
  const memberMap = new Map(membersList.map((member) => [member.id, member.name]));

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3">
        <Link className="text-sm font-semibold text-emerald-600" href="/dashboard">
          ← Back to dashboard
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-zinc-900">{group.name}</h1>
          <p className="text-sm text-zinc-600">
            Add friends, track expenses, and settle later.
          </p>
        </div>
      </header>

      {searchParams?.error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {searchParams.error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <form
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            action={addMember}
          >
            <input type="hidden" name="groupId" value={groupId} />
            <h2 className="text-lg font-semibold text-zinc-900">Add member</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Add anyone who might share a cost.
            </p>
            <label className="mt-4 block text-sm font-medium text-zinc-700">
              Member name
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
              Add member
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-zinc-900">Members</h2>
            <MembersList groupId={groupId} members={membersList} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form
            className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur"
            action={addExpense}
          >
            <input type="hidden" name="groupId" value={groupId} />
            <h2 className="text-lg font-semibold text-zinc-900">Add expense</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Only check the friends who joined this expense.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700">
                Description
                <input
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
                  name="description"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Amount
                <input
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </label>
              {membersList.length === 1 ? (
                <input type="hidden" name="payerMemberId" value={membersList[0]?.id} />
              ) : (
                <label className="block text-sm font-medium text-zinc-700">
                  Paid by
                  <select
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm"
                    name="payerMemberId"
                    required
                  >
                    <option value="">Select member</option>
                    {membersList.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {membersList.length === 1 ? (
              <input type="hidden" name="participants" value={membersList[0]?.id} />
            ) : (
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-zinc-700">
                  Participants
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {membersList.length > 0 ? (
                    membersList.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-800 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                      >
                        <input
                          className="h-4 w-4 accent-emerald-600"
                          type="checkbox"
                          name="participants"
                          value={member.id}
                        />
                        {member.name}
                      </label>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">
                      Add members before creating an expense.
                    </span>
                  )}
                </div>
              </fieldset>
            )}

            <button
              className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              type="submit"
              disabled={membersList.length === 0}
            >
              Add expense
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Expenses</h2>
              <Link
                className="text-sm font-semibold text-emerald-600"
                href={`/groups/${groupId}/settle`}
              >
                View settle up →
              </Link>
            </div>
            <ExpensesList
              groupId={groupId}
              members={membersList}
              expenses={expenseList}
              participants={participants}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
