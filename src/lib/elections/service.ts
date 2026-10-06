// Elections & candidate guide (spec §18, §19). Nonpartisan, plain-language.
// The "timely" surface promotes an active/upcoming election to the home page so
// important civic moments show up front.
import { prisma } from '@/lib/db/client';

/** The one election to feature on the home page right now, if any (§8.2 brief). */
export async function getTimelyElection() {
  const now = new Date();
  const soon = new Date(now.getTime() + 90 * 24 * 3600 * 1000); // within 90 days
  const election = await prisma.election.findFirst({
    where: {
      status: { in: ['active', 'upcoming'] },
      electionDate: { gte: now, lte: soon },
    },
    orderBy: { electionDate: 'asc' },
    include: { races: { include: { candidates: true } } },
  });
  if (!election) return null;
  const candidateCount = election.races.reduce((n, r) => n + r.candidates.length, 0);
  const days = Math.max(0, Math.ceil((election.electionDate.getTime() - now.getTime()) / (24 * 3600 * 1000)));
  return {
    id: election.id,
    name: election.name,
    electionDate: election.electionDate,
    daysAway: days,
    raceCount: election.races.length,
    candidateCount,
  };
}

export async function listElections() {
  return prisma.election.findMany({
    orderBy: { electionDate: 'asc' },
    select: {
      id: true,
      name: true,
      electionDate: true,
      registrationDeadline: true,
      earlyVotingStart: true,
      earlyVotingEnd: true,
      officialPortalUrl: true,
      status: true,
      type: true,
    },
  });
}

/** Full guide for one election: races → candidates → positions + pros/cons. */
export async function getElectionGuide(electionId: string) {
  return prisma.election.findUnique({
    where: { id: electionId },
    include: {
      races: {
        include: {
          candidates: {
            include: {
              positions: { orderBy: { topic: 'asc' } },
              prosCons: true,
            },
          },
        },
      },
    },
  });
}
