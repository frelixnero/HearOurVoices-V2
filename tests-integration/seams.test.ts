import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db/client';
import { startVerification, completeVerification } from '@/lib/identity/service';
import { createEvidence } from '@/lib/evidence/service';
import { getTimelyElection, getElectionGuide, listElections } from '@/lib/elections/service';
import { makeUser } from './setup/factory';

describe('Identity verification → Verified Citizen (spec §6.3) — integration', () => {
  it('a registered citizen becomes verified after approval', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { verificationId } = await startVerification(u.id);
    const result = await completeVerification(u.id, verificationId);
    expect(result.verified).toBe(true);

    const roles = await prisma.userRole.findMany({
      where: { userId: u.id }, include: { role: true },
    });
    expect(roles.map((r) => r.role.name)).toContain('VERIFIED_CITIZEN');
    const user = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(user.status).toBe('ACTIVE');
  });
});

describe('Malware scan (spec §31/§32) — integration', () => {
  it('rejects a file containing the EICAR test signature', async () => {
    const u = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const eicar = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
    await expect(
      createEvidence({
        uploaderUserId: u.id, title: 'bad', evidenceType: 'pdf',
        bytes: Buffer.from(eicar), mimeType: 'application/pdf', originalFilename: 'v.pdf',
      }),
    ).rejects.toThrow(/malware scan/i);
  });
});

describe('Elections guide (spec §18) — integration', () => {
  it('builds a timely election with candidates, positions, and pros/cons', async () => {
    const election = await prisma.election.create({
      data: {
        name: 'Testville Vote', electionDate: new Date(Date.now() + 20 * 86400000),
        type: 'general', status: 'upcoming',
        races: {
          create: {
            title: 'Mayor',
            candidates: {
              create: {
                name: 'Pat Doe', incumbent: false,
                positions: { create: [{ topic: 'Parks', stance: 'for', summary: 'Build parks.' }] },
                prosCons: { create: [{ kind: 'pro', text: 'Clear plan.' }, { kind: 'con', text: 'New to the job.' }] },
              },
            },
          },
        },
      },
    });

    const timely = await getTimelyElection();
    expect(timely).not.toBeNull();
    expect(timely!.candidateCount).toBeGreaterThanOrEqual(1);

    const guide = await getElectionGuide(election.id);
    const cand = guide!.races[0]!.candidates[0]!;
    expect(cand.positions.some((p) => p.stance === 'for')).toBe(true);
    expect(cand.prosCons.some((p) => p.kind === 'con')).toBe(true);

    const all = await listElections();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
});
