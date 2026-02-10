"use client";

import { useState } from "react";
import { deleteMember, updateMember } from "@/app/actions/groups";

type Member = {
  id: string;
  name: string;
};

type MembersListProps = {
  groupId: string;
  members: Member[];
};

export default function MembersList({ groupId, members }: MembersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <ul className="mt-4 space-y-2 text-sm text-zinc-800">
      {members.length > 0 ? (
        members.map((member) => (
          <li
            key={member.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2"
          >
            {editingId === member.id ? (
              <form
                className="flex flex-1 items-center gap-2"
                action={async (formData) => {
                  await updateMember(formData);
                  setEditingId(null);
                }}
              >
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="memberId" value={member.id} />
                <input
                  className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-800"
                  name="name"
                  defaultValue={member.name}
                  required
                />
                <button
                  className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  type="submit"
                >
                  Save
                </button>
                <button
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                  type="button"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-800">
                  {member.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    type="button"
                    onClick={() => setEditingId(member.id)}
                  >
                    Edit
                  </button>
                  <form action={deleteMember}>
                    <input type="hidden" name="groupId" value={groupId} />
                    <input type="hidden" name="memberId" value={member.id} />
                    <button
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )}
          </li>
        ))
      ) : (
        <li className="text-zinc-500">No members yet.</li>
      )}
    </ul>
  );
}
