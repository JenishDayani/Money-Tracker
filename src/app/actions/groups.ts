"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createGroup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect("/dashboard?error=Please%20enter%20a%20group%20name");
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("groups")
    .insert({ name, owner_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/dashboard?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  }

  redirect(`/groups/${data.id}`);
}

export async function addMember(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!groupId || !name) {
    redirect(`/groups/${groupId}?error=Missing%20member%20name`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    name,
  });

  if (error) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/groups/${groupId}`);
}

export async function updateMember(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!groupId || !memberId || !name) {
    redirect(`/groups/${groupId}?error=Missing%20member%20details`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .update({ name })
    .eq("id", memberId);

  if (error) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/groups/${groupId}`);
}

export async function deleteMember(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");

  if (!groupId || !memberId) {
    redirect(`/groups/${groupId}?error=Missing%20member%20details`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/groups/${groupId}`);
}

export async function addExpense(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amountValue = String(formData.get("amount") ?? "").trim();
  const payerMemberId = String(formData.get("payerMemberId") ?? "");
  const participantIds = formData.getAll("participants") as string[];

  const amount = Number(amountValue);

  if (!groupId || !description || !payerMemberId || !amount || amount <= 0) {
    redirect(`/groups/${groupId}?error=Please%20fill%20all%20expense%20fields`);
  }

  if (participantIds.length === 0) {
    redirect(`/groups/${groupId}?error=Select%20at%20least%20one%20participant`);
  }

  const supabase = await createClient();

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      group_id: groupId,
      description,
      amount,
      payer_member_id: payerMemberId,
    })
    .select("id")
    .single();

  if (error || !expense) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  }

  const shareAmount = amount / participantIds.length;

  const { error: participantsError } = await supabase
    .from("expense_participants")
    .insert(
      participantIds.map((participantId) => ({
        expense_id: expense.id,
        member_id: participantId,
        share_amount: shareAmount,
      }))
    );

  if (participantsError) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(participantsError.message)}`);
  }

  revalidatePath(`/groups/${groupId}`);
}

export async function updateExpense(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const expenseId = String(formData.get("expenseId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amountValue = String(formData.get("amount") ?? "").trim();
  const payerMemberId = String(formData.get("payerMemberId") ?? "");
  const participantIds = formData.getAll("participants") as string[];

  const amount = Number(amountValue);

  if (!groupId || !expenseId || !description || !payerMemberId || !amount || amount <= 0) {
    redirect(`/groups/${groupId}?error=Please%20fill%20all%20expense%20fields`);
  }

  if (participantIds.length === 0) {
    redirect(`/groups/${groupId}?error=Select%20at%20least%20one%20participant`);
  }

  const supabase = await createClient();

  const { error: expenseError } = await supabase
    .from("expenses")
    .update({
      description,
      amount,
      payer_member_id: payerMemberId,
    })
    .eq("id", expenseId);

  if (expenseError) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(expenseError.message)}`);
  }

  const { error: deleteParticipantsError } = await supabase
    .from("expense_participants")
    .delete()
    .eq("expense_id", expenseId);

  if (deleteParticipantsError) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(deleteParticipantsError.message)}`);
  }

  const shareAmount = amount / participantIds.length;
  const { error: participantsError } = await supabase
    .from("expense_participants")
    .insert(
      participantIds.map((participantId) => ({
        expense_id: expenseId,
        member_id: participantId,
        share_amount: shareAmount,
      }))
    );

  if (participantsError) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(participantsError.message)}`);
  }

  revalidatePath(`/groups/${groupId}`);
}

export async function deleteExpense(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const expenseId = String(formData.get("expenseId") ?? "");

  if (!groupId || !expenseId) {
    redirect(`/groups/${groupId}?error=Missing%20expense%20details`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/groups/${groupId}`);
}
