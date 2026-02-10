export type Member = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  amount: number;
  payer_member_id: string;
};

export type Participant = {
  expense_id: string;
  member_id: string;
  share_amount: number;
};

export type Balance = {
  memberId: string;
  name: string;
  paid: number;
  owed: number;
  balance: number;
};

export type Settlement = {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  amount: number;
};

export function computeBalances(
  members: Member[],
  expenses: Expense[],
  participants: Participant[]
): Balance[] {
  const paidByMember = new Map<string, number>();
  const owedByMember = new Map<string, number>();

  expenses.forEach((expense) => {
    paidByMember.set(
      expense.payer_member_id,
      (paidByMember.get(expense.payer_member_id) ?? 0) + expense.amount
    );
  });

  participants.forEach((participant) => {
    owedByMember.set(
      participant.member_id,
      (owedByMember.get(participant.member_id) ?? 0) + participant.share_amount
    );
  });

  return members.map((member) => {
    const paid = paidByMember.get(member.id) ?? 0;
    const owed = owedByMember.get(member.id) ?? 0;
    const balance = roundCurrency(paid - owed);

    return {
      memberId: member.id,
      name: member.name,
      paid: roundCurrency(paid),
      owed: roundCurrency(owed),
      balance,
    };
  });
}

export function computeSettlements(balances: Balance[]): Settlement[] {
  const creditors = balances
    .filter((balance) => balance.balance > 0)
    .map((balance) => ({ ...balance }));
  const debtors = balances
    .filter((balance) => balance.balance < 0)
    .map((balance) => ({ ...balance }));

  const settlements: Settlement[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(
      creditor.balance,
      Math.abs(debtor.balance)
    );

    if (amount > 0) {
      settlements.push({
        fromId: debtor.memberId,
        toId: creditor.memberId,
        fromName: debtor.name,
        toName: creditor.name,
        amount: roundCurrency(amount),
      });

      creditor.balance = roundCurrency(creditor.balance - amount);
      debtor.balance = roundCurrency(debtor.balance + amount);
    }

    if (creditor.balance <= 0) {
      creditorIndex += 1;
    }

    if (debtor.balance >= 0) {
      debtorIndex += 1;
    }
  }

  return settlements;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}
