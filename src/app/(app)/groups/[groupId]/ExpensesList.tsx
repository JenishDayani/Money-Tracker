"use client";

import { useMemo, useState } from "react";
import { deleteExpense, updateExpense } from "@/app/actions/groups";

type Member = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  payer_member_id: string;
};

type Participant = {
  expense_id: string;
  member_id: string;
};

type ExpensesListProps = {
  groupId: string;
  members: Member[];
  expenses: Expense[];
  participants: Participant[];
};

export default function ExpensesList({
  groupId,
  members,
  expenses,
  participants,
}: ExpensesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const memberMap = useMemo(
    () => new Map(members.map((member) => [member.id, member.name])),
    [members]
  );

  const participantMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    participants.forEach((participant) => {
      const set = map.get(participant.expense_id) ?? new Set<string>();
      set.add(participant.member_id);
      map.set(participant.expense_id, set);
    });
    return map;
  }, [participants]);

  return (
    <div className="mt-4 space-y-4">
      {expenses.length > 0 ? (
        expenses.map((expense) => {
          const expenseParticipants = participants.filter(
            (participant) => participant.expense_id === expense.id
          );
          const participantIds = participantMap.get(expense.id) ?? new Set();
          const isEditing = editingId === expense.id;

          return (
            <div
              key={expense.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50/70 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {expense.description}
                  </p>
                  <p className="text-xs text-zinc-600">
                    Paid by {memberMap.get(expense.payer_member_id) ?? "-"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">
                    ₹{expense.amount.toFixed(2)}
                  </span>
                  <button
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : expense.id)}
                  >
                    {isEditing ? "Close" : "Edit"}
                  </button>
                  <form action={deleteExpense}>
                    <input type="hidden" name="groupId" value={groupId} />
                    <input type="hidden" name="expenseId" value={expense.id} />
                    <button
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-600">
                Split among: {expenseParticipants
                  .map((participant) => memberMap.get(participant.member_id))
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>

              {isEditing ? (
                <div className="mt-3 rounded-xl border border-zinc-100 bg-white/70 px-3 py-2">
                  <form
                    className="space-y-3"
                    action={async (formData) => {
                      await updateExpense(formData);
                      setEditingId(null);
                    }}
                  >
                    <input type="hidden" name="groupId" value={groupId} />
                    <input type="hidden" name="expenseId" value={expense.id} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-xs font-medium text-zinc-700">
                        Description
                        <input
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm"
                          name="description"
                          defaultValue={expense.description}
                          required
                        />
                      </label>
                      <label className="text-xs font-medium text-zinc-700">
                        Amount
                        <input
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm"
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={expense.amount}
                          required
                        />
                      </label>
                      <label className="text-xs font-medium text-zinc-700">
                        Paid by
                        <select
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm"
                          name="payerMemberId"
                          defaultValue={expense.payer_member_id}
                          required
                        >
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-700">Participants</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {members.map((member) => (
                          <label
                            key={member.id}
                            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700"
                          >
                            <input
                              className="h-3.5 w-3.5 accent-emerald-600"
                              type="checkbox"
                              name="participants"
                              value={member.id}
                              defaultChecked={participantIds.has(member.id)}
                            />
                            {member.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      type="submit"
                    >
                      Update expense
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          );
        })
      ) : (
        <p className="text-sm text-zinc-500">No expenses yet.</p>
      )}
    </div>
  );
}
