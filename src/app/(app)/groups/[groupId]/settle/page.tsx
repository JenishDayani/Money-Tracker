import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  computeBalances,
  computeSettlements,
  Expense,
  Member,
  Participant,
} from "@/lib/settle";

type SettlePageProps = {
  params: { groupId: string };
};

type ExpenseRow = {
  id: string;
  amount: number;
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

export default async function SettlePage({ params }: SettlePageProps) {
  const resolvedParams = await Promise.resolve(params as SettlePageProps["params"]);
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
    .select("id,amount,payer_member_id")
    .eq("group_id", groupId);

  const expenseIds = expenses?.map((expense) => expense.id) ?? [];
  let participants: ParticipantRow[] = [];

  if (expenseIds.length > 0) {
    const { data: participantRows } = await supabase
      .from("expense_participants")
      .select("expense_id,member_id,share_amount")
      .in("expense_id", expenseIds);

    participants = participantRows ?? [];
  }

  const memberList: Member[] = (members ?? []) as MemberRow[];
  const expenseList: Expense[] = (expenses ?? []) as ExpenseRow[];
  const participantList: Participant[] = participants as ParticipantRow[];

  const balances = computeBalances(memberList, expenseList, participantList);
  const settlements = computeSettlements(balances);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3">
        <Link className="text-sm font-semibold text-emerald-600" href={`/groups/${groupId}`}>
          ← Back to group
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-zinc-900">
            Settle up for {group.name}
          </h1>
          <p className="text-sm text-zinc-600">
            Balances show how much each person should receive or pay.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Balances</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-700">
            {balances.length > 0 ? (
              balances.map((balance) => (
                <li
                  key={balance.memberId}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2"
                >
                  <span>{balance.name}</span>
                  <span
                    className={
                      balance.balance >= 0
                        ? "font-semibold text-emerald-600"
                        : "font-semibold text-rose-600"
                    }
                  >
                    ₹{balance.balance.toFixed(2)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-zinc-500">No balances yet.</li>
            )}
          </ul>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Who pays whom</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-700">
            {settlements.length > 0 ? (
              settlements.map((settlement, index) => (
                <div
                  key={`${settlement.fromId}-${settlement.toId}-${index}`}
                  className="rounded-xl border border-zinc-100 px-4 py-3"
                >
                  <span className="font-semibold text-zinc-900">
                    {settlement.fromName}
                  </span>{" "}
                  pays{" "}
                  <span className="font-semibold text-zinc-900">
                    {settlement.toName}
                  </span>{" "}
                  <span className="font-semibold text-emerald-600">
                    ₹{settlement.amount.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">Everyone is settled.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
