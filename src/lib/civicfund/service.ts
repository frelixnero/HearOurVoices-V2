// CivicFund DB service (spec §16). Wraps campaigns, contributions, and expenses
// with the ledger accounting in ledger.ts. Expense approval requires available
// funds and is audited; high-risk disbursement needs `finance.approve_disbursement`
// (MFA-gated) enforced at the route.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { computeLedger, canApproveExpense, type Contribution, type Expense } from './ledger';

export async function createCampaign(input: {
  creatorUserId: string;
  campaignType: string;
  title: string;
  description: string;
  jurisdictionId?: string;
  goalAmountCents: number;
  platformFeeRate?: number;
  refundPolicy: string;
}) {
  return prisma.campaign.create({
    data: {
      creatorUserId: input.creatorUserId,
      campaignType: input.campaignType,
      title: input.title,
      description: input.description,
      jurisdictionId: input.jurisdictionId ?? null,
      goalAmount: input.goalAmountCents / 100,
      status: 'DRAFT',
      platformFeeRate: input.platformFeeRate ?? 0.05,
      refundPolicy: input.refundPolicy,
    },
  });
}

export async function recordContribution(input: {
  campaignId: string;
  contributorUserId: string;
  amountCents: number;
  processorFeeCents: number;
  platformFeeCents: number;
  status?: 'pending' | 'succeeded';
}) {
  const c = await prisma.contribution.create({
    data: {
      campaignId: input.campaignId,
      contributorUserId: input.contributorUserId,
      amount: input.amountCents / 100,
      processorFee: input.processorFeeCents / 100,
      platformFee: input.platformFeeCents / 100,
      status: input.status ?? 'succeeded',
    },
  });
  await writeAudit({
    actorUserId: input.contributorUserId,
    action: 'civicfund.contribution',
    entityType: 'campaign',
    entityId: input.campaignId,
    after: { amountCents: input.amountCents, status: c.status },
  });
  return c;
}

export async function proposeExpense(input: {
  campaignId: string;
  category: string;
  vendor: string;
  amountCents: number;
  description: string;
}) {
  return prisma.campaignExpense.create({
    data: {
      campaignId: input.campaignId,
      category: input.category,
      vendor: input.vendor,
      amount: input.amountCents / 100,
      description: input.description,
      status: 'proposed',
    },
  });
}

/** Load contributions + expenses and compute the transparent ledger (§16.5). */
export async function getLedger(campaignId: string) {
  const [contribs, expenses] = await Promise.all([
    prisma.contribution.findMany({ where: { campaignId } }),
    prisma.campaignExpense.findMany({ where: { campaignId } }),
  ]);
  const c: Contribution[] = contribs.map((x) => ({
    amountCents: Math.round(Number(x.amount) * 100),
    processorFeeCents: Math.round(Number(x.processorFee ?? 0) * 100),
    platformFeeCents: Math.round(Number(x.platformFee ?? 0) * 100),
    status: x.status as Contribution['status'],
  }));
  const e: Expense[] = expenses.map((x) => ({
    amountCents: Math.round(Number(x.amount) * 100),
    status: x.status as Expense['status'],
  }));
  return computeLedger(c, e);
}

/**
 * Approve an expense only if funds are available (§16.7). Finance-reviewer role +
 * MFA is enforced at the route. Throws if it would overspend the campaign.
 */
export async function approveExpense(input: {
  expenseId: string;
  approverUserId: string;
}) {
  const expense = await prisma.campaignExpense.findUniqueOrThrow({ where: { id: input.expenseId } });
  const ledger = await getLedger(expense.campaignId);
  const cents = Math.round(Number(expense.amount) * 100);
  if (!canApproveExpense(ledger, cents)) {
    throw new Error('Expense exceeds available campaign funds — cannot approve (§16.7).');
  }
  const updated = await prisma.campaignExpense.update({
    where: { id: input.expenseId },
    data: { status: 'approved', approvedBy: input.approverUserId },
  });
  await writeAudit({
    actorUserId: input.approverUserId,
    action: 'civicfund.expense_approved',
    entityType: 'campaign',
    entityId: expense.campaignId,
    after: { expenseId: input.expenseId, amountCents: cents },
  });
  return updated;
}
