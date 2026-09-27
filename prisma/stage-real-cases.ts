/**
 * Stages REAL, publicly-documented cases into the Justice Vault and Civic News
 * as PENDING_REVIEW (never public until a moderator approves in /admin).
 *
 * Sourcing rules honored here:
 *  - Facts, charges, and verdicts are stated exactly as reported by credible
 *    outlets (major news, local news of record, and government/DOJ releases).
 *  - Acquittals are stated as acquittals. No one is called "guilty" unless a
 *    court convicted them. The platform judges ACTIONS, not identity.
 *  - We do NOT invent personal details about victims; only widely-reported facts.
 *  - Judgment is left to the public (Civic News voting, which requires a reason)
 *    and to neutral "open questions" — not asserted by the platform.
 *
 * Run:  DATABASE_URL=... npx tsx prisma/stage-real-cases.ts
 * Idempotent: skips any case/news that already exists (matched by name/title).
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@hearourvoices.local';
const actorKeyOf = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || null;

type Score = 'GOOD_MOVE' | 'BAD_MOVE' | 'NEEDS_INFO';
type SrcLabel = 'DOCUMENTED' | 'RECORDED' | 'MISSING' | 'UNVERIFIED';

interface VaultCase {
  victimName: string; victimAge?: number; location: string; dateOfIncident?: string; caseType: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'HISTORICAL'; justiceGapScore: number; spotlightLevel: number;
  memoryLockPrimary: string; memoryLockFailure: string; whatWasLost: string; anchorPhrases: string[];
  timeline: { date?: string; label: string; description: string; scoreTag?: Score; sourceUrl?: string }[];
  actions: { actorType: string; actorName?: string; description: string; scoreTag: Score; impactWeight?: number }[];
  questions: { questionText: string; targetAuthority: string; status: string }[];
  flags: { flag: string; reason: string }[];
  sources: { label: SrcLabel; title: string; url?: string }[];
}

interface News {
  scope: 'LOCAL' | 'STATE' | 'NATION'; authority: 'POLICE' | 'LAWMAKER' | 'JUDGE' | 'COUNCIL' | 'AGENCY' | 'COMMITTEE' | 'OVERSIGHT' | 'EXECUTIVE' | 'OTHER';
  title: string; actorType: string; jurisdiction: string;
  whatHappened: string; whyItMatters: string; pros: string[]; cons: string[]; alternatives: string[]; powerMap: string[];
  process: { recordedVote: boolean | null; publicNotice: boolean | null; amendmentPosted: boolean | null; meetingRecorded: boolean | null; publicComment: boolean | null; procedureLegal: boolean | null };
  impactLevel: number; sources: { label: SrcLabel; title: string; url?: string }[];
}

const CASES: VaultCase[] = [
  {
    victimName: 'Trayvon Martin', victimAge: 17, location: 'Sanford, Florida', dateOfIncident: '2012-02-26',
    caseType: 'Fatal shooting — shooter acquitted', status: 'HISTORICAL', justiceGapScore: 80, spotlightLevel: 3,
    memoryLockPrimary: 'On February 26, 2012, 17-year-old Trayvon Martin was fatally shot by neighborhood-watch volunteer George Zimmerman in Sanford, Florida.',
    memoryLockFailure: 'Zimmerman was not arrested for 44 days, and a jury acquitted him of second-degree murder and manslaughter in 2013 — leaving the family without a criminal conviction.',
    whatWasLost: 'A 17-year-old high-school junior, walking back to a family member’s home from a convenience store when he was killed.',
    anchorPhrases: ['17 years old. Walking home.', '44 days before an arrest.', 'Acquitted, July 2013.'],
    timeline: [
      { date: 'Feb 26, 2012', label: 'Incident', description: 'Zimmerman called police to report a "suspicious" person, followed Trayvon Martin, and fatally shot him during an ensuing confrontation. Zimmerman said he acted in self-defense.', sourceUrl: 'https://en.wikipedia.org/wiki/Killing_of_Trayvon_Martin' },
      { date: 'Feb–Apr 2012', label: 'Charging', scoreTag: 'NEEDS_INFO', description: 'Sanford police did not initially arrest Zimmerman, citing Florida’s self-defense law. National attention followed.' },
      { date: 'Apr 11, 2012', label: 'Charging', scoreTag: 'GOOD_MOVE', description: 'A special prosecutor charged Zimmerman with second-degree murder — 44 days after the shooting.', sourceUrl: 'https://en.wikipedia.org/wiki/Trial_of_George_Zimmerman' },
      { date: 'Jul 13, 2013', label: 'Verdict', description: 'A six-person jury acquitted Zimmerman of second-degree murder and manslaughter.', sourceUrl: 'https://www.npr.org/sections/thetwo-way/2013/07/13/201744637/jury-in-zimmerman-trial-enters-second-day-of-deliberation' },
    ],
    actions: [
      { actorType: 'Police (Sanford)', description: 'Did not arrest the shooter for 44 days, initially citing the state self-defense statute.', scoreTag: 'NEEDS_INFO', impactWeight: 8 },
      { actorType: 'Special prosecutor', description: 'Filed a second-degree murder charge after statewide review.', scoreTag: 'GOOD_MOVE', impactWeight: 6 },
      { actorType: 'Trial jury', description: 'Acquitted the defendant of all charges after a public trial.', scoreTag: 'NEEDS_INFO', impactWeight: 7 },
    ],
    questions: [
      { questionText: 'Why did the initial investigation not result in an arrest for 44 days?', targetAuthority: 'Sanford Police Department', status: 'Unanswered' },
      { questionText: 'What role did the "Stand Your Ground" framework play in the charging delay?', targetAuthority: 'State Attorney', status: 'Partially Answered' },
      { questionText: 'What policy changes followed for reporting and investigating self-defense claims?', targetAuthority: 'State of Florida', status: 'Unanswered' },
    ],
    flags: [
      { flag: 'Arrest delay vs. public record', reason: 'The 44-day gap between the shooting and any charge became a central, documented point of contention.' },
    ],
    sources: [
      { label: 'DOCUMENTED', title: 'Killing of Trayvon Martin — overview and records', url: 'https://en.wikipedia.org/wiki/Killing_of_Trayvon_Martin' },
      { label: 'DOCUMENTED', title: 'Trial of George Zimmerman — charges and verdict', url: 'https://en.wikipedia.org/wiki/Trial_of_George_Zimmerman' },
      { label: 'RECORDED', title: 'NPR — Jury acquits Zimmerman of all charges', url: 'https://www.npr.org/sections/thetwo-way/2013/07/13/201744637/jury-in-zimmerman-trial-enters-second-day-of-deliberation' },
    ],
  },
  {
    victimName: 'George Floyd', victimAge: 46, location: 'Minneapolis, Minnesota', dateOfIncident: '2020-05-25',
    caseType: 'Death in police custody — officer convicted', status: 'HISTORICAL', justiceGapScore: 34, spotlightLevel: 2,
    memoryLockPrimary: 'On May 25, 2020, George Floyd died after Minneapolis officer Derek Chauvin knelt on his neck for over nine minutes during an arrest, captured on a bystander’s cellphone video.',
    memoryLockFailure: 'It took a widely-shared civilian recording and mass public pressure before charges were filed — a reminder of how much accountability depended on one bystander pressing record.',
    whatWasLost: 'A 46-year-old father whose death, filmed by a teenage bystander, became a global catalyst for police-accountability protests.',
    anchorPhrases: ['More than 9 minutes on the ground.', 'A bystander’s video changed everything.', 'Convicted on all counts, April 2021.'],
    timeline: [
      { date: 'May 25, 2020', label: 'Incident', description: 'Floyd died during an arrest after Chauvin knelt on his neck; 17-year-old Darnella Frazier filmed the encounter on her phone.', sourceUrl: 'https://en.wikipedia.org/wiki/Trial_of_Derek_Chauvin' },
      { date: 'May 2020', label: 'Records release', scoreTag: 'GOOD_MOVE', description: 'The bystander video was made public, contradicting the initial police statement that described a "medical incident."' },
      { date: 'Apr 20, 2021', label: 'Verdict', scoreTag: 'GOOD_MOVE', description: 'A jury convicted Chauvin of second-degree unintentional murder, third-degree murder, and second-degree manslaughter.', sourceUrl: 'https://www.nbcnews.com/news/us-news/derek-chauvin-verdict-reached-trial-over-george-floyd-s-death-n1264565' },
      { date: 'Jun 25, 2021', label: 'Sentencing', description: 'Chauvin was sentenced to 22.5 years on the state charges; he later received a 21-year federal sentence for civil-rights violations.', sourceUrl: 'https://www.justice.gov/archives/opa/pr/former-minneapolis-police-officer-derek-chauvin-sentenced-more-20-years-prison-depriving' },
    ],
    actions: [
      { actorType: 'Bystander witness', actorName: 'Darnella Frazier', description: 'Filmed the arrest; the recording became central evidence and a public record of what happened.', scoreTag: 'GOOD_MOVE', impactWeight: 10 },
      { actorType: 'Police (initial statement)', description: 'The department’s first public account described a "medical incident" and did not mention the prolonged restraint shown on video.', scoreTag: 'BAD_MOVE', impactWeight: 7 },
      { actorType: 'Trial jury', description: 'Convicted the officer on all three counts after a public trial.', scoreTag: 'GOOD_MOVE', impactWeight: 8 },
    ],
    questions: [
      { questionText: 'Why did the initial police statement omit the prolonged neck restraint shown on the bystander video?', targetAuthority: 'Minneapolis Police Department', status: 'Partially Answered' },
      { questionText: 'What use-of-force policy changes were adopted after the conviction?', targetAuthority: 'City of Minneapolis', status: 'Partially Answered' },
    ],
    flags: [
      { flag: 'Official account vs. bystander video', reason: 'The department’s initial "medical incident" description differed sharply from the widely-seen civilian recording.' },
    ],
    sources: [
      { label: 'DOCUMENTED', title: 'Trial of Derek Chauvin — charges, verdict, sentence', url: 'https://en.wikipedia.org/wiki/Trial_of_Derek_Chauvin' },
      { label: 'RECORDED', title: 'NBC News — Chauvin convicted of murder and manslaughter', url: 'https://www.nbcnews.com/news/us-news/derek-chauvin-verdict-reached-trial-over-george-floyd-s-death-n1264565' },
      { label: 'DOCUMENTED', title: 'U.S. DOJ — Chauvin sentenced for federal civil-rights violations', url: 'https://www.justice.gov/archives/opa/pr/former-minneapolis-police-officer-derek-chauvin-sentenced-more-20-years-prison-depriving' },
    ],
  },
  {
    victimName: 'Tamir Rice', victimAge: 12, location: 'Cleveland, Ohio', dateOfIncident: '2014-11-22',
    caseType: 'Fatal police shooting — no charges', status: 'HISTORICAL', justiceGapScore: 82, spotlightLevel: 3,
    memoryLockPrimary: 'On November 22, 2014, 12-year-old Tamir Rice was fatally shot by Cleveland officer Timothy Loehmann within seconds of the patrol car arriving; Tamir was holding a toy pellet gun.',
    memoryLockFailure: 'A grand jury declined to indict the officers in 2015, and federal prosecutors declined charges in 2020 — no one was ever criminally charged for his death.',
    whatWasLost: 'A 12-year-old boy playing in a Cleveland park with a toy airsoft pellet gun.',
    anchorPhrases: ['12 years old. A toy gun.', 'Shot within seconds of arrival.', 'No one was ever charged.'],
    timeline: [
      { date: 'Nov 22, 2014', label: 'Incident', description: 'Officers responded to a 911 call about someone with a gun; the caller had said it was "probably fake." Tamir was shot almost immediately after the car arrived.', sourceUrl: 'https://en.wikipedia.org/wiki/Killing_of_Tamir_Rice' },
      { date: 'Nov 2014', label: 'Records release', scoreTag: 'NEEDS_INFO', description: 'Surveillance video from the park captured the shooting and was released publicly.' },
      { date: 'Dec 28, 2015', label: 'Charging', scoreTag: 'NEEDS_INFO', description: 'A county grand jury declined to indict the officers; the prosecutor said officers reasonably believed they were in danger.', sourceUrl: 'https://www.npr.org/2015/12/28/461304271/no-indictment-for-police-officers-in-tamir-rice-shooting' },
      { date: '2017', label: 'Misconduct finding', scoreTag: 'NEEDS_INFO', description: 'Officer Loehmann was fired — for omissions on his job application, not for the shooting itself.' },
      { date: '2020', label: 'Charging', description: 'The U.S. Department of Justice closed its investigation and declined to bring federal charges.', sourceUrl: 'https://en.wikipedia.org/wiki/Killing_of_Tamir_Rice' },
    ],
    actions: [
      { actorType: 'Dispatch / 911', description: 'The caller’s caveat that the gun was "probably fake" was reportedly not relayed to the responding officers.', scoreTag: 'BAD_MOVE', impactWeight: 8 },
      { actorType: 'Responding officers', description: 'Fired within roughly two seconds of arriving on scene.', scoreTag: 'NEEDS_INFO', impactWeight: 9 },
      { actorType: 'County prosecutor', description: 'Presented the case to a grand jury, which returned no indictment; critics questioned how the presentation was handled.', scoreTag: 'NEEDS_INFO', impactWeight: 7 },
    ],
    questions: [
      { questionText: 'Why was the 911 caller’s "probably fake" description not relayed to the responding officers?', targetAuthority: 'Cleveland dispatch / Police', status: 'Unanswered' },
      { questionText: 'Why did the response escalate to lethal force within seconds?', targetAuthority: 'Cleveland Police Department', status: 'Unanswered' },
      { questionText: 'What accountability, if any, followed for the officers involved?', targetAuthority: 'City of Cleveland', status: 'Partially Answered' },
    ],
    flags: [
      { flag: 'Dispatch information gap', reason: 'The caller’s statement that the weapon was likely fake was reportedly not passed to officers before they arrived.' },
    ],
    sources: [
      { label: 'DOCUMENTED', title: 'Killing of Tamir Rice — overview and outcomes', url: 'https://en.wikipedia.org/wiki/Killing_of_Tamir_Rice' },
      { label: 'RECORDED', title: 'NPR — No indictment for officers in Tamir Rice shooting', url: 'https://www.npr.org/2015/12/28/461304271/no-indictment-for-police-officers-in-tamir-rice-shooting' },
      { label: 'DOCUMENTED', title: 'HISTORY — 12-year-old Tamir Rice shot and killed by police', url: 'https://www.history.com/this-day-in-history/november-22/tamir-rice-killed-by-police' },
    ],
  },
  {
    victimName: 'Breonna Taylor', victimAge: 26, location: 'Louisville, Kentucky', dateOfIncident: '2020-03-13',
    caseType: 'Fatal police raid — no charges for her death', status: 'UNDER_REVIEW', justiceGapScore: 74, spotlightLevel: 3,
    memoryLockPrimary: 'On March 13, 2020, 26-year-old Breonna Taylor was fatally shot when Louisville officers forced entry into her apartment to serve a search warrant shortly after midnight.',
    memoryLockFailure: 'No officer was charged for her death; the only federal conviction (Brett Hankison) was for endangering neighbors by firing through a covered window, and questions about the warrant remain.',
    whatWasLost: 'A 26-year-old emergency-room technician, killed in her own home during a police raid.',
    anchorPhrases: ['Killed in her own home.', 'A warrant later alleged to be falsified.', 'No one charged for her death.'],
    timeline: [
      { date: 'Mar 13, 2020', label: 'Incident', description: 'Officers forced entry to serve a search warrant. Taylor’s boyfriend fired once, believing intruders had broken in; officers returned fire, killing Taylor. Investigators determined the fatal shot came from Officer Myles Cosgrove.', sourceUrl: 'https://www.cnn.com/2022/08/04/us/no-knock-raid-breonna-taylor-timeline' },
      { date: 'Sep 2020', label: 'Charging', scoreTag: 'NEEDS_INFO', description: 'A state grand jury brought no charges directly for Taylor’s death; one officer was charged with wanton endangerment for shots into a neighboring unit.' },
      { date: 'Aug 4, 2022', label: 'Charging', scoreTag: 'GOOD_MOVE', description: 'The U.S. DOJ charged four current and former officers, alleging a falsified warrant affidavit contributed to her death.', sourceUrl: 'https://www.justice.gov/archives/opa/pr/current-and-former-louisville-kentucky-police-officers-charged-federal-crimes-related-death' },
      { date: 'Jul 2025', label: 'Sentencing', description: 'Former officer Brett Hankison was sentenced to 33 months in federal prison for violating Taylor’s civil rights by firing through a covered window; his shots did not strike anyone.', sourceUrl: 'https://19thnews.org/2025/07/breonna-taylor-brett-hankison/' },
    ],
    actions: [
      { actorType: 'Police (warrant affidavit)', description: 'Federal prosecutors alleged the search-warrant affidavit contained false information; related charges were filed and are being litigated.', scoreTag: 'NEEDS_INFO', impactWeight: 9 },
      { actorType: 'U.S. Department of Justice', description: 'Brought federal civil-rights charges against multiple officers in 2022.', scoreTag: 'GOOD_MOVE', impactWeight: 7 },
      { actorType: 'City of Louisville', description: 'Reached a $12 million wrongful-death settlement with the family and agreed to policing reforms.', scoreTag: 'GOOD_MOVE', impactWeight: 5 },
    ],
    questions: [
      { questionText: 'How was a search warrant approved on an affidavit later alleged to be false?', targetAuthority: 'Louisville Metro Police / Courts', status: 'Partially Answered' },
      { questionText: 'Why was no one charged specifically for the shots that killed Breonna Taylor?', targetAuthority: 'Commonwealth’s Attorney / DOJ', status: 'Unanswered' },
      { questionText: 'Which promised policing reforms have actually been implemented?', targetAuthority: 'City of Louisville', status: 'Partially Answered' },
    ],
    flags: [
      { flag: 'Warrant integrity in dispute', reason: 'Federal charges allege the warrant affidavit was falsified; the underlying facts are the subject of ongoing litigation.' },
      { flag: 'Fatal shot vs. charges', reason: 'The officer identified as firing the fatal shot was not charged for her death, while another was convicted for endangering neighbors.' },
    ],
    sources: [
      { label: 'DOCUMENTED', title: 'U.S. DOJ — Officers charged in federal crimes related to Breonna Taylor’s death', url: 'https://www.justice.gov/archives/opa/pr/current-and-former-louisville-kentucky-police-officers-charged-federal-crimes-related-death' },
      { label: 'DOCUMENTED', title: 'CNN — Timeline of the raid and its aftermath', url: 'https://www.cnn.com/2022/08/04/us/no-knock-raid-breonna-taylor-timeline' },
      { label: 'DOCUMENTED', title: '19th News — Hankison sentenced to 33 months', url: 'https://19thnews.org/2025/07/breonna-taylor-brett-hankison/' },
    ],
  },
  {
    victimName: 'Jordan Hill', victimAge: 10, location: 'Liberty, Mississippi (Amite County)', dateOfIncident: '2025-04-06',
    caseType: 'Child killed by vehicle — driver acquitted', status: 'ACTIVE', justiceGapScore: 80, spotlightLevel: 3,
    memoryLockPrimary: 'In April 2025, 10-year-old Jordan Hill was struck and killed by a pickup truck while riding an ATV on the side of a road in Liberty, Mississippi.',
    memoryLockFailure: 'The driver, Cody Rollinson, was charged with aggravated DUI and felony leaving the scene, but an Amite County jury acquitted him on both counts in January 2026 after about an hour of deliberation.',
    whatWasLost: 'A 10-year-old boy, killed while riding an ATV near his home in Liberty.',
    anchorPhrases: ['10 years old. On an ATV.', 'Charged, then acquitted.', 'About an hour of deliberation.'],
    timeline: [
      { date: 'Apr 2025', label: 'Incident', description: 'Jordan Hill, riding an ATV in a grassy area beside a road, was struck and killed by a pickup truck.', sourceUrl: 'https://www.wlbt.com/2026/01/15/man-charged-deadly-atv-accident-that-killed-child-found-not-guilty/' },
      { date: '2025', label: 'Charging', scoreTag: 'GOOD_MOVE', description: 'The driver, Cody Rollinson, was charged with aggravated DUI and felony leaving the scene of an accident.' },
      { date: 'Jan 15, 2026', label: 'Verdict', description: 'An Amite County jury found Rollinson not guilty on both charges after roughly an hour of deliberation.', sourceUrl: 'https://www.natchezdemocrat.com/news/amite-county-jury-clears-cody-rollinson-in-atv-crash-that-killed-jordan-hill-10-2db139ee' },
      { date: 'Jan 2026', label: 'Aftermath', scoreTag: 'NEEDS_INFO', description: 'The family said they were "shocked" by the verdict and are seeking accountability; supporters raised questions about the investigation and the trial.', sourceUrl: 'https://www.wlbt.com/2026/01/16/shocked-family-10-year-old-atv-accident-victim-speaks-out-recent-verdict/' },
    ],
    actions: [
      { actorType: 'Prosecutors', description: 'Charged the driver with aggravated DUI and felony leaving the scene of an accident.', scoreTag: 'GOOD_MOVE', impactWeight: 6 },
      { actorType: 'Trial jury', description: 'Acquitted the driver on both counts after about an hour of deliberation.', scoreTag: 'NEEDS_INFO', impactWeight: 8 },
      { actorType: 'Investigators', description: 'A family-circulated petition claims no skid marks were found at the scene, raising questions about whether the driver braked. This claim is not independently confirmed.', scoreTag: 'NEEDS_INFO', impactWeight: 6 },
    ],
    questions: [
      { questionText: 'Were skid marks or braking evidence documented at the scene?', targetAuthority: 'Amite County investigators', status: 'Unanswered' },
      { questionText: 'Were jurors properly screened for prior knowledge of the case, as relatives alleged?', targetAuthority: 'Amite County court', status: 'Unanswered' },
      { questionText: 'Will law-enforcement records from the investigation be released to the family?', targetAuthority: 'Amite County / Mississippi', status: 'Unanswered' },
    ],
    flags: [
      { flag: 'Scene evidence questioned', reason: 'Supporters allege no skid marks were found, which they say conflicts with the account of the collision. This allegation is unverified.' },
      { flag: 'Juror screening alleged', reason: 'Relatives alleged some jurors had prior knowledge of the case and should have been disqualified; this has not been independently confirmed.' },
    ],
    sources: [
      { label: 'DOCUMENTED', title: 'Natchez Democrat — Amite County jury clears Cody Rollinson in ATV crash that killed Jordan Hill, 10', url: 'https://www.natchezdemocrat.com/news/amite-county-jury-clears-cody-rollinson-in-atv-crash-that-killed-jordan-hill-10-2db139ee' },
      { label: 'RECORDED', title: 'WLBT — Man charged in deadly ATV accident found not guilty', url: 'https://www.wlbt.com/2026/01/15/man-charged-deadly-atv-accident-that-killed-child-found-not-guilty/' },
      { label: 'RECORDED', title: 'WLBT — Family of 10-year-old speaks out on the verdict', url: 'https://www.wlbt.com/2026/01/16/shocked-family-10-year-old-atv-accident-victim-speaks-out-recent-verdict/' },
      { label: 'UNVERIFIED', title: 'Change.org petition circulated by a family friend (allegations re: skid marks, jurors)', url: undefined },
    ],
  },
];

const NEWS: News[] = [
  {
    scope: 'STATE', authority: 'POLICE', title: 'A 44-day gap before any arrest in the Trayvon Martin shooting (2012)',
    actorType: 'Police (Sanford, FL)', jurisdiction: 'Sanford, Florida',
    whatHappened: 'After George Zimmerman fatally shot 17-year-old Trayvon Martin on Feb 26, 2012, Sanford police did not arrest him for 44 days, initially citing Florida’s self-defense law. A special prosecutor later charged him with second-degree murder; a jury acquitted him in 2013.',
    whyItMatters: 'How quickly authorities investigate and charge in a fatal shooting — and how self-defense laws are applied — shapes public trust in equal treatment under the law.',
    pros: ['A special prosecutor did ultimately file a charge and bring the case to a public trial.'],
    cons: ['The 44-day delay before any arrest drew national criticism.', 'The application of "Stand Your Ground" to the initial non-arrest was widely questioned.'],
    alternatives: ['Refer the charging decision to an independent prosecutor immediately.', 'Publicly explain the legal basis for any decision not to arrest.'],
    powerMap: ['Local police — controlled the initial arrest decision.', 'State Attorney — could have taken the case sooner.', 'State legislature — writes the self-defense statutes applied here.'],
    process: { recordedVote: null, publicNotice: null, amendmentPosted: null, meetingRecorded: null, publicComment: null, procedureLegal: true },
    impactLevel: 4,
    sources: [
      { label: 'DOCUMENTED', title: 'Trial of George Zimmerman — charges and verdict', url: 'https://en.wikipedia.org/wiki/Trial_of_George_Zimmerman' },
      { label: 'RECORDED', title: 'NPR — Jury acquits Zimmerman of all charges', url: 'https://www.npr.org/sections/thetwo-way/2013/07/13/201744637/jury-in-zimmerman-trial-enters-second-day-of-deliberation' },
    ],
  },
  {
    scope: 'STATE', authority: 'JUDGE', title: 'Jury convicts officer on all counts in George Floyd’s death (2021)',
    actorType: 'Trial court / jury', jurisdiction: 'Hennepin County, Minnesota',
    whatHappened: 'On April 20, 2021, a Minnesota jury convicted former officer Derek Chauvin of second-degree unintentional murder, third-degree murder, and second-degree manslaughter in the death of George Floyd. He was sentenced to 22.5 years, and later to 21 years on federal civil-rights charges.',
    whyItMatters: 'A rare conviction of a police officer — reached in large part because of a bystander’s video — is a reference point for what accountability can look like and what evidence made it possible.',
    pros: ['The case went to a full public trial and resulted in convictions on all counts.', 'A civilian recording preserved key evidence.'],
    cons: ['The initial police statement described only a "medical incident," omitting the prolonged restraint later seen on video.'],
    alternatives: ['Require body-worn-camera footage to be preserved and released promptly.', 'Ensure initial public statements match available evidence.'],
    powerMap: ['Prosecutors — brought and tried the case.', 'The jury — returned the verdict.', 'Bystander witness — preserved the recording that became central evidence.'],
    process: { recordedVote: null, publicNotice: null, amendmentPosted: null, meetingRecorded: true, publicComment: null, procedureLegal: true },
    impactLevel: 5,
    sources: [
      { label: 'RECORDED', title: 'NBC News — Chauvin convicted of murder and manslaughter', url: 'https://www.nbcnews.com/news/us-news/derek-chauvin-verdict-reached-trial-over-george-floyd-s-death-n1264565' },
      { label: 'DOCUMENTED', title: 'U.S. DOJ — Chauvin sentenced for federal civil-rights violations', url: 'https://www.justice.gov/archives/opa/pr/former-minneapolis-police-officer-derek-chauvin-sentenced-more-20-years-prison-depriving' },
    ],
  },
  {
    scope: 'STATE', authority: 'JUDGE', title: 'Grand jury declines to indict officers in Tamir Rice’s death (2015)',
    actorType: 'County prosecutor / grand jury', jurisdiction: 'Cuyahoga County, Ohio',
    whatHappened: 'On Dec 28, 2015, a Cuyahoga County grand jury declined to indict the officers involved in the fatal shooting of 12-year-old Tamir Rice. The prosecutor said officers reasonably believed they faced danger. Federal prosecutors also declined charges in 2020.',
    whyItMatters: 'Grand-jury processes are largely private, so how a prosecutor presents a case — and what information reaches responding officers — directly affects whether anyone is held accountable.',
    pros: ['The park surveillance video was released to the public.'],
    cons: ['The 911 caller’s statement that the gun was "probably fake" was reportedly not relayed to officers.', 'Critics questioned how the prosecutor presented the case to the grand jury.'],
    alternatives: ['Use a special or independent prosecutor for police use-of-force cases.', 'Publicly document what dispatch relayed to responding officers.'],
    powerMap: ['County prosecutor — controlled the grand-jury presentation.', 'Police dispatch — decided what information to relay.', 'U.S. DOJ — could have pursued federal charges.'],
    process: { recordedVote: null, publicNotice: null, amendmentPosted: null, meetingRecorded: true, publicComment: null, procedureLegal: true },
    impactLevel: 4,
    sources: [
      { label: 'RECORDED', title: 'NPR — No indictment for officers in Tamir Rice shooting', url: 'https://www.npr.org/2015/12/28/461304271/no-indictment-for-police-officers-in-tamir-rice-shooting' },
      { label: 'DOCUMENTED', title: 'Killing of Tamir Rice — overview and outcomes', url: 'https://en.wikipedia.org/wiki/Killing_of_Tamir_Rice' },
    ],
  },
  {
    scope: 'STATE', authority: 'POLICE', title: 'A disputed search warrant preceded Breonna Taylor’s death (2020)',
    actorType: 'Police / courts', jurisdiction: 'Louisville, Kentucky',
    whatHappened: 'Breonna Taylor was killed on March 13, 2020 during a forced-entry search-warrant raid. No officer was charged for her death; in 2022 the DOJ charged several officers, alleging the warrant affidavit was falsified. In 2025, one former officer was sentenced to 33 months for endangering neighbors.',
    whyItMatters: 'The integrity of a search-warrant affidavit — and how "no-knock" or forced entries are authorized — determines whether a raid is lawful and who bears responsibility when someone dies.',
    pros: ['A federal investigation resulted in charges against multiple officers.', 'The city reached a settlement and agreed to reforms.'],
    cons: ['No one was charged specifically for the shots that killed Taylor.', 'Federal prosecutors alleged the warrant affidavit contained false information.'],
    alternatives: ['Require independent review before approving no-knock or forced-entry warrants.', 'Mandate that warrant affidavits be documented and auditable.'],
    powerMap: ['Officers who prepared the affidavit — sought the warrant.', 'The judge — approved the warrant.', 'U.S. DOJ — brought federal charges.', 'City of Louisville — set raid and warrant policy.'],
    process: { recordedVote: null, publicNotice: null, amendmentPosted: null, meetingRecorded: null, publicComment: null, procedureLegal: null },
    impactLevel: 5,
    sources: [
      { label: 'DOCUMENTED', title: 'U.S. DOJ — Officers charged in federal crimes related to Breonna Taylor’s death', url: 'https://www.justice.gov/archives/opa/pr/current-and-former-louisville-kentucky-police-officers-charged-federal-crimes-related-death' },
      { label: 'DOCUMENTED', title: 'CNN — Timeline of the raid and its aftermath', url: 'https://www.cnn.com/2022/08/04/us/no-knock-raid-breonna-taylor-timeline' },
    ],
  },
  {
    scope: 'STATE', authority: 'JUDGE', title: 'Driver acquitted in death of 10-year-old Jordan Hill (2026)',
    actorType: 'Trial court / jury', jurisdiction: 'Amite County, Mississippi',
    whatHappened: 'Cody Rollinson, charged with aggravated DUI and felony leaving the scene after 10-year-old Jordan Hill was struck and killed while riding an ATV in April 2025, was found not guilty on both counts by an Amite County jury on Jan 15, 2026 after about an hour of deliberation.',
    whyItMatters: 'When a child dies and a jury acquits after a short deliberation, families and the public look to whether the investigation was thorough and the trial was fair — and whether records will be released.',
    pros: ['Prosecutors did bring felony charges and take the case to trial.'],
    cons: ['Supporters allege no skid marks were documented at the scene (unverified).', 'Relatives alleged some jurors had prior knowledge of the case (unconfirmed).'],
    alternatives: ['Release the full crash-investigation file to the family.', 'Document juror screening for high-profile local cases.'],
    powerMap: ['Prosecutors — charged and tried the case.', 'The jury — returned the verdict.', 'Amite County / state — hold the investigative records the family is requesting.'],
    process: { recordedVote: null, publicNotice: null, amendmentPosted: null, meetingRecorded: null, publicComment: null, procedureLegal: true },
    impactLevel: 4,
    sources: [
      { label: 'DOCUMENTED', title: 'Natchez Democrat — Amite County jury clears Cody Rollinson', url: 'https://www.natchezdemocrat.com/news/amite-county-jury-clears-cody-rollinson-in-atv-crash-that-killed-jordan-hill-10-2db139ee' },
      { label: 'RECORDED', title: 'WLBT — Family speaks out on the verdict', url: 'https://www.wlbt.com/2026/01/16/shocked-family-10-year-old-atv-accident-victim-speaks-out-recent-verdict/' },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  const createdBy = admin?.id ?? null;

  console.log('Staging Justice Vault cases (PENDING_REVIEW)…');
  for (const c of CASES) {
    const exists = await prisma.justiceCase.findFirst({ where: { victimName: c.victimName, caseType: c.caseType } });
    if (exists) { console.log(`  · skip (exists): ${c.victimName}`); continue; }
    await prisma.justiceCase.create({
      data: {
        createdBy, victimName: c.victimName, victimAge: c.victimAge ?? null, location: c.location,
        dateOfIncident: c.dateOfIncident ? new Date(c.dateOfIncident) : null, caseType: c.caseType,
        memoryLockPrimary: c.memoryLockPrimary, memoryLockFailure: c.memoryLockFailure,
        status: c.status, justiceGapScore: c.justiceGapScore, spotlightLevel: c.spotlightLevel,
        whatWasLost: c.whatWasLost, personalityWords: [], anchorPhrases: c.anchorPhrases,
        timeline: c.timeline as never, actions: c.actions as never, questions: c.questions as never,
        flags: c.flags as never, sources: c.sources as never,
        publishState: 'PENDING_REVIEW', publishedAt: null,
      },
    });
    console.log(`  ✓ staged case: ${c.victimName}`);
  }

  console.log('Staging Civic News items (PENDING_REVIEW)…');
  for (const n of NEWS) {
    const exists = await prisma.civicNews.findFirst({ where: { title: n.title } });
    if (exists) { console.log(`  · skip (exists): ${n.title}`); continue; }
    await prisma.civicNews.create({
      data: {
        scope: n.scope, authority: n.authority, title: n.title, actorType: n.actorType,
        actorKey: actorKeyOf(n.actorType), jurisdiction: n.jurisdiction,
        whatHappened: n.whatHappened, whyItMatters: n.whyItMatters, pros: n.pros, cons: n.cons,
        alternatives: n.alternatives, powerMap: n.powerMap,
        recordedVote: n.process.recordedVote, publicNotice: n.process.publicNotice,
        amendmentPosted: n.process.amendmentPosted, meetingRecorded: n.process.meetingRecorded,
        publicComment: n.process.publicComment, procedureLegal: n.process.procedureLegal,
        impactLevel: n.impactLevel, createdBy,
        status: 'PENDING_REVIEW', publishedAt: null,
        sources: { create: n.sources.map((s) => ({ label: s.label, title: s.title, url: s.url ?? null })) },
      },
    });
    console.log(`  ✓ staged news: ${n.title}`);
  }

  const heldCases = await prisma.justiceCase.count({ where: { publishState: 'PENDING_REVIEW' } });
  const heldNews = await prisma.civicNews.count({ where: { status: 'PENDING_REVIEW' } });
  console.log(`\nDone. Held for review — Vault cases: ${heldCases}, Civic news: ${heldNews}. Review at /admin → Review queue.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
