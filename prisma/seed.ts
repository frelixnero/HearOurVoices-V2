/**
 * Seed data for HearOURVOICES (spec §44).
 * ALL people, agencies, courts, and cases here are FICTIONAL. Nothing in this
 * file refers to a real person or implies real wrongdoing (§44, §45 rule 13).
 *
 * Run: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/crypto';
import { ROLES, ROLE_PERMISSIONS } from '../src/lib/permissions/roles';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles…');
  for (const name of ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `${name} — grants: ${ROLE_PERMISSIONS[name].length} permissions (see src/lib/permissions/roles.ts)`,
      },
    });
  }

  console.log('Seeding fictional pilot jurisdiction (Cedar County / Riverbend)…');
  const cedar = await prisma.jurisdiction.upsert({
    where: { id: 'seed-cedar-county' },
    update: {},
    create: {
      id: 'seed-cedar-county',
      name: 'Cedar County',
      type: 'county',
      stateCode: 'ZZ', // fictional state
      officialWebsite: 'https://example.gov/cedar',
    },
  });
  const riverbend = await prisma.jurisdiction.upsert({
    where: { id: 'seed-riverbend' },
    update: {},
    create: {
      id: 'seed-riverbend',
      name: 'City of Riverbend',
      type: 'city',
      parentId: cedar.id,
      stateCode: 'ZZ',
      officialWebsite: 'https://example.gov/riverbend',
    },
  });

  const council = await prisma.governmentBody.upsert({
    where: { id: 'seed-riverbend-council' },
    update: {},
    create: {
      id: 'seed-riverbend-council',
      jurisdictionId: riverbend.id,
      name: 'Riverbend City Council',
      type: 'legislative',
    },
  });

  await prisma.agency.upsert({
    where: { id: 'seed-riverbend-pd' },
    update: {},
    create: {
      id: 'seed-riverbend-pd',
      jurisdictionId: riverbend.id,
      name: 'Riverbend Police Department',
      type: 'law_enforcement',
    },
  });
  const procurement = await prisma.agency.upsert({
    where: { id: 'seed-riverbend-procurement' },
    update: {},
    create: {
      id: 'seed-riverbend-procurement',
      jurisdictionId: riverbend.id,
      name: 'Riverbend Procurement Office',
      type: 'administrative',
    },
  });

  console.log('Seeding fictional officials…');
  const mayor = await prisma.person.upsert({
    where: { id: 'seed-person-mayor' },
    update: {},
    create: { id: 'seed-person-mayor', fullName: 'Jordan Reed', biography: 'Fictional Mayor of Riverbend (demo data).' },
  });
  const mayorOffice = await prisma.office.upsert({
    where: { id: 'seed-office-mayor' },
    update: {},
    create: {
      id: 'seed-office-mayor',
      jurisdictionId: riverbend.id,
      title: 'Mayor',
      officeType: 'executive',
      electedOrAppointed: 'elected',
    },
  });
  const mayorTerm = await prisma.officeTerm.upsert({
    where: { id: 'seed-term-mayor' },
    update: {},
    create: {
      id: 'seed-term-mayor',
      officeId: mayorOffice.id,
      personId: mayor.id,
      startDate: new Date('2023-01-01'),
      status: 'active',
    },
  });

  console.log('Seeding a source + citations…');
  const minutesSource = await prisma.source.upsert({
    where: { id: 'seed-source-minutes' },
    update: {},
    create: {
      id: 'seed-source-minutes',
      title: 'Riverbend City Council Minutes — Mar 2024 (fictional)',
      sourceType: 'MEETING_RECORD',
      quality: 'PRIMARY_OFFICIAL',
      publisher: 'City of Riverbend',
      url: 'https://example.gov/riverbend/minutes/2024-03',
      publishedAt: new Date('2024-03-14'),
    },
  });

  console.log('Seeding a completed promise and a broken promise (§44)…');
  const completed = await prisma.promise.upsert({
    where: { id: 'seed-promise-completed' },
    update: {},
    create: {
      id: 'seed-promise-completed',
      personId: mayor.id,
      officeTermId: mayorTerm.id,
      text: 'Publish the annual city budget online in an open format.',
      category: 'transparency',
      madeAt: new Date('2023-02-01'),
      status: 'COMPLETED',
      confidence: 'strongly_supported',
      lastReviewedAt: new Date('2024-04-01'),
    },
  });
  await prisma.promise.upsert({
    where: { id: 'seed-promise-broken' },
    update: {},
    create: {
      id: 'seed-promise-broken',
      personId: mayor.id,
      officeTermId: mayorTerm.id,
      text: 'Reduce public-records response time to under 10 business days.',
      category: 'records_compliance',
      madeAt: new Date('2023-02-01'),
      status: 'BROKEN',
      confidence: 'partially_supported',
      lastReviewedAt: new Date('2024-05-01'),
    },
  });
  await prisma.citation.create({
    data: { sourceId: minutesSource.id, subjectType: 'promise', subjectId: completed.id },
  });

  console.log('Seeding a scorecard with INSUFFICIENT DATA (missing data ≠ zero, §10.5)…');
  const methodology = await prisma.scorecardMethodology.upsert({
    where: { name_version: { name: 'Elected Official Scorecard', version: '1.0' } },
    update: {},
    create: {
      name: 'Elected Official Scorecard',
      version: '1.0',
      entityType: 'official',
      description: 'Demo methodology. Missing data is shown as Insufficient Data, never scored as zero.',
      effectiveFrom: new Date('2024-01-01'),
    },
  });
  const scorecard = await prisma.scorecard.upsert({
    where: { id: 'seed-scorecard-mayor' },
    update: {},
    create: {
      id: 'seed-scorecard-mayor',
      entityType: 'official',
      entityId: mayor.id,
      methodologyId: methodology.id,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-06-30'),
      overallScore: null, // deliberately null — not enough data
      confidence: 'insufficient_data',
      insufficientData: true,
      publishedAt: new Date('2024-07-01'),
    },
  });
  await prisma.scorecardCategory.create({
    data: {
      scorecardId: scorecard.id,
      categoryName: 'Public-Records Compliance',
      score: null,
      weight: '1.0',
      confidence: 'insufficient_data',
      explanation: 'Only 2 of an estimated 15 requests are documented — not enough to score.',
    },
  });

  console.log('Seeding a disputed claim with an official response (§44)…');
  const researcher = await prisma.user.upsert({
    where: { email: 'researcher@demo.hearourvoices.test' },
    update: {},
    create: {
      email: 'researcher@demo.hearourvoices.test',
      displayName: 'Demo Researcher',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      passwordHash: await hashPassword('DemoPassphrase!2024'),
      profile: { create: { homeJurisdictionId: riverbend.id, publicLocationLevel: 'city' } },
    },
  });
  const disputed = await prisma.claim.upsert({
    where: { id: 'seed-claim-disputed' },
    update: {},
    create: {
      id: 'seed-claim-disputed',
      submitterUserId: researcher.id,
      claimType: 'STATISTICAL_CLAIM',
      text: 'The Procurement Office awarded 3 no-bid contracts in Q1 2024 above the posted threshold.',
      targetType: 'agency',
      targetId: procurement.id,
      jurisdictionId: riverbend.id,
      topic: 'procurement',
      status: 'PUBLISHED',
      confidenceLabel: 'DISPUTED',
      visibility: 'PUBLIC',
      publishedAt: new Date('2024-06-15'),
      officialResponseStatus: 'responded',
    },
  });
  await prisma.officialResponse.create({
    data: {
      claimId: disputed.id,
      responderUserId: researcher.id, // stand-in; real flow requires official verification
      subjectType: 'claim',
      subjectId: disputed.id,
      responseType: 'dispute',
      body: 'The office states two of the three contracts fell under an emergency exemption. Documentation attached. (Displayed as a response, not treated as proven — §24.)',
    },
  });

  console.log('Seeding an append-only audit entry…');
  await prisma.auditLog.create({
    data: {
      actorUserId: researcher.id,
      action: 'claim.published',
      entityType: 'claim',
      entityId: disputed.id,
      afterJson: { confidenceLabel: 'DISPUTED' },
    },
  });

  console.log('Seeding a fictional upcoming election with candidates (§18, §44)…');
  const electionDate = new Date(Date.now() + 45 * 24 * 3600 * 1000); // ~45 days out
  const election = await prisma.election.upsert({
    where: { id: 'seed-election-2026' },
    update: { electionDate, status: 'upcoming' },
    create: {
      id: 'seed-election-2026',
      name: 'Riverbend City Election',
      jurisdictionId: riverbend.id,
      electionDate,
      type: 'general',
      status: 'upcoming',
      description: 'Voters will choose the next Mayor of Riverbend.',
    },
  });
  const race = await prisma.race.upsert({
    where: { id: 'seed-race-mayor' },
    update: {},
    create: {
      id: 'seed-race-mayor',
      electionId: election.id,
      title: 'Mayor of Riverbend',
      description: 'The mayor runs the city and helps decide how money is spent.',
    },
  });
  // Two fully fictional candidates with plain-language positions and pros/cons.
  const candA = await prisma.candidate.upsert({
    where: { id: 'seed-cand-a' },
    update: {},
    create: {
      id: 'seed-cand-a',
      raceId: race.id,
      name: 'Jordan Reed',
      party: 'Nonpartisan',
      incumbent: true,
      bio: 'Jordan is the mayor now and wants to keep the job. Jordan has run the city for three years.',
      photoGradient: 'linear-gradient(135deg,#123f52,#1e6d78)',
      positions: {
        create: [
          { topic: 'New parks', stance: 'for', summary: 'Wants to build two new parks with city money.' },
          { topic: 'Open budget', stance: 'for', summary: 'Wants to put all city spending online so anyone can see it.' },
          { topic: 'Higher water fees', stance: 'against', summary: 'Says water bills should not go up this year.' },
        ],
      },
      prosCons: {
        create: [
          { kind: 'pro', text: 'Kept a promise to put the budget online.' },
          { kind: 'pro', text: 'Answers records requests faster than before.' },
          { kind: 'con', text: 'Broke a promise to speed up records to under 10 days.' },
        ],
      },
    },
  });
  const candB = await prisma.candidate.upsert({
    where: { id: 'seed-cand-b' },
    update: {},
    create: {
      id: 'seed-cand-b',
      raceId: race.id,
      name: 'Sam Rivera',
      party: 'Nonpartisan',
      incumbent: false,
      bio: 'Sam is a small business owner running for mayor for the first time.',
      photoGradient: 'linear-gradient(135deg,#873f28,#d18145)',
      positions: {
        create: [
          { topic: 'New parks', stance: 'against', summary: 'Says the city should fix old roads before building new parks.' },
          { topic: 'Fix roads', stance: 'for', summary: 'Wants to spend money fixing streets and potholes first.' },
          { topic: 'Open budget', stance: 'for', summary: 'Also wants city spending posted online.' },
        ],
      },
      prosCons: {
        create: [
          { kind: 'pro', text: 'Has a clear plan to fix roads.' },
          { kind: 'con', text: 'Has never held a city job, so less experience.' },
        ],
      },
    },
  });
  void candA; void candB;

  console.log('Seed complete. Demo login: researcher@demo.hearourvoices.test / DemoPassphrase!2024');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
