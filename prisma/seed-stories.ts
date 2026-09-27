/**
 * Seed for the story-sharing platform: topics, community-support resources, and a
 * few FICTIONAL demonstration stories (no real people, no real orgs).
 * Run: npx tsx prisma/seed-stories.ts   (requires DATABASE_URL + a migrated DB)
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/crypto';
const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@hearourvoices.local';
const ADMIN_PASSWORD = 'Admin-hearOURvoices-2026!';

const TOPICS = [
  ['workplace', 'Workplace', 'Jobs, bosses, pay, and fairness at work.', 1],
  ['school', 'School', 'Classrooms, bullying, and being heard.', 2],
  ['healthcare', 'Healthcare', 'Care, treatment, and your rights.', 3],
  ['justice', 'Justice', 'Courts, police, and fairness under the law.', 4],
  ['military', 'Military', 'Service, coming home, and support.', 5],
  ['other', 'Other', 'Everything else that matters to you.', 6],
] as const;

const RESOURCES = [
  ['crisis', 'Emergency services', 'If you are in immediate danger, call your local emergency number now.', '911', null, 1],
  ['crisis', '24/7 crisis support line', 'Free, confidential support any time, day or night.', null, null, 2],
  ['mental_health', 'Find help near you', 'Search local mental-health services and counselors.', null, null, 1],
  ['mental_health', 'Talk to someone today', 'Confidential, judgment-free conversations when you need them.', null, null, 2],
  ['legal', 'Know your rights', 'Free legal-aid information and referrals.', null, null, 1],
  ['community', 'Support groups', 'Connect and heal together with people who understand.', null, null, 1],
] as const;

const STORIES = [
  { name: 'Anonymous', title: 'I was never listened to until I found this community', body: 'For years I felt invisible at work. Sharing what happened — and reading that others went through the same — gave me the words to finally speak up. I am not the same person I was six months ago.', topics: ['workplace'] },
  { name: 'Anonymous', title: 'It happened in school. I was afraid to speak up.', body: 'I kept it to myself for a long time. Writing it down here, where no one could see my name, was the first step to feeling okay again. Thank you to everyone who left a kind word.', topics: ['school'] },
  { name: 'Maria', title: 'The care I needed finally came after I told my story', body: 'I documented every appointment and every answer I was given. Putting it in one place helped me understand my own rights, and I finally got the care I needed.', topics: ['healthcare'] },
  { name: 'Anonymous', title: 'Coming home was harder than anyone told me', body: 'Connecting with others who served made the difference. You are not alone — that sentence saved me on a night I will never forget.', topics: ['military'] },
];

async function main() {
  console.log('Seeding admin account…');
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { isAdmin: true, isModerator: true, status: 'ACTIVE' },
    create: {
      email: ADMIN_EMAIL, displayName: 'Site Admin', status: 'ACTIVE',
      emailVerifiedAt: new Date(), passwordHash: await hashPassword(ADMIN_PASSWORD),
      isAdmin: true, isModerator: true, profile: { create: {} },
    },
  });

  console.log('Seeding topics…');
  for (const [slug, name, description, sortOrder] of TOPICS) {
    await prisma.topic.upsert({ where: { slug }, update: { name, description, sortOrder }, create: { slug, name, description, sortOrder } });
  }

  console.log('Seeding support resources…');
  await prisma.supportResource.deleteMany({});
  for (const [category, name, description, phone, url, sortOrder] of RESOURCES) {
    await prisma.supportResource.create({ data: { category, name, description, phone, url, sortOrder } });
  }

  console.log('Seeding demonstration stories…');
  const count = await prisma.story.count();
  if (count === 0) {
    for (const s of STORIES) {
      await prisma.story.create({
        data: {
          displayName: s.name, anonymous: s.name === 'Anonymous', title: s.title, body: s.body,
          topics: [...s.topics], status: 'PUBLISHED', publishedAt: new Date(),
          supportCount: Math.floor(Math.random() * 180) + 20,
          commentCount: Math.floor(Math.random() * 40),
        },
      });
    }
    // One held story so the admin review queue has something to demonstrate.
    await prisma.story.create({
      data: {
        displayName: 'Anonymous', anonymous: true, title: 'A post awaiting safety review',
        body: 'This example was flagged by the safety screen and is waiting for a moderator to approve or remove it.',
        topics: ['other'], status: 'PENDING_REVIEW',
      },
    });
  }
  console.log('Seeding demonstration rumors with votes…');
  const rumorCount = await prisma.rumor.count();
  if (rumorCount === 0) {
    const rumors: { text: string; topic: string; acc: number; inacc: number }[] = [
      { text: 'I heard the company is freezing all raises next quarter.', topic: 'workplace', acc: 34, inacc: 6 },   // ~85% accurate
      { text: 'Someone said the school is quietly cutting the counseling program.', topic: 'school', acc: 12, inacc: 11 }, // ~mixed
      { text: 'People are saying the clinic lost everyone’s records in a hack.', topic: 'healthcare', acc: 3, inacc: 22 }, // mostly inaccurate
      { text: 'Rumor going around that the new policy takes effect Monday.', topic: 'other', acc: 2, inacc: 1 },        // unverified (too few)
    ];
    for (const r of rumors) {
      const rumor = await prisma.rumor.create({
        data: { displayName: 'Anonymous', anonymous: true, text: r.text, topic: r.topic, status: 'OPEN', accurateVotes: r.acc, inaccurateVotes: r.inacc },
      });
      // Materialize individual votes (synthetic user ids; userId is not an FK).
      const votes = [
        ...Array.from({ length: r.acc }, (_, i) => ({ rumorId: rumor.id, userId: `seed-acc-${rumor.id}-${i}`, vote: 'accurate' })),
        ...Array.from({ length: r.inacc }, (_, i) => ({ rumorId: rumor.id, userId: `seed-inacc-${rumor.id}-${i}`, vote: 'inaccurate' })),
      ];
      await prisma.rumorVote.createMany({ data: votes });
    }
  }

  console.log('Seeding demonstration Community Reports (both lanes)…');
  const crCount = await prisma.communityReport.count();
  if (crCount === 0) {
    // Citizen lane — labeled, various claim statuses.
    await prisma.communityReport.createMany({
      data: [
        {
          authorUserId: 'seed-citizen-1', lane: 'CITIZEN', displayName: 'Anonymous', anonymous: true,
          label: 'FIRSTHAND_ACCOUNT', claimStatus: 'EVIDENCE_DEVELOPING',
          title: 'My hours were cut with no notice', topic: 'workplace',
          body: 'I showed up Monday and my shifts were gone from the schedule. A few coworkers said the same thing happened to them. I have screenshots of the old schedule.',
          sourceUrl: 'https://example.org/schedule-screenshot', status: 'PUBLISHED', publishedAt: new Date(),
        },
        {
          authorUserId: 'seed-citizen-2', lane: 'CITIZEN', displayName: 'Anonymous', anonymous: true,
          label: 'OPINION', claimStatus: 'UNREVIEWED',
          title: 'I think the new parking rules are unfair to night workers',
          body: 'This is my opinion: charging for overnight parking hurts people who work late shifts and have no other option.',
          status: 'PUBLISHED', publishedAt: new Date(),
        },
        {
          authorUserId: 'seed-citizen-3', lane: 'CITIZEN', displayName: 'Anonymous', anonymous: true,
          label: 'VERIFIED_BY_RECORDS', claimStatus: 'VERIFIED',
          title: 'The library confirmed Sunday hours are ending', topic: 'other',
          body: 'I asked and got it in writing: Sunday hours end next month. Posting so others know.',
          sourceUrl: 'https://example.org/library-notice', status: 'PUBLISHED', publishedAt: new Date(),
        },
      ],
    });
    // Journalist lane — full structured report, verified.
    await prisma.communityReport.create({
      data: {
        authorUserId: 'seed-journalist-1', lane: 'JOURNALIST', displayName: 'A. Rivera', anonymous: false,
        label: 'EVIDENCE_SUBMITTED', claimStatus: 'VERIFIED',
        title: 'City council confirms bus route changes at public meeting',
        body: 'At the July 8 meeting, the transportation director said routes 4 and 12 will be combined on September 1.',
        exactClaim: 'The city is changing bus routes 4, 12, and 7 effective September 1.',
        videoShows: 'The director stating on the public record: “Routes 4 and 12 will be combined starting September 1, and Saturday service on Route 7 will end.”',
        videoDoesntProve: 'It does not prove ridership impact or whether the changes are permanent.',
        confirmedParts: 'Confirmed: the dates and routes, matching the posted minutes. Unconfirmed: long-term plans beyond this year.',
        origin: 'The official council meeting recording and posted minutes.',
        whyImportant: 'Thousands of riders depend on these routes; the exact dates let people plan and comment before the change.',
        affectedParty: 'City Transportation Department',
        affectedResponse: 'The department confirmed the dates by email and provided the minutes.',
        conflicts: 'None.',
        neutralityFlags: [], sourceUrl: 'https://example.org/council/2026-07-08',
        status: 'PUBLISHED', publishedAt: new Date(),
      },
    });
  }

  console.log('Seeding demonstration Civic News (illustrative, fictional actors)…');
  const newsCount = await prisma.civicNews.count();
  if (newsCount === 0) {
    const items = [
      {
        scope: 'LOCAL' as const, authority: 'COUNCIL' as const, title: 'Council adopts parking fee change without a recorded vote',
        actorType: 'City Council', actionType: 'city_council' as const, nextStep: 'Next, residents can ask for a recorded re-vote at the next council meeting.', jurisdiction: 'Riverbend, ZZ',
        alternatives: ['Hold a recorded roll-call vote so residents can see how each member voted.', 'Post the fee amendment 72 hours in advance for public review.', 'Phase in the fee with an exemption for overnight shift workers.'],
        powerMap: ['Mayor — could have requested a recorded vote or vetoed the ordinance.', 'Any council member — could have moved to table the last-minute amendment.', 'City Clerk — could have flagged the missing roll-call record.'],
        whatHappened: 'At the July 8 meeting, the Riverbend City Council adopted a new overnight parking fee by voice vote. No individual roll-call vote was recorded, and an amendment raising the fee was added the same evening.',
        whyItMatters: 'Overnight parking fees hit shift workers and people without driveways hardest. Without a recorded vote, residents cannot see how their own representative voted.',
        pros: ['New revenue funds street repairs the city says are overdue.', 'Fee is waived for registered disabled residents.'],
        cons: ['Night-shift workers have few alternatives and now pay more.', 'The last-minute amendment was not posted in advance for public review.'],
        process: { recordedVote: false, publicNotice: true, amendmentPosted: false, meetingRecorded: true, publicComment: true, procedureLegal: null },
        impactLevel: 3,
        sources: [
          { label: 'RECORDED' as const, title: 'Council meeting video — July 8 (fictional demo)', url: 'https://example.org/riverbend/2026-07-08' },
          { label: 'DOCUMENTED' as const, title: 'Adopted ordinance text (fictional demo)', url: 'https://example.org/riverbend/ord-2026-14' },
          { label: 'MISSING' as const, title: 'Roll-call vote record — not found', url: undefined },
        ],
        votes: { good: 6, bad: 22, info: 7, reasons: ['No recorded vote.', 'Changed at the last minute.', 'This harms the community.', 'This helps the community.'] },
      },
      {
        scope: 'STATE' as const, authority: 'EXECUTIVE' as const, title: 'Governor signs budget bill with a fee amendment added on the final day',
        actorType: 'Governor', jurisdiction: 'State of Columbia (example)',
        alternatives: ['Line-item veto the late fee amendment and sign the rest.', 'Send the fee back to committee for a public hearing.', 'Delay signing until the standard 24-hour public review passed.'],
        powerMap: ['Governor — could have used a line-item veto on the fee.', 'Legislative leadership — could have refused the last-day amendment.', 'State auditor — can review whether the process met budget rules.'],
        whatHappened: 'The governor signed the annual budget bill. An amendment adding a new vehicle-registration fee was inserted on the final day of the session and was in the version that passed.',
        whyItMatters: 'Late amendments give the public little time to weigh in on measures that affect every driver in the state.',
        pros: ['Fee is dedicated to road safety programs, per the bill text.', 'The overall budget funds schools and emergency services.'],
        cons: ['The fee amendment appeared with less than 24 hours of notice.', 'No separate public hearing was held on the new fee.'],
        process: { recordedVote: true, publicNotice: true, amendmentPosted: false, meetingRecorded: true, publicComment: false, procedureLegal: true },
        impactLevel: 4,
        sources: [
          { label: 'DOCUMENTED' as const, title: 'Enrolled bill text with amendment (fictional demo)', url: 'https://example.org/columbia/hb-100' },
          { label: 'RECORDED' as const, title: 'Floor session recording (fictional demo)', url: 'https://example.org/columbia/session' },
        ],
        votes: { good: 14, bad: 18, info: 9, reasons: ['Changed at the last minute.', 'This seems unfair.', 'Process was followed correctly.', 'I need more details.'] },
      },
      {
        scope: 'NATION' as const, authority: 'COMMITTEE' as const, title: 'Committee advances a bill; public-comment window questioned',
        actorType: 'Legislative committee (example)', actionType: 'committee_hearing' as const, jurisdiction: 'National (example)',
        alternatives: ['Extend the public-comment window to the committee’s usual length.', 'Split the bundled amendments for separate debate and votes.', 'Publish a plain-language summary alongside the bill text.'],
        powerMap: ['Committee chair — could have extended the comment window.', 'Ranking member — could have forced separate votes on amendments.', 'Full chamber — can still amend or reject the bill.'],
        whatHappened: 'A committee advanced a bill to the full chamber. The recorded vote is published. Advocacy groups say the public-comment window was shorter than usual for a bill of this size.',
        whyItMatters: 'How much time the public gets to review and comment shapes whether large national policies are debated openly.',
        pros: ['The committee vote is fully recorded and published.', 'The bill text was posted before the vote.'],
        cons: ['The public-comment window was shorter than the committee’s typical practice.', 'Several amendments were bundled together, limiting separate debate.'],
        process: { recordedVote: true, publicNotice: true, amendmentPosted: true, meetingRecorded: true, publicComment: true, procedureLegal: true },
        impactLevel: 3,
        sources: [
          { label: 'RECORDED' as const, title: 'Committee roll-call vote (fictional demo)', url: 'https://example.org/committee/vote' },
          { label: 'DOCUMENTED' as const, title: 'Bill text as advanced (fictional demo)', url: 'https://example.org/committee/bill' },
          { label: 'UNVERIFIED' as const, title: 'Advocacy group statement on timing', url: undefined },
        ],
        votes: { good: 20, bad: 11, info: 12, reasons: ['Process was followed correctly.', 'This feels rushed.', 'I need more details.', 'This seems fair.'] },
      },
    ];
    for (const it of items) {
      const actorKey = (it.actorType || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || null;
      const news = await prisma.civicNews.create({
        data: {
          scope: it.scope, authority: it.authority, title: it.title, actorType: it.actorType,
          actionType: (it as { actionType?: string }).actionType ?? null,
          nextStep: (it as { nextStep?: string }).nextStep ?? null,
          actorKey, jurisdiction: it.jurisdiction,
          whatHappened: it.whatHappened, whyItMatters: it.whyItMatters, pros: it.pros, cons: it.cons,
          alternatives: it.alternatives, powerMap: it.powerMap,
          recordedVote: it.process.recordedVote, publicNotice: it.process.publicNotice,
          amendmentPosted: it.process.amendmentPosted, meetingRecorded: it.process.meetingRecorded,
          publicComment: it.process.publicComment, procedureLegal: it.process.procedureLegal,
          impactLevel: it.impactLevel, goodVotes: it.votes.good, badVotes: it.votes.bad, infoVotes: it.votes.info,
          status: 'PUBLISHED', publishedAt: new Date(),
          sources: { create: it.sources.map((s) => ({ label: s.label, title: s.title, url: s.url ?? null })) },
        },
      });
      // Materialize votes so "top reasons" has data (synthetic user ids).
      const mk = (verdict: 'GOOD_MOVE' | 'BAD_MOVE' | 'NEEDS_INFO', n: number) => Array.from({ length: n }, (_, i) => ({
        newsId: news.id, userId: `seed-${verdict}-${news.id}-${i}`, verdict,
        reason: it.votes.reasons[i % it.votes.reasons.length]!,
      }));
      await prisma.civicVote.createMany({ data: [...mk('GOOD_MOVE', it.votes.good), ...mk('BAD_MOVE', it.votes.bad), ...mk('NEEDS_INFO', it.votes.info)] });
    }
  }

  console.log('Seeding demonstration Justice Vault cases (FICTIONAL — no real people)…');
  const caseCount = await prisma.justiceCase.count();
  if (caseCount === 0) {
    const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    const createdBy = admin?.id ?? 'seed-admin';
    const cases = [
      {
        victimName: 'Jordan Ellis', victimAge: 24, location: 'Riverbend, ZZ (example)',
        dateOfIncident: new Date('2019-03-14'), caseType: 'Unsolved homicide (example)',
        status: 'ACTIVE' as const, justiceGapScore: 84, spotlightLevel: 3,
        memoryLockPrimary: 'Jordan Ellis was found dead near the Riverbend rail yard, and no one has been charged.',
        memoryLockFailure: 'Key evidence was logged late and the case was reassigned three times, and the family says their questions went unanswered for years.',
        whatWasLost: 'A community college student who was months from finishing a nursing degree, remembered for checking on elderly neighbors after every storm.',
        favoriteActivities: 'painting murals, coaching a kids’ soccer team, late-night diner runs',
        personalityWords: ['steady', 'funny', 'generous', 'stubborn', 'kind'],
        anchorPhrases: ['Months from graduating. Never got to walk.', 'Three detectives. Zero answers.', 'The neighbors still leave flowers.'],
        timeline: [
          { date: 'Mar 14, 2019', label: 'Incident', description: 'Reported missing after not returning home from a night shift.' },
          { date: 'Mar 16, 2019', label: 'Records release', scoreTag: 'BAD_MOVE', description: 'Body found; scene evidence was not logged into the property system for over 48 hours.' },
          { date: 'Apr 2019', label: 'Charging', scoreTag: 'NEEDS_INFO', description: 'A person of interest was questioned and released; no charges filed. Reason not made public.' },
          { date: '2019–2022', label: 'Aftermath', scoreTag: 'BAD_MOVE', description: 'Case reassigned to three different detectives; family says months passed between any updates.' },
          { date: '2023', label: 'Misconduct finding', scoreTag: 'GOOD_MOVE', description: 'An internal review confirmed the evidence-logging delay and recommended new intake procedures.' },
        ],
        actions: [
          { scoreTag: 'BAD_MOVE', actorType: 'Police department', description: 'Physical evidence from the scene was logged more than 48 hours late, weakening the chain of custody.', impactWeight: 9 },
          { scoreTag: 'NEEDS_INFO', actorType: 'District Attorney', description: 'Declined to explain publicly why the person of interest was released without charges.', impactWeight: 6 },
          { scoreTag: 'GOOD_MOVE', actorType: 'Internal affairs', description: 'Confirmed the logging failure on the record and recommended procedural changes.', impactWeight: 4 },
        ],
        questions: [
          { questionText: 'Why was scene evidence not logged for more than 48 hours?', targetAuthority: 'Police department', status: 'Unanswered' },
          { questionText: 'On what basis was the person of interest released?', targetAuthority: 'District Attorney', status: 'Unanswered' },
          { questionText: 'Were the recommended intake procedures ever adopted?', targetAuthority: 'Police department', status: 'Partially Answered' },
        ],
        flags: [
          { flag: 'Evidence-log timeline conflict', reason: 'The initial report and the property record give different dates for when scene evidence was booked.' },
          { flag: 'Unexplained release', reason: 'A person was questioned and released with no public reason, while the case remained open.' },
        ],
        sources: [
          { label: 'DOCUMENTED' as const, title: 'Internal review summary (fictional demo)', url: 'https://example.org/riverbend/review-2023' },
          { label: 'RECORDED' as const, title: 'Public briefing recording (fictional demo)', url: 'https://example.org/riverbend/briefing' },
          { label: 'MISSING' as const, title: 'Original evidence-intake log — not located', url: undefined },
        ],
      },
      {
        victimName: 'Priya Nakamura', victimAge: 31, location: 'State of Columbia (example)',
        dateOfIncident: new Date('2021-08-02'), caseType: 'In-custody death, under review (example)',
        status: 'UNDER_REVIEW' as const, justiceGapScore: 66, spotlightLevel: 2,
        memoryLockPrimary: 'Priya Nakamura died in custody hours after a routine booking, and the cause remains formally undetermined.',
        memoryLockFailure: 'Part of the booking-area camera footage was reported missing, and the family waited fourteen months for an autopsy summary.',
        whatWasLost: 'A high-school music teacher and volunteer translator, known for staying late to help students who had nowhere else to go.',
        favoriteActivities: 'playing cello, community gardening, translating at the free clinic',
        personalityWords: ['patient', 'warm', 'principled', 'curious'],
        anchorPhrases: ['Booked at 9 p.m. Gone by dawn.', 'The footage “wasn’t saved.”', 'Fourteen months for one page.'],
        timeline: [
          { date: 'Aug 2, 2021', label: 'Booking', description: 'Processed into the county facility following a non-violent arrest.' },
          { date: 'Aug 3, 2021', label: 'Incident', scoreTag: 'NEEDS_INFO', description: 'Found unresponsive in a holding area; pronounced dead at a nearby hospital.' },
          { date: 'Aug 2021', label: 'Records release', scoreTag: 'BAD_MOVE', description: 'A segment of holding-area camera footage was reported as not retained.' },
          { date: 'Oct 2022', label: 'Discovery', scoreTag: 'NEEDS_INFO', description: 'Autopsy summary released to the family; cause of death listed as undetermined.' },
        ],
        actions: [
          { scoreTag: 'BAD_MOVE', actorType: 'County facility', description: 'A segment of booking-area footage from the relevant window was not preserved.', impactWeight: 8 },
          { scoreTag: 'NEEDS_INFO', actorType: 'Medical examiner', description: 'Issued an undetermined cause of death; the family was not given a detailed briefing.', impactWeight: 6 },
          { scoreTag: 'GOOD_MOVE', actorType: 'Oversight board', description: 'Opened a formal review of camera-retention practices at the facility.', impactWeight: 5 },
        ],
        questions: [
          { questionText: 'Why was part of the holding-area footage not retained?', targetAuthority: 'County facility', status: 'Unanswered' },
          { questionText: 'What steps were taken between booking and the medical emergency?', targetAuthority: 'County facility', status: 'Unanswered' },
          { questionText: 'Will the oversight review be made public?', targetAuthority: 'Oversight board', status: 'Partially Answered' },
        ],
        flags: [
          { flag: 'Footage retention gap', reason: 'Camera footage exists before and after the relevant window but not during it, per the facility’s own log.' },
        ],
        sources: [
          { label: 'DOCUMENTED' as const, title: 'Autopsy summary cover page (fictional demo)', url: 'https://example.org/columbia/autopsy' },
          { label: 'RECORDED' as const, title: 'Oversight board hearing (fictional demo)', url: 'https://example.org/columbia/oversight' },
          { label: 'UNVERIFIED' as const, title: 'Family statement on timeline', url: undefined },
        ],
      },
    ];
    for (const c of cases) {
      await prisma.justiceCase.create({
        data: {
          createdBy, victimName: c.victimName, victimAge: c.victimAge, location: c.location,
          dateOfIncident: c.dateOfIncident, caseType: c.caseType, status: c.status,
          justiceGapScore: c.justiceGapScore, spotlightLevel: c.spotlightLevel,
          memoryLockPrimary: c.memoryLockPrimary, memoryLockFailure: c.memoryLockFailure,
          whatWasLost: c.whatWasLost, favoriteActivities: c.favoriteActivities,
          personalityWords: c.personalityWords, anchorPhrases: c.anchorPhrases,
          timeline: c.timeline as never, actions: c.actions as never, questions: c.questions as never,
          flags: c.flags as never, sources: c.sources as never,
          publishState: 'PUBLISHED', publishedAt: new Date(),
        },
      });
    }
  }

  console.log('Seeding demonstration Honor Vault heroes (FICTIONAL — no real people)…');
  const heroCount = await prisma.honorHero.count();
  if (heroCount === 0) {
    const admin2 = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    const createdBy = admin2?.id ?? 'seed-admin';
    const heroes = [
      {
        heroName: 'Marcus Reyes', rank: 'Staff Sergeant', branch: 'Army', category: 'COMBAT' as const,
        homeState: 'Arizona (example)', conflictOrEra: 'Afghanistan (example)',
        memoryLockPrimary: 'Staff Sgt. Marcus Reyes shielded three wounded soldiers during an ambush and carried them to cover.',
        memoryLockSacrifice: 'He was wounded protecting his team and received the Purple Heart and Silver Star.',
        serviceSummary: 'Eight years in the Army; two deployments; team leader known for putting his soldiers first.',
        momentOfCourage: 'When his patrol was pinned down, he crossed open ground twice under fire to pull injured teammates to safety, refusing evacuation until every soldier was accounted for.',
        legacyImpact: 'The three soldiers he saved all returned home to their families. His unit adopted the buddy-carry drill he insisted they rehearse.',
        medals: ['Silver Star', 'Purple Heart', 'Combat Infantryman Badge'],
        memoryPhrases: ['He ran toward the fire.', 'Nobody left behind.', 'Three families still say his name.'],
        chainOfInfluence: ['His fire team — all three survived.', 'His unit — adopted his rescue drill.', 'His family — a scholarship now bears his name.'],
        quotes: [{ quote: 'He’d tell us: take care of the person to your left and right. He lived it.', attribution: 'A soldier he saved' }],
        keyDates: [{ label: 'Date of valor', date: '06-14' }, { label: 'Birthday', date: '03-22' }],
        candles: 214, coins: 63, flags: 88, stones: 41, flowers: 27, spotlightLevel: 3,
        tributes: [
          { displayName: 'Dana R.', relationship: 'His sister', message: 'Every year on his birthday our whole family reads his story out loud. Thank you for keeping his name alive.' },
          { displayName: 'Cpl. J. Alvarez', relationship: 'Served with him', message: 'I’m one of the three he pulled out that day. I named my son after him. We will never forget.' },
        ],
      },
      {
        heroName: 'Eleanor Whitfield', rank: 'Chief Petty Officer', branch: 'Navy', category: 'LIFESAVING' as const,
        homeState: 'Maine (example)', conflictOrEra: 'Peacetime service & after (example)',
        memoryLockPrimary: 'Chief Whitfield pulled two civilians from a flooding vehicle during a storm while off duty.',
        memoryLockSacrifice: 'After 20 years of service, she spent her retirement running a shelter for homeless veterans.',
        serviceSummary: 'Twenty years in the Navy as a rescue swimmer and instructor; hundreds of sailors trained.',
        momentOfCourage: 'On a washed-out road at night, she swam to a submerged car and freed a mother and child trapped by the current, staying until first responders arrived.',
        legacyImpact: 'Her veterans’ shelter has housed hundreds of former service members. The rescue techniques she taught are still used by her old unit.',
        medals: ['Navy and Marine Corps Medal', 'Navy Achievement Medal'],
        memoryPhrases: ['She saved lives without hesitation.', 'Still serving after the uniform.', 'Her door was always open.'],
        chainOfInfluence: ['The family she rescued.', 'Hundreds of veterans she housed.', 'The rescue swimmers she trained.'],
        quotes: [{ quote: 'She said the mission never really ends. She just kept saving people.', attribution: 'A veteran she housed' }],
        keyDates: [{ label: 'Rescue anniversary', date: '10-09' }],
        candles: 96, coins: 22, flags: 34, stones: 18, flowers: 45, spotlightLevel: 2,
        tributes: [
          { displayName: 'A veteran she housed', relationship: 'Grateful', message: 'She gave me a bed and a reason to keep going. The mission never ended for her.' },
        ],
      },
    ];
    for (const h of heroes) {
      await prisma.honorHero.create({
        data: {
          createdBy, heroName: h.heroName, rank: h.rank, branch: h.branch, category: h.category,
          homeState: h.homeState, conflictOrEra: h.conflictOrEra,
          memoryLockPrimary: h.memoryLockPrimary, memoryLockSacrifice: h.memoryLockSacrifice,
          serviceSummary: h.serviceSummary, momentOfCourage: h.momentOfCourage, legacyImpact: h.legacyImpact,
          medals: h.medals, memoryPhrases: h.memoryPhrases, chainOfInfluence: h.chainOfInfluence,
          quotes: h.quotes as never, keyDates: h.keyDates as never,
          candles: h.candles, coins: h.coins, flags: h.flags, stones: h.stones, flowers: h.flowers,
          spotlightLevel: h.spotlightLevel,
          publishState: 'PUBLISHED', publishedAt: new Date(),
          tributes: { create: h.tributes.map((t) => ({ displayName: t.displayName, relationship: t.relationship, message: t.message, status: 'PUBLISHED' as const, publishedAt: new Date() })) },
        },
      });
    }
  }

  console.log('Story + rumor + community-report + civic-news + justice-vault + honor-vault seed complete.');
  console.log(`\nADMIN LOGIN → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}  (visit /admin)`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
