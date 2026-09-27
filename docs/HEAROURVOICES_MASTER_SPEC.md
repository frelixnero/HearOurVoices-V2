# HearOURVOICES
## Master Product, Business, Governance, Data, and Developer Specification
### Version 1.0 — Source of Truth for Claude Development

---

# 1. DOCUMENT PURPOSE

This document is the master source of truth for building **HearOURVOICES**.

Claude, developers, designers, contractors, attorneys, researchers, and future team members should use this document to understand:

- What HearOURVOICES is
- What problem it solves
- Who it serves
- What features belong in the platform
- What features do not belong in the platform
- How evidence, claims, public records, government performance, court outcomes, investigations, petitions, and civic funding should work
- How users, officials, moderators, researchers, and administrators interact with the system
- How the database should be structured
- How credibility, moderation, anti-bot protection, and public audit trails should work
- What should be included in the MVP
- What should be added after the MVP
- How the app should reduce legal, privacy, security, and reputational risk

This document replaces fragmented notes, earlier drafts, and incomplete feature descriptions.

Do not combine HearOURVOICES with Action Ladder, billiards, sports rankings, gambling, fantasy sports, tournaments, player markets, or any unrelated project.

---

# 2. PRODUCT IDENTITY

## Product Name

**HearOURVOICES**

Recommended styling:

- `HearOURVOICES`
- The word `OUR` may be emphasized visually.
- The brand should communicate that ordinary citizens are being heard while facts and evidence remain central.

## Core Mission

Build the most trusted citizen-accountability and government-transparency platform in America.

HearOURVOICES helps ordinary people:

- Understand what is happening in their community
- Share concerns responsibly
- Upload and organize evidence
- Track government performance
- Follow court cases and legal outcomes
- Compare promises with actual conduct
- Request public records
- Identify documented patterns of waste, misconduct, unfair treatment, corruption, or institutional failure
- Fund lawful transparency efforts
- Organize lawful civic action
- Hold officials and institutions accountable using verifiable facts

## One-Sentence Description

HearOURVOICES is a civic accountability platform that turns public records, verified evidence, government actions, court outcomes, community concerns, and citizen participation into understandable public timelines, scorecards, investigations, and lawful action tools.

## Simple Fifth-Grade Explanation

HearOURVOICES is an app that helps people understand what their government is doing.

People can use it to:

- See what elected leaders promised
- See how those leaders voted
- Read important public records
- Follow court cases
- Upload proof when something goes wrong
- Ask the government for records
- Support investigations
- Sign petitions
- See whether a claim is supported by evidence

The app is not supposed to spread rumors. It is supposed to help people find facts, organize proof, and make government actions easier to understand.

---

# 3. WHAT THE PRODUCT IS NOT

HearOURVOICES is not:

- Action Ladder
- A billiards platform
- A gaming platform
- A gambling platform
- A sports-ranking platform
- A fantasy market
- A popularity contest
- A general-purpose social-media clone
- A rumor board
- An anonymous accusation board
- A political party platform
- A tool for harassment, threats, retaliation, stalking, doxxing, or mob pressure
- A replacement for a lawyer, court, election authority, law-enforcement agency, or official public-record source
- A system that declares guilt without reliable evidence and appropriate context

The platform may include discussion and public participation, but its primary structure must be based on records, claims, evidence, timelines, actions, outcomes, and audit trails rather than likes, outrage, or virality.

---

# 4. DESIGN PRINCIPLES

Every feature should support these principles.

## 4.1 Evidence Over Rumors

Claims should be linked to evidence.

The platform should clearly distinguish:

- Verified facts
- Official statements
- Public allegations
- User opinions
- Unverified claims
- Disputed claims
- False or misleading claims
- Missing information

## 4.2 Transparency Over Secrecy

Users should be able to understand:

- Why a score changed
- Why content was moderated
- What evidence supports a claim
- Who edited a public record entry
- What source was used
- When information was added
- Whether an official responded
- Whether a correction was made

## 4.3 Accountability Over Popularity

Officials should not receive high or low ratings merely because users like or dislike them.

Ratings must be connected to measurable categories, evidence, source quality, conduct, responsiveness, promises, votes, financial information, court outcomes, ethics findings, public records, and verified community impact.

## 4.4 Free Expression With Safety

The app should protect lawful criticism and civic participation while prohibiting:

- Threats
- Harassment
- Doxxing
- Targeted abuse
- False factual accusations presented as proven
- Exposure of protected personal information
- Intimidation
- Calls for violence
- Retaliation against witnesses or whistleblowers

## 4.5 Data-Driven Analysis

The platform should help users identify trends and patterns without claiming more than the data proves.

## 4.6 Public Audit Trails

Important changes should be recorded in append-only audit logs.

## 4.7 Explainability

Users should see how the platform reached a conclusion, score, status, or confidence label.

## 4.8 Local First

The app should make city, county, school-district, prosecutor, court, police, sheriff, and local-government information easier to understand before expanding into national complexity.

## 4.9 Neutral Infrastructure

The platform may expose misconduct by any party, ideology, agency, official, court, prosecutor, or institution. Rules should be applied consistently.

---

# 5. CORE USER PROMISE

When a user opens HearOURVOICES, the app should answer five questions quickly:

1. What is happening in my community?
2. Who is responsible?
3. What evidence exists?
4. What is still unknown or disputed?
5. What lawful action can citizens take next?

---

# 6. PRIMARY USER TYPES

## 6.1 Visitor

Can:

- Browse public profiles
- View scorecards
- Read public timelines
- Search agencies, officials, courts, and cases
- View published evidence
- Read public-record request statuses
- View petitions and CivicFund campaigns

Cannot:

- Publish claims
- Upload public evidence
- Sign petitions
- Comment
- Vote on credibility
- Start campaigns

## 6.2 Registered Citizen

Can:

- Follow jurisdictions and issues
- Save records
- Subscribe to alerts
- Draft concerns
- Submit corrections
- Participate in limited community discussion

## 6.3 Verified Citizen

A user who completes an approved identity or residency verification process.

Can:

- Submit public concerns
- Upload evidence
- Sign petitions
- Endorse public-record requests
- Participate in structured investigations
- Create lawful civic-action proposals
- Contribute to reputation signals
- Apply to become a community researcher

Public display may use a real name, partial name, or approved public alias, but the platform should retain verified internal identity where legally appropriate.

## 6.4 Confidential Tipster

Can privately submit information to a restricted review queue.

Important rule:

- A confidential or anonymous tip is not automatically published.
- It must be reviewed, corroborated, redacted, and converted into a properly sourced claim before appearing publicly.
- Anonymous public accusations are not allowed.

## 6.5 Community Researcher

A verified user with additional training or approval.

Can:

- Build timelines
- Connect sources
- Draft claim summaries
- Review public records
- Tag entities
- Propose scorecard updates
- Participate in investigation workspaces

## 6.6 Journalist or Civil-Society Researcher

Can:

- Use advanced search
- Export allowed datasets
- Follow investigations
- Submit source corrections
- Create public research collections
- Request API access under appropriate terms

No organization names should be used in marketing or product examples without permission.

## 6.7 Elected Official or Public Employee

Can claim an official profile after verification.

Can:

- Add official responses
- Correct factual errors
- Upload public statements
- Link official records
- Respond to scorecard categories
- Disclose conflicts or context
- Appeal inaccurate content

Officials cannot delete criticism or evidence merely because they disagree with it.

## 6.8 Judge, Prosecutor, Court, or Agency Representative

Can:

- Verify an institutional profile
- Submit corrections
- Add official documents
- Clarify case status
- Respond to methodology
- Contest incorrect data

Special care is required because judges may be limited in how they publicly discuss cases.

## 6.9 Campaign Organizer

Can:

- Create petitions
- Create public-record campaigns
- Create lawful civic-action plans
- Manage CivicFund campaigns
- Publish updates
- Document spending

## 6.10 Moderator

Can:

- Review reports
- Apply content rules
- Redact prohibited information
- Restrict accounts
- Escalate legal or safety matters
- Publish moderation reasons

## 6.11 Legal and Policy Reviewer

Can:

- Review defamation, privacy, sealed-record, copyright, election, campaign-finance, crowdfunding, and legal-risk issues
- Apply legal holds
- Approve or reject sensitive publication
- Document legal basis internally

## 6.12 Administrator

Can:

- Manage users, permissions, jurisdictions, source integrations, security, and platform settings
- Review audit logs
- Manage data imports
- Configure scoring methods
- Publish methodology versions

Administrative actions must be logged.

---

# 7. PLATFORM INFORMATION ARCHITECTURE

Recommended primary navigation:

1. Home
2. My Community
3. Officials
4. Courts and Justice
5. Cases
6. Agencies
7. Claims and Evidence
8. Public Records
9. Investigations
10. CivicFund
11. Petitions and Action
12. Elections and Vote Records
13. Search
14. Alerts
15. Profile

Administrator navigation:

- Moderation
- Verification
- Legal Review
- Data Imports
- Methodologies
- Audit Logs
- Security
- Campaign Review
- Financial Reconciliation
- System Health

---

# 8. HOME AND “MY COMMUNITY” EXPERIENCE

The home experience should make local government understandable.

## 8.1 Location Setup

Users may choose:

- Home address privately
- ZIP code
- City
- County
- School district
- State legislative district
- Congressional district

The system should determine relevant jurisdictions without publicly exposing the user’s precise address.

## 8.2 Community Brief

The app should generate a plain-language local brief containing:

- Important city or county meetings
- Recent votes
- New ordinances
- Budget changes
- Public-safety updates
- Court and prosecutor developments
- High-interest public-record releases
- Active investigations
- Open petitions
- CivicFund campaigns
- Upcoming elections
- Recent scorecard changes
- Corrections or disputed claims

## 8.3 “Why This Matters” Cards

Every important item should include:

- What happened
- Who made the decision
- Who may be affected
- What evidence supports the summary
- What is still unknown
- What citizens can do next

## 8.4 Community Map

Future feature:

- Agencies
- Government buildings
- Court locations
- Reported issues
- Public projects
- Spending projects
- District boundaries
- Meeting locations

Sensitive locations and private residences must not be displayed.

---

# 9. OFFICIAL AND GOVERNMENT PROFILE SYSTEM

## 9.1 Official Profile

Each elected or appointed official profile should include:

- Full name
- Position
- Jurisdiction
- Term dates
- Party or nonpartisan status where applicable
- Official contact information
- Government website
- Biography from an official source
- Campaign promises
- Voting record
- Sponsored measures
- Attendance
- Public statements
- Donors and financial disclosures where legally available
- Conflicts of interest
- Ethics findings
- Lawsuits or misconduct findings, with status and context
- Public complaints, separated from verified findings
- Responsiveness to public-record requests
- Community impact metrics
- Official responses
- Corrections
- Scorecard
- Full source list
- Change history

## 9.2 Agency Profile

Each agency profile should include:

- Name
- Jurisdiction
- Mission
- Leadership
- Budget
- Spending
- Contracts
- Performance measures
- Audits
- Complaints
- Enforcement actions
- Lawsuits
- Public-record responsiveness
- Policies
- Meetings
- Scorecard
- Open issues
- Official response section
- Source list
- Change history

## 9.3 Promise Tracker

Each promise should contain:

- Promise text
- Date made
- Original source
- Category
- Jurisdiction
- Deadline if stated
- Status
- Supporting actions
- Conflicting actions
- Outcome
- Confidence level
- Last review date

Recommended statuses:

- Not Started
- In Progress
- Partially Completed
- Completed
- Blocked
- Reversed
- Broken
- Cannot Be Verified
- No Longer Applicable

A promise status should never be changed without a reason and supporting source.

## 9.4 Vote and Decision Tracker

Track:

- Measure title
- Plain-language summary
- Official text
- Date
- Government body
- Individual votes
- Abstentions
- Absences
- Financial impact
- Community impact
- Related promises
- Related donors or conflicts where properly sourced
- Meeting video or transcript
- Supporting and opposing arguments
- Outcome
- Implementation status

---

# 10. GOVERNMENT SCORECARDS

## 10.1 Purpose

Scorecards help citizens understand documented government performance.

They must not be popularity ratings.

## 10.2 Example Scorecard Categories

For elected officials:

- Promise Delivery
- Attendance and Participation
- Transparency
- Ethics and Conflicts
- Public Responsiveness
- Fiscal Stewardship
- Constituent Service
- Policy Outcomes
- Accuracy of Public Statements
- Public-Records Compliance

For agencies:

- Service Delivery
- Budget Performance
- Audit Results
- Complaint Resolution
- Transparency
- Records Compliance
- Civil-Rights Outcomes
- Procurement Integrity
- Timeliness
- Public Communication

For judges:

- Timeliness
- Reversal or Remand Patterns
- Sentencing Consistency
- Pretrial Detention Patterns
- Recusal and Conflict Disclosure
- Courtroom Access
- Procedural Fairness Indicators
- Case Backlog
- Published Reasoning
- Disparity Signals

For prosecutors:

- Charging Patterns
- Dismissal Rates
- Plea Practices
- Discovery Compliance Findings
- Conviction Integrity
- Diversion Access
- Sentencing Recommendations
- Racial, economic, geographic, or demographic disparity signals where lawful and methodologically valid
- Wrongful-conviction or misconduct findings
- Public Transparency

## 10.3 Score Methodology Rules

Every score must show:

- Category weight
- Underlying metrics
- Data period
- Source count
- Source quality
- Missing-data warning
- Calculation version
- Confidence level
- Last update
- Appeals or disputes

## 10.4 Recommended Score Structure

Use a 0–100 score only when enough data exists.

Each category should also show:

- Good
- Mixed
- Concerning
- Insufficient Data

A numerical score should not be displayed when the evidence is too limited.

## 10.5 Example Calculation

Each metric may be calculated as:

`metric_score × metric_weight × evidence_confidence`

Category score:

`sum(weighted metric scores) / sum(active weights)`

Overall score:

`sum(category score × category weight) / sum(active category weights)`

Do not treat missing data as zero.

## 10.6 Public Methodology

The methodology must be publicly available and versioned.

Changes should not silently rewrite historical scores. Historical scores should remain connected to the methodology used at the time.

---

# 11. JUDGE, PROSECUTOR, COURT, AND LEGAL OUTCOME DASHBOARDS

## 11.1 Judge Dashboard

Include:

- Court
- Jurisdiction
- Appointment or election history
- Term
- Education and official biography
- Financial disclosures where public
- Recusal information
- Case volume
- Case duration
- Disposition patterns
- Sentencing patterns
- Bail or detention patterns
- Reversal and remand history
- Published opinions
- Complaints and discipline, clearly separated by status
- Court-access issues
- Disparity analysis
- Methodology notes
- Official response
- Sources

## 11.2 Prosecutor Dashboard

Include:

- Office
- Jurisdiction
- Term
- Charging policies
- Public priorities
- Case volume
- Declination rates where available
- Dismissal rates
- Plea rates
- Trial outcomes
- Diversion
- Pretrial detention requests
- Sentencing recommendations
- Conviction-integrity work
- Discovery or misconduct findings
- Public spending
- Civil-rights disparity analysis
- Official response
- Sources

## 11.3 Court Dashboard

Include:

- Jurisdiction
- Judges
- Court calendar
- Backlog
- Average time to disposition
- Accessibility
- Fee structure
- Public-record availability
- Remote-access options
- Reversal patterns
- Complaint process
- Language access
- Disability access
- Data completeness
- Sources

## 11.4 Legal Outcome Analytics

Analytics must distinguish correlation from causation.

Possible analysis:

- Outcome by charge type
- Outcome by judge
- Outcome by prosecutor
- Outcome by defense type
- Time to resolution
- Bail status and case outcome
- Plea versus trial
- Sentence length
- Diversion eligibility and participation
- Geographic differences
- Demographic differences where data is lawful, sufficiently complete, and privacy-protected
- Repeat institutional patterns

Every chart should include:

- Data source
- Date range
- Sample size
- Missing-data warning
- Methodology
- Privacy thresholds
- Statistical caution

Do not display small-group breakdowns that could identify protected individuals.

---

# 12. CASE TIMELINES

## 12.1 Purpose

A case timeline should turn complex legal events into an understandable sequence.

## 12.2 Timeline Events

Examples:

- Incident
- Arrest
- Booking
- Charging
- Initial appearance
- Bail decision
- Discovery
- Motions
- Hearings
- Plea
- Trial
- Verdict
- Sentencing
- Appeal
- Remand
- Dismissal
- Expungement or sealing
- Civil settlement
- Misconduct finding
- Records release

## 12.3 Each Timeline Event Should Include

- Date and time
- Event type
- Plain-language summary
- Official description
- Source
- Related documents
- Related parties
- Verification status
- Dispute status
- Redaction status
- Added by
- Reviewed by
- Change history

## 12.4 Case Visibility Rules

Cases may be:

- Public
- Partially public
- Restricted
- Sealed
- Expunged
- Archived
- Removed from public display

The platform must respect lawful sealing, expungement, juvenile-protection, victim-protection, and privacy rules.

---

# 13. CLAIMS VS. EVIDENCE SYSTEM

This is one of the most important parts of HearOURVOICES.

## 13.1 Claim Object

Every factual claim should be a structured object containing:

- Claim text
- Claim type
- Person or institution making the claim
- Target entity
- Date
- Location
- Topic
- Related event
- Supporting evidence
- Contradicting evidence
- Source quality
- Review status
- Confidence status
- Official response
- Correction history

## 13.2 Claim Types

- Observation
- Allegation
- Official Statement
- Statistical Claim
- Legal Claim
- Financial Claim
- Promise
- Prediction
- Opinion
- Conclusion
- Correction

## 13.3 Confidence Labels

Recommended labels:

- Verified
- Strongly Supported
- Partially Supported
- Unclear
- Disputed
- Unsupported
- Misleading
- False
- Outdated
- Cannot Be Verified

The platform should not mark something false merely because an official denies it.

## 13.4 Evidence Relationship

Evidence may:

- Support
- Partially Support
- Contradict
- Provide Context
- Be Irrelevant
- Be Inconclusive

## 13.5 Claim Review Workflow

1. Claim submitted
2. Automated safety and duplicate checks
3. Evidence requirement checked
4. Identity and conflict checks
5. Research review
6. Legal/privacy review if needed
7. Official response opportunity when appropriate
8. Publish with status
9. Allow corrections and appeals
10. Maintain full history

## 13.6 Public Presentation

A claim page should show:

- The claim
- Current status
- What supports it
- What contradicts it
- What remains unknown
- Who reviewed it
- Methodology
- Official response
- Change history

---

# 14. EVIDENCE VAULT

## 14.1 Purpose

The Evidence Vault stores, protects, organizes, verifies, and presents supporting materials.

## 14.2 Supported Evidence Types

- PDF
- Image
- Audio
- Video
- Email export
- Text message export
- Public-record document
- Court filing
- Meeting transcript
- Contract
- Invoice
- Spreadsheet
- Photograph
- Government webpage capture
- Data export
- Witness statement
- Affidavit
- News report
- Academic study
- Official statement

## 14.3 Evidence Metadata

Each item should store:

- File name
- File type
- File size
- Upload date
- Original creation date if available
- Source
- Custodian
- Jurisdiction
- Description
- Related people
- Related agencies
- Related cases
- Related claims
- Public or restricted status
- Redaction status
- Verification status
- Cryptographic hash
- Original file hash
- Processed file hash
- Chain-of-custody events
- OCR text if created
- Transcript if created
- AI summary
- Human review status
- Legal hold status

## 14.4 Original Preservation

The original uploaded file should be preserved separately from:

- Redacted copies
- Compressed copies
- Transcoded media
- OCR versions
- Thumbnails
- Public previews

## 14.5 Chain of Custody

Every important action should create an event:

- Uploaded
- Accessed
- Downloaded
- Duplicated
- Redacted
- Transcribed
- Converted
- Linked to claim
- Reviewed
- Published
- Restricted
- Removed from public display
- Placed on legal hold

## 14.6 Redaction

Redaction tools should allow removal of:

- Social Security numbers
- Financial-account numbers
- Medical details
- Home addresses
- Personal phone numbers
- Private email addresses
- Minor identities
- Victim identities where protected
- Sealed information
- Driver-license numbers
- Sensitive witness information
- Other legally protected information

The public copy and the original must remain distinct.

## 14.7 Evidence Visibility

Possible visibility levels:

- Public
- Registered Users
- Verified Researchers
- Investigation Team
- Moderator Only
- Legal Review Only
- Owner Only
- Sealed or Restricted

## 14.8 Integrity Warnings

The platform should flag:

- Metadata mismatch
- Edited media
- Missing original
- Duplicate file
- Re-encoded file
- Possible AI-generated content
- Possible manipulation
- Incomplete chain of custody

A warning is not proof of falsity.

---

# 15. PUBLIC RECORDS AND FOIA TOOLS

## 15.1 Records Request Builder

The app should help users draft public-record requests by selecting:

- Jurisdiction
- Agency
- Record type
- Date range
- People or departments
- Preferred format
- Fee limit
- Delivery method
- Expedited-processing reason if applicable

## 15.2 Request Templates

Templates may include:

- Contracts
- Budgets
- Invoices
- Body-camera footage
- Dash-camera footage
- Meeting recordings
- Emails
- Text messages
- Policies
- Training materials
- Complaints
- Disciplinary findings
- Court transcripts
- Election records
- Audit records
- Procurement records
- Use-of-force records
- Jail records
- Dispatch logs

Legal requirements differ by jurisdiction, so templates must be reviewed and jurisdiction-aware.

## 15.3 Request Tracker

Statuses:

- Draft
- Ready to Send
- Sent
- Acknowledged
- Clarification Requested
- Fee Estimate Received
- Payment Needed
- Processing
- Partially Fulfilled
- Fulfilled
- Denied
- Appealed
- Closed
- Overdue
- Litigation Review

## 15.4 Records Request Page

Show:

- Request text
- Agency
- Date sent
- Deadline or estimated response date
- Agency replies
- Fees
- Produced files
- Withheld exemptions
- Appeal status
- Public supporters
- CivicFund connection
- Timeline
- Audit log

## 15.5 Community Request Collaboration

Users should be able to:

- Endorse a request
- Suggest refinements
- Add related requests
- Help classify produced documents
- Fund lawful costs
- Subscribe to updates

---

# 16. CIVICFUND

## 16.1 Purpose

CivicFund supports evidence-based transparency work.

Tagline:

**Fund Transparency. Fund Accountability. Fund Facts.**

CivicFund should not be a general emotional crowdfunding platform. Campaigns should be tied to specific lawful transparency objectives.

## 16.2 Campaign Types

### Public Records Campaign

Examples:

- Obtain city spending records
- Pay copying fees
- Obtain court transcripts
- Obtain meeting recordings
- Obtain body-camera footage
- Obtain contracts

### Government Investigation Campaign

Examples:

- Analyze procurement concerns
- Review documented spending irregularities
- Conduct a public audit project
- Hire qualified data review
- Organize a lawful community investigation

### Court Transparency Campaign

Examples:

- Purchase transcripts
- Digitize public court records
- Analyze sentencing patterns
- Fund public-access research
- Obtain appellate records

### Community Audit Campaign

Examples:

- Compare promised and completed infrastructure work
- Analyze public spending
- Review service-response times
- Study complaint outcomes

## 16.3 Campaign Requirements

Every campaign must include:

- Clear objective
- Jurisdiction
- Responsible organizer
- Evidence or reason for the request
- Budget
- Spending categories
- Milestones
- Expected output
- Risk disclosure
- Refund or unused-fund policy
- Organizer verification
- Prohibited-use agreement

## 16.4 Campaign Statuses

- Draft
- Under Review
- Approved
- Live
- Funded
- Active
- Awaiting Records
- Deliverable Published
- Partially Completed
- Failed
- Refunding
- Closed

## 16.5 Financial Transparency

Campaign pages should show:

- Gross contributions
- Payment-processing costs
- Platform fee
- Taxes or legal costs if applicable
- Funds spent
- Funds committed
- Remaining balance
- Receipts
- Deliverables
- Refunds
- Organizer updates

## 16.6 Platform Revenue

Possible platform revenue:

- Transparent platform fee
- Payment-processing pass-through
- Optional organizational subscription
- Premium research tools
- Data services
- Public-sector transparency tools
- Training
- Verification services
- Enterprise compliance tools

Never allow payment to improve a government score or suppress evidence.

## 16.7 Financial Controls

Recommended:

- Separate campaign ledger
- Restricted spending categories
- Required receipts
- Milestone releases
- Manual review for high-risk payments
- Fraud checks
- Contributor refunds where required
- Terms reviewed by qualified counsel
- Stripe Connect or comparable marketplace payment infrastructure

---

# 17. PETITIONS AND LAWFUL CIVIC ACTION

## 17.1 Petition Types

- Policy change
- Public meeting request
- Audit request
- Records release
- Ethics review request
- Inspector-general review
- Legislative change
- Recall information campaign where lawful
- Candidate forum request
- Court-access reform
- Budget-priority request
- Agency policy review

## 17.2 Petition Requirements

Each petition should include:

- Specific request
- Target institution
- Jurisdiction
- Legal authority or policy basis if available
- Background
- Evidence
- Desired outcome
- Organizer
- Signature rules
- Deadline
- Delivery plan

## 17.3 Signature Integrity

Support:

- Verified user signature
- Residency verification
- District verification
- Duplicate detection
- Bot detection
- Public or private signer display
- Exportable signature package
- Audit trail

## 17.4 Action Plans

The platform should help citizens move from concern to lawful action:

1. Understand the issue
2. Review evidence
3. Identify the responsible authority
4. Request records
5. Contact officials
6. Attend a meeting
7. Submit public comment
8. Sign or deliver a petition
9. Support an investigation
10. Track the official response
11. Publish the outcome

## 17.5 Prohibited Action

Do not support:

- Threats
- Harassment
- Illegal disruption
- Stalking
- Doxxing
- Retaliation
- Intimidation
- Violence
- Destruction of property
- Interference with witnesses, jurors, court staff, or protected processes

---

# 18. REPLACEMENT TRACKER AND ELECTION ACCOUNTABILITY

## 18.1 Purpose

Help citizens understand lawful ways officials may be replaced, challenged, or held accountable.

## 18.2 Features

- Incumbent profile
- Term and election date
- Candidate filing information
- Known challengers
- Side-by-side comparisons
- Promise comparison
- Voting record
- Funding disclosures
- Debate questions
- Petition support
- Recall eligibility information where lawful
- Vacancy and appointment process
- Election calendar
- Nonpartisan voter information

## 18.3 Guardrails

- Separate verified facts from campaign claims
- Give candidates a response process
- Disclose methodology
- Avoid endorsements unless HearOURVOICES later creates a clearly separate editorial function
- Follow election-law and campaign-finance requirements
- Do not create fake support, fake signatures, fake voter records, or misleading election information

---

# 19. VOTE VERIFICATION HUB

## 19.1 Purpose

Provide an organized view of official election records and properly documented concerns.

## 19.2 Data Types

- Precinct results
- County totals
- State totals
- Canvass documents
- Audit records
- Recount records
- Chain-of-custody documents
- Ballot reconciliation records
- Public meeting records
- Court decisions
- Official corrections
- Citizen-submitted concerns
- Source documents

## 19.3 Confidence Labels

Recommended:

- Verified
- Consistent With Official Records
- Incomplete
- Unclear
- Disputed
- False Claim
- Under Review

## 19.4 Concern Submission

A concern should require:

- Specific election
- Precinct or jurisdiction
- Exact issue
- Supporting evidence
- Source
- Date
- Explanation
- Requested review

Unsupported mass accusations should not be published as fact.

## 19.5 Official Record Priority

Official election records, audit documents, court rulings, and authenticated public records should be clearly identified.

The app may organize and compare records but must not pretend to be the official election authority.

---

# 20. COMMUNITY INVESTIGATIONS

## 20.1 Investigation Workspace

Each investigation should include:

- Title
- Question being investigated
- Scope
- Jurisdiction
- Lead researcher
- Team
- Evidence
- Claims
- Tasks
- Timeline
- Sources
- Conflicts of interest
- Findings
- Open questions
- Official response
- Legal review
- Publication status

## 20.2 Investigation Phases

- Proposal
- Scope Review
- Approved
- Researching
- Awaiting Records
- Evidence Review
- Fact Check
- Legal Review
- Response Requested
- Published
- Updated
- Closed

## 20.3 Standards

Investigations should:

- Start with a question, not a predetermined guilty conclusion
- Distinguish allegations from findings
- Include exculpatory or conflicting evidence
- Document methodology
- Record researcher conflicts
- Allow corrections
- Offer a reasonable response opportunity
- Protect confidential sources
- Preserve source material

## 20.4 Public Investigation Report

Should include:

- Executive summary
- Key findings
- Evidence strength
- Timeline
- Methodology
- Limitations
- Official response
- Corrections
- Source appendix
- Audit history

---

# 21. CREDIBILITY AND REPUTATION SYSTEM

## 21.1 Purpose

Reward careful, accurate, constructive participation.

Do not turn reputation into popularity.

## 21.2 Reputation Inputs

Positive signals:

- Verified identity
- Accurate submissions
- High-quality sources
- Corrections accepted
- Helpful document classification
- Successful records requests
- Constructive research
- Consistent citation
- Responsible moderation history
- Completing training
- Disclosing conflicts

Negative signals:

- Repeated unsupported claims
- Manipulated evidence
- Harassment
- Duplicate spam
- Coordinated manipulation
- False identity
- Undisclosed conflicts
- Refusal to correct proven errors
- Repeated policy violations

## 21.3 Reputation Dimensions

Instead of one universal number, use dimensions:

- Evidence Quality
- Research Accuracy
- Civic Participation
- Collaboration
- Reliability
- Safety and Conduct

## 21.4 Reputation Guardrails

- Users must be able to appeal
- Scores should decay or recover over time
- Political viewpoint must not affect reputation
- Moderators should not manually change scores without logged reasons
- Reputation should not determine whether true evidence is accepted
- Low-reputation users may still submit information to a review queue

---

# 22. ANTI-BOT AND MANIPULATION SYSTEM

## 22.1 Threats

- Fake accounts
- Coordinated brigading
- Automated petition signatures
- Mass commenting
- Duplicate evidence
- Astroturfing
- Sockpuppet accounts
- Reputation farming
- Coordinated rating manipulation
- Foreign or domestic influence operations
- Harassment campaigns

## 22.2 Controls

- Email and phone verification
- Optional or required identity verification for sensitive actions
- Device risk signals
- IP risk signals
- Rate limits
- CAPTCHA or challenge systems
- Behavioral anomaly detection
- Duplicate text detection
- Coordinated timing detection
- Shared-device analysis
- Signature verification
- Account-age controls
- Trust tiers
- Manual review
- Appeal process

## 22.3 Bot Risk Score

Internal score may use:

- Account age
- Activity velocity
- Repetition
- Device overlap
- IP overlap
- Behavioral similarity
- Geographic inconsistency
- Failed verification
- Coordinated target patterns

Do not publicly label a user a bot based only on an automated score.

---

# 23. MODERATION SYSTEM

## 23.1 Moderation Goals

- Protect lawful criticism
- Remove threats and harassment
- Prevent doxxing
- Prevent unsupported accusations from being presented as proven
- Protect privacy
- Apply standards consistently
- Create transparent appeals

## 23.2 Content Statuses

- Live
- Limited Distribution
- Under Review
- Needs Evidence
- Needs Redaction
- Disputed
- Removed
- Archived
- Legal Hold

## 23.3 Moderation Reasons

- Threat
- Harassment
- Doxxing
- Private Information
- Unsupported Factual Accusation
- Manipulated Evidence
- Spam
- Impersonation
- Copyright
- Sealed or Protected Record
- Minor Safety
- Victim Privacy
- Illegal Content
- Coordinated Manipulation
- Off Topic
- Duplicate
- Other

## 23.4 Moderation Notice

A user should receive:

- What content was affected
- Rule applied
- Action taken
- Evidence considered
- Duration
- Appeal process

## 23.5 Public Moderation Transparency

Publish aggregate data:

- Number of reports
- Number of removals
- Top removal reasons
- Appeal rate
- Reversal rate
- Government removal requests
- Legal demands
- Account restrictions
- Bot actions

Do not expose private reporter information.

## 23.6 Appeals

Appeals should be reviewed by someone other than the original moderator when possible.

---

# 24. OFFICIAL RESPONSE AND RIGHT-TO-CORRECT SYSTEM

Officials, agencies, and affected people should have a structured response channel.

They may:

- Add context
- Dispute a claim
- Upload supporting records
- Request correction
- Identify missing evidence
- Appeal a score
- Report private or sealed information
- Provide an official statement

The platform may display the official response next to the claim without automatically treating it as true.

Corrections should be visible and timestamped.

---

# 25. AI FEATURES

AI should organize information, not secretly decide truth.

## 25.1 Approved AI Functions

- Summarize public records
- Extract names, dates, agencies, amounts, votes, charges, and events
- Create draft timelines
- Suggest claim-evidence links
- Find duplicate records
- Identify contradictions
- Detect missing sources
- Generate plain-language explanations
- Translate content
- Create document indexes
- Identify possible redaction needs
- Classify source types
- Suggest FOIA language
- Compare promises and actions
- Detect suspicious coordination
- Assist moderators
- Generate research questions
- Create draft scorecard calculations

## 25.2 Human Review Requirements

Human review should be required before:

- Publishing a serious misconduct claim
- Marking a claim false
- Assigning a high-impact score
- Publishing sensitive personal information
- Publishing legal conclusions
- Releasing confidential evidence
- Suspending a verified official account
- Disbursing high-risk CivicFund payments

## 25.3 AI Transparency

Where AI materially assists content, display:

- AI-assisted label
- Human reviewer
- Source list
- Date
- Model or method version internally
- Correction option

## 25.4 Prohibited AI Behavior

AI should not:

- Invent sources
- Create fake quotes
- Generate evidence
- Impersonate officials
- Make hidden political decisions
- Treat accusations as proven
- Reveal protected information
- Automatically publish damaging conclusions without review

---

# 26. NOTIFICATIONS AND ALERTS

Users may follow:

- Jurisdiction
- Official
- Agency
- Judge
- Prosecutor
- Court
- Case
- Claim
- Investigation
- Public-record request
- Petition
- CivicFund campaign
- Election
- Topic

Notification types:

- New record
- Claim status change
- Official response
- Scorecard update
- Correction
- New hearing
- Records deadline
- Petition milestone
- Campaign funding milestone
- Investigation update
- Moderation appeal result
- Security alert

Users must control frequency and channel.

---

# 27. SEARCH AND DISCOVERY

Search should support:

- People
- Officials
- Agencies
- Courts
- Cases
- Claims
- Evidence
- Records requests
- Campaigns
- Petitions
- Jurisdictions
- Topics
- Dates
- Dollar amounts
- Contracts
- Donors
- Votes

Filters:

- Location
- Date
- Status
- Evidence level
- Source type
- Agency
- Court
- Official
- Topic
- Score range
- Claim confidence
- Public-record status
- Campaign status

Search results should show why an item matched.

---

# 28. CORE DATABASE MODEL

Use a relational database such as PostgreSQL for core structured data.

Use object storage for files.

Use a search index for full-text and document search.

## 28.1 Identity and Access Tables

### users

- id
- email
- phone
- password_hash or external_auth_id
- display_name
- public_alias
- status
- created_at
- last_login_at
- locale
- timezone

### user_profiles

- user_id
- biography
- home_jurisdiction_id
- public_location_level
- profile_image_url
- interests
- notification_preferences

### identity_verifications

- id
- user_id
- verification_type
- provider
- status
- verified_name
- verified_jurisdiction
- completed_at
- expires_at
- encrypted_reference

### roles

- id
- name
- description

### user_roles

- user_id
- role_id
- scope_type
- scope_id
- granted_by
- granted_at
- revoked_at

### sessions

- id
- user_id
- device_id
- ip_hash
- risk_score
- created_at
- expires_at

## 28.2 Government Structure Tables

### jurisdictions

- id
- name
- type
- parent_id
- state_code
- country_code
- boundary_reference
- official_website
- active

### government_bodies

- id
- jurisdiction_id
- name
- type
- official_website

### agencies

- id
- jurisdiction_id
- government_body_id
- name
- type
- description
- official_website
- status

### offices

- id
- jurisdiction_id
- agency_id
- title
- office_type
- elected_or_appointed

### people

- id
- full_name
- date_of_birth_public
- biography
- public_source

### office_terms

- id
- office_id
- person_id
- start_date
- end_date
- election_id
- appointment_source
- status

## 28.3 Official Accountability Tables

### promises

- id
- person_id
- office_term_id
- text
- source_id
- made_at
- deadline
- category
- status
- confidence
- last_reviewed_at

### measures

- id
- government_body_id
- title
- official_number
- summary
- full_text_source_id
- introduced_at
- decided_at
- status
- financial_impact

### votes

- id
- measure_id
- person_id
- vote_value
- vote_date
- source_id

### official_statements

- id
- person_id
- agency_id
- text
- statement_date
- source_id
- statement_type

### conflicts

- id
- person_id
- agency_id
- conflict_type
- description
- source_id
- status
- reviewed_at

### complaints

- id
- target_type
- target_id
- complaint_type
- filed_at
- status
- disposition
- source_id
- public_summary

## 28.4 Courts and Cases Tables

### courts

- id
- jurisdiction_id
- name
- court_type
- level
- official_website

### judges

- id
- person_id
- court_id
- start_date
- end_date
- selection_method
- status

### prosecutor_offices

- id
- jurisdiction_id
- name
- official_website

### prosecutors

- id
- person_id
- prosecutor_office_id
- start_date
- end_date
- status

### cases

- id
- court_id
- case_number
- case_type
- filed_at
- closed_at
- status
- public_title
- visibility
- sealing_status

### case_parties

- id
- case_id
- person_or_org_type
- person_or_org_id
- role
- public_name
- protected

### case_events

- id
- case_id
- event_type
- event_at
- official_text
- plain_summary
- source_id
- verification_status
- visibility

### charges

- id
- case_id
- statute
- description
- level
- filed_at
- outcome

### case_outcomes

- id
- case_id
- outcome_type
- outcome_date
- sentence
- disposition
- source_id

## 28.5 Claims and Evidence Tables

### claims

- id
- submitter_user_id
- claim_type
- text
- target_type
- target_id
- occurred_at
- jurisdiction_id
- status
- confidence_label
- visibility
- published_at
- official_response_status

### claim_reviews

- id
- claim_id
- reviewer_user_id
- review_type
- decision
- rationale
- created_at

### evidence_items

- id
- uploader_user_id
- title
- description
- evidence_type
- original_storage_key
- public_storage_key
- original_hash
- processed_hash
- visibility
- verification_status
- redaction_status
- legal_hold
- created_at

### evidence_metadata

- evidence_id
- source_name
- source_type
- source_date
- custodian
- original_filename
- mime_type
- file_size
- extracted_text
- metadata_json

### claim_evidence_links

- id
- claim_id
- evidence_id
- relationship
- strength
- reviewer_user_id

### evidence_chain_events

- id
- evidence_id
- event_type
- actor_user_id
- occurred_at
- metadata_json

### redactions

- id
- evidence_id
- redacted_copy_key
- reason
- redacted_by
- approved_by
- created_at

## 28.6 Public Records Tables

### records_requests

- id
- creator_user_id
- agency_id
- jurisdiction_id
- title
- request_text
- sent_at
- status
- fee_limit
- fee_estimate
- due_date
- public
- campaign_id

### records_request_events

- id
- request_id
- event_type
- event_at
- description
- source_id
- created_by

### records_productions

- id
- request_id
- evidence_id
- received_at
- description

### records_denials

- id
- request_id
- reason
- exemption
- denial_date
- appeal_status

## 28.7 CivicFund Tables

### campaigns

- id
- creator_user_id
- campaign_type
- title
- description
- jurisdiction_id
- goal_amount
- status
- approved_by
- starts_at
- ends_at
- platform_fee_rate
- refund_policy

### campaign_milestones

- id
- campaign_id
- title
- description
- target_amount
- status
- due_at
- completed_at

### contributions

- id
- campaign_id
- contributor_user_id
- amount
- processor_fee
- platform_fee
- status
- created_at
- anonymous_display

### campaign_expenses

- id
- campaign_id
- category
- vendor
- amount
- receipt_evidence_id
- description
- status
- approved_by
- paid_at

### campaign_updates

- id
- campaign_id
- author_user_id
- title
- body
- created_at

## 28.8 Petitions and Action Tables

### petitions

- id
- creator_user_id
- title
- request_text
- target_type
- target_id
- jurisdiction_id
- status
- deadline
- signature_goal
- public

### petition_signatures

- id
- petition_id
- user_id
- verified_jurisdiction
- display_preference
- signed_at
- fraud_status

### action_plans

- id
- creator_user_id
- title
- issue_id
- jurisdiction_id
- status
- description

### action_steps

- id
- action_plan_id
- sequence
- action_type
- description
- due_at
- status

## 28.9 Investigation Tables

### investigations

- id
- title
- research_question
- jurisdiction_id
- lead_user_id
- status
- visibility
- methodology
- limitations
- published_at

### investigation_members

- investigation_id
- user_id
- role
- conflict_disclosure
- joined_at

### investigation_tasks

- id
- investigation_id
- title
- assigned_to
- status
- due_at

### investigation_claims

- investigation_id
- claim_id
- relevance

### investigation_evidence

- investigation_id
- evidence_id
- relevance

### investigation_findings

- id
- investigation_id
- title
- summary
- confidence
- status
- published_at

## 28.10 Scorecard Tables

### scorecard_methodologies

- id
- name
- entity_type
- version
- description
- effective_from
- effective_to
- public_document_url

### scorecards

- id
- entity_type
- entity_id
- methodology_id
- period_start
- period_end
- overall_score
- confidence
- insufficient_data
- published_at

### scorecard_categories

- id
- scorecard_id
- category_name
- score
- weight
- confidence
- explanation

### scorecard_metrics

- id
- category_id
- metric_name
- raw_value
- normalized_score
- weight
- confidence
- source_id

### scorecard_appeals

- id
- scorecard_id
- appellant_user_id
- reason
- evidence_id
- status
- decision
- decided_at

## 28.11 Moderation, Reputation, and Audit Tables

### content_reports

- id
- reporter_user_id
- content_type
- content_id
- reason
- details
- status
- created_at

### moderation_actions

- id
- content_type
- content_id
- moderator_user_id
- action_type
- reason
- public_explanation
- starts_at
- ends_at

### moderation_appeals

- id
- moderation_action_id
- appellant_user_id
- reason
- status
- reviewed_by
- decision
- decided_at

### reputation_events

- id
- user_id
- dimension
- points
- reason
- source_type
- source_id
- created_at

### bot_risk_events

- id
- user_id
- device_id
- risk_type
- risk_score
- metadata_json
- created_at

### audit_log

- id
- actor_user_id
- action
- entity_type
- entity_id
- before_json
- after_json
- ip_hash
- created_at

Audit records should be append-only and restricted from ordinary deletion.

---

# 29. PERMISSION MODEL

Use role-based and object-level access control.

## Public

- Read published content
- View public documents
- View public methodology
- View public audit history where allowed

## Registered User

- Follow content
- Save items
- Submit basic feedback

## Verified Citizen

- Submit concerns
- Upload evidence
- Sign petitions
- Join public collaboration

## Researcher

- Edit draft timelines
- Link evidence
- Propose claim statuses
- Access research workspace

## Official Representative

- Respond to relevant profiles
- Submit corrections
- Upload official records

## Moderator

- Review reports
- Apply moderation actions
- Redact public copies

## Legal Reviewer

- Review high-risk content
- Apply legal holds
- Restrict publication

## Finance Reviewer

- Review CivicFund expenses
- Approve disbursement milestones

## Administrator

- Manage settings, roles, imports, and system access

Sensitive permissions should require multi-factor authentication.

---

# 30. RECOMMENDED API STRUCTURE

Example REST routes. GraphQL may be added later, but the first implementation should remain understandable.

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/verify-email`
- `POST /api/auth/mfa`
- `POST /api/identity/start`
- `POST /api/identity/complete`

## Jurisdictions

- `GET /api/jurisdictions`
- `GET /api/jurisdictions/:id`
- `GET /api/jurisdictions/:id/brief`
- `GET /api/jurisdictions/:id/officials`
- `GET /api/jurisdictions/:id/issues`

## Officials and Agencies

- `GET /api/officials`
- `GET /api/officials/:id`
- `GET /api/officials/:id/promises`
- `GET /api/officials/:id/votes`
- `GET /api/officials/:id/scorecard`
- `POST /api/officials/:id/responses`
- `POST /api/officials/:id/corrections`

## Courts and Cases

- `GET /api/courts`
- `GET /api/judges/:id`
- `GET /api/prosecutors/:id`
- `GET /api/cases`
- `GET /api/cases/:id`
- `GET /api/cases/:id/timeline`
- `POST /api/cases/:id/events`

## Claims

- `POST /api/claims`
- `GET /api/claims/:id`
- `PATCH /api/claims/:id`
- `POST /api/claims/:id/evidence`
- `POST /api/claims/:id/reviews`
- `POST /api/claims/:id/responses`
- `POST /api/claims/:id/appeals`

## Evidence

- `POST /api/evidence/upload-url`
- `POST /api/evidence/complete`
- `GET /api/evidence/:id`
- `POST /api/evidence/:id/redactions`
- `POST /api/evidence/:id/verify`
- `GET /api/evidence/:id/chain`

## Records Requests

- `POST /api/records-requests`
- `GET /api/records-requests/:id`
- `POST /api/records-requests/:id/events`
- `POST /api/records-requests/:id/productions`
- `POST /api/records-requests/:id/endorse`
- `POST /api/records-requests/:id/appeal`

## CivicFund

- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `POST /api/campaigns/:id/submit-review`
- `POST /api/campaigns/:id/contribute`
- `POST /api/campaigns/:id/expenses`
- `POST /api/campaigns/:id/updates`
- `GET /api/campaigns/:id/ledger`

## Petitions

- `POST /api/petitions`
- `GET /api/petitions/:id`
- `POST /api/petitions/:id/sign`
- `GET /api/petitions/:id/signatures/export`

## Investigations

- `POST /api/investigations`
- `GET /api/investigations/:id`
- `POST /api/investigations/:id/members`
- `POST /api/investigations/:id/tasks`
- `POST /api/investigations/:id/findings`
- `POST /api/investigations/:id/publish`

## Moderation

- `POST /api/reports`
- `GET /api/moderation/queue`
- `POST /api/moderation/actions`
- `POST /api/moderation/appeals`
- `GET /api/transparency/moderation`

## Search

- `GET /api/search`
- `POST /api/search/advanced`
- `GET /api/search/suggestions`

---

# 31. RECOMMENDED TECHNICAL ARCHITECTURE

This is a suggested architecture, not a mandatory vendor lock-in.

## Front End

- Responsive web application
- React or Next.js
- Mobile-first layout
- Accessible component system
- Progressive Web App support
- Native mobile apps may be added later

## Back End

- TypeScript service layer
- Node-based API
- PostgreSQL
- Background job queue
- Search engine
- Object storage
- Email and notification service
- Payment provider for CivicFund
- Identity-verification provider
- Logging and monitoring

## Suggested Managed Stack for an MVP

- Next.js
- TypeScript
- PostgreSQL through Supabase, Neon, or another managed provider
- Supabase Auth, Clerk, Auth0, or comparable authentication
- S3-compatible object storage
- Stripe Connect for CivicFund
- Search through PostgreSQL full-text initially
- Dedicated search engine later
- Background jobs through a managed queue
- Error monitoring
- Analytics with privacy controls

## Environment Separation

- Development
- Staging
- Production

Never test with real sensitive evidence in development.

## File Processing Pipeline

1. Generate secure upload URL
2. Upload directly to object storage
3. Virus scan
4. Hash original
5. Extract metadata
6. OCR or transcribe
7. Identify sensitive information
8. Create preview
9. Queue human review
10. Publish approved redacted copy

---

# 32. SECURITY REQUIREMENTS

## Required Controls

- Encryption in transit
- Encryption at rest
- Multi-factor authentication for privileged users
- Least-privilege access
- Signed file URLs
- Secure secrets storage
- Rate limiting
- Audit logging
- Session revocation
- Strong password policy
- Dependency scanning
- File malware scanning
- Backups
- Disaster recovery
- Data-retention rules
- Incident-response plan
- Vulnerability disclosure channel

## High-Risk Data

Treat as high risk:

- Confidential tips
- Unredacted evidence
- Identity-verification records
- Precise addresses
- Protected court information
- Payment data
- Legal-review notes
- Moderator identities in sensitive cases
- Whistleblower information

## Data Separation

Public content and restricted evidence should not share the same access path.

## Deletion

Some data may be removed from public display while retained under:

- Audit requirements
- Fraud prevention
- Legal hold
- Financial compliance
- Safety requirements

Retention rules must be documented.

---

# 33. PRIVACY REQUIREMENTS

Users should be able to understand:

- What data is collected
- Why it is collected
- Who can access it
- How long it is retained
- Whether it is public
- How to request correction
- How to request deletion where allowed

The platform should minimize collection of:

- Exact home addresses
- Government identification images
- Sensitive personal information
- Unnecessary demographic data

Do not sell personal user data.

---

# 34. LEGAL-RISK REDUCTION

This section is product guidance, not legal advice.

Qualified counsel should review the platform before public launch.

## Main Risk Areas

- Defamation
- Privacy
- Doxxing
- False light
- Copyright
- Sealed and expunged records
- Juvenile records
- Victim information
- Confidential sources
- Election law
- Campaign-finance law
- Crowdfunding
- Money transmission
- Charitable solicitation
- Consumer protection
- Public-record law
- Court-record restrictions
- Terms of service
- Section 230 strategy
- Data protection
- Biometric and identity verification
- Accessibility

## Product Safeguards

- Claims must be structured
- Evidence must be linked
- Status labels must be clear
- Allegations must not be displayed as proven
- Official responses must be supported
- Corrections must be visible
- High-risk content requires review
- Private information must be redacted
- Sealed or protected content must be restricted
- Users must agree to submission standards
- Repeat bad-faith users must be restricted
- Moderation must be documented
- Legal demands must be tracked
- A takedown and appeal process must exist

## Recommended Public Labels

Use wording such as:

- Allegation
- Complaint Filed
- Under Review
- No Finding
- Finding Issued
- Dismissed
- Settled Without Admission
- Convicted
- Reversed
- Expunged
- Disputed
- Insufficient Evidence

Avoid emotionally loaded labels not supported by official findings.

---

# 35. ACCESSIBILITY

The platform should target WCAG-compliant design.

Include:

- Keyboard navigation
- Screen-reader labels
- High contrast
- Resizable text
- Captions
- Transcripts
- Descriptive links
- Clear error messages
- Plain-language mode
- Language translation
- Accessible charts
- Reduced-motion option

---

# 36. DESIGN DIRECTION

## Brand Personality

- Serious
- Human
- Trustworthy
- Bold
- Modern
- Nonpartisan
- Evidence-centered
- Community-centered

## Visual Concept

Possible logo directions:

- Speech bubble combined with a soundwave
- A rising waveform
- A civic-column shape made from voices
- A clean HOV monogram

Do not use another organization’s name, logo, endorsement, or brand identity without permission.

## Suggested Color Direction

- Deep trust blue
- Strong civic red used carefully
- Neutral white and gray
- Success green
- Warning amber
- Evidence-status colors that remain accessible

## UI Rules

- Show sources near claims
- Show status labels clearly
- Avoid endless social feeds
- Avoid vanity follower counts as the main signal
- Avoid public outrage counters
- Emphasize timelines, records, evidence, outcomes, and next steps
- Use plain-language explanations

---

# 37. KEY SCREENS

## Public Screens

- Landing page
- Location setup
- Community dashboard
- Official directory
- Official profile
- Agency profile
- Judge profile
- Prosecutor profile
- Court profile
- Case timeline
- Claim page
- Evidence viewer
- Public-record request page
- Investigation page
- Scorecard page
- CivicFund campaign page
- Petition page
- Election record page
- Search results
- Methodology
- Moderation transparency
- Corrections log

## User Screens

- Registration
- Verification
- User dashboard
- Saved items
- Alerts
- Submit concern
- Upload evidence
- Draft claim
- Start records request
- Start petition
- Start campaign
- Join investigation
- Reputation profile
- Appeal center
- Privacy settings
- Notification settings

## Official Screens

- Claim profile
- Verify office
- Official response center
- Correction requests
- Scorecard appeals
- Document upload
- Public contact settings

## Staff Screens

- Moderation queue
- Evidence review
- Legal review
- Identity-verification queue
- CivicFund review
- Expense review
- Public-record import
- Data quality dashboard
- Bot-risk dashboard
- Appeals
- Audit log
- Methodology manager

---

# 38. MVP SCOPE

The MVP should prove that citizens can understand local government activity and connect claims to evidence.

## MVP Must Include

1. Authentication
2. User roles
3. Jurisdiction selection
4. Community dashboard
5. Official profiles
6. Agency profiles
7. Claims
8. Evidence upload
9. Evidence review and redaction
10. Claim-evidence linking
11. Public timelines
12. Public-record request builder and tracker
13. Basic scorecards
14. Official responses
15. Corrections
16. Moderation
17. Audit logging
18. Search
19. Notifications
20. Admin dashboard

## MVP Should Use One Pilot Geography

Recommended pilot:

- One city
- One county
- Selected agencies
- Selected elected officials
- One prosecutor office
- One court system where public data is available

## MVP Should Not Initially Include

- Nationwide data
- Complex live election verification
- Full court analytics across every jurisdiction
- Automated guilt or corruption labels
- Open public commenting without structure
- Large unrestricted crowdfunding
- Advanced predictive policing or criminal-risk scoring
- Public posting of anonymous accusations
- Unreviewed AI publication
- Pay-to-rank features

---

# 39. PHASED ROADMAP

## Phase 0 — Foundation

- Finalize mission
- Form legal entity
- Obtain legal review
- Define privacy policy
- Define terms
- Define evidence standards
- Define moderation policy
- Choose pilot jurisdiction
- Design data model
- Create brand system

## Phase 1 — Local Accountability MVP

- Community dashboard
- Official profiles
- Agency profiles
- Promise tracker
- Vote tracker
- Claims and evidence
- Records requests
- Basic scorecards
- Moderation and corrections
- Official responses

## Phase 2 — Court and Justice Transparency

- Judge profiles
- Prosecutor profiles
- Court dashboards
- Case timelines
- Legal outcome analytics
- Privacy thresholds
- Records integrations

## Phase 3 — Civic Action

- Petitions
- Action plans
- Meeting alerts
- Public comment tools
- Replacement tracker
- Candidate comparisons

## Phase 4 — CivicFund

- Campaign creation
- Review workflow
- Contributions
- Milestones
- Expense ledger
- Receipts
- Refunds
- Financial transparency

## Phase 5 — Community Investigations

- Research workspaces
- Team roles
- Tasks
- Evidence collections
- Findings
- Legal review
- Publication system

## Phase 6 — Vote Verification Hub

- Official result imports
- Audit documents
- Canvass records
- Concern review
- Confidence labels
- Election-specific moderation

## Phase 7 — National Expansion

- More jurisdictions
- Data partnerships
- Public API
- Journalist tools
- Research exports
- Institutional subscriptions
- Independent governance board

---

# 40. BUSINESS MODEL

HearOURVOICES should remain useful for free.

Possible revenue:

- Premium user research tools
- Organizational subscriptions
- Journalist and academic tools
- Advanced exports
- White-label transparency tools
- Government transparency dashboards
- CivicFund platform fees
- Data-cleaning services
- Verification services
- Training and certification
- Grant funding
- Philanthropic support
- Sponsorships with strict disclosure
- API access

Prohibited revenue:

- Paying to improve a score
- Paying to hide evidence
- Selling user political profiles
- Secret sponsored rankings
- Selling private whistleblower information
- Accepting money to target an official
- Charging users to access their own correction or appeal rights

---

# 41. COMMUNITY GOVERNANCE

## 41.1 Governance Goals

- Consistent rules
- Public methodology
- Transparent changes
- Independent review
- Political neutrality
- User appeals
- Protection against founder or moderator abuse

## 41.2 Governance Bodies

Future structure:

- Methodology Council
- Community Standards Council
- Legal and Civil Rights Advisory Group
- Data Ethics Group
- User Appeals Panel
- Security and Privacy Review Group

Avoid using outside organization names publicly without formal involvement or permission.

## 41.3 Policy Versioning

Policies should have:

- Version
- Effective date
- Change summary
- Public comment period where appropriate
- Archive of prior versions

---

# 42. SUCCESS METRICS

## Trust Metrics

- Percentage of claims with linked evidence
- Correction response time
- Appeal reversal rate
- Source-quality distribution
- Percentage of scorecards with sufficient data
- Official response rate
- User trust survey

## Civic Impact Metrics

- Records requests completed
- Records released
- Petitions delivered
- Meeting participation
- Investigations completed
- Public corrections obtained
- Policy changes documented
- Campaign deliverables completed

## Safety Metrics

- Threat-removal time
- Doxxing-removal time
- Repeat abuse rate
- Bot detection accuracy
- False-positive appeals
- Sensitive-data exposure incidents

## Product Metrics

- Monthly active verified users
- Jurisdictions followed
- Evidence items reviewed
- Claims resolved
- Searches completed
- Alert engagement
- Researcher retention

Do not optimize only for time spent or outrage-driven engagement.

---

# 43. CORE USER FLOWS

## Flow A — Citizen Reports a Concern

1. User selects “Submit a Concern”
2. Chooses jurisdiction and target
3. Writes what happened
4. Separates observation from conclusion
5. Adds date and location
6. Uploads evidence
7. Reviews privacy warnings
8. Submits
9. Automated checks run
10. Moderator or researcher reviews
11. Claim is published, returned for more evidence, restricted, or rejected
12. Official may respond
13. User receives status updates
14. Corrections remain visible

## Flow B — User Requests Public Records

1. Select agency
2. Select record type
3. Set date range
4. Generate draft
5. Review jurisdiction notice
6. Send externally or track manually
7. Add agency replies
8. Record fees
9. Upload produced documents
10. Link documents to claims or investigations
11. Publish result

## Flow C — Create a CivicFund Campaign

1. Verified organizer starts campaign
2. Selects campaign type
3. Defines objective
4. Adds supporting evidence
5. Creates budget
6. Adds milestones
7. Selects unused-fund policy
8. Submits for review
9. Legal and financial review
10. Campaign goes live
11. Contributions processed
12. Spending documented
13. Deliverables uploaded
14. Campaign closed or refunded

## Flow D — Build an Investigation

1. Submit research question
2. Define scope
3. Disclose conflicts
4. Add team
5. Create tasks
6. Request records
7. Upload evidence
8. Draft claims
9. Review conflicting evidence
10. Fact check
11. Legal review
12. Request official response
13. Publish report
14. Maintain correction history

## Flow E — Official Challenges a Score

1. Official verifies identity and office
2. Selects score or metric
3. Submits explanation
4. Uploads evidence
5. Reviewer checks methodology
6. Decision published
7. Score corrected or upheld
8. Appeal record remains public

---

# 44. DEMO DATA FOR DEVELOPMENT

Claude should create a fictional pilot jurisdiction.

Do not use real people or imply real wrongdoing in demo data.

Example fictional data:

- City: Riverbend
- County: Cedar County
- Mayor: Jordan Reed
- City Council members
- Police Department
- Procurement Office
- Municipal Court
- District Attorney’s Office
- Fictional contracts
- Fictional meeting votes
- Fictional records requests
- Fictional campaign
- Fictional claim with supporting and contradicting documents

Demo data should show:

- A completed promise
- A broken promise
- A disputed claim
- An official response
- A corrected score
- A redacted document
- A completed records request
- A CivicFund ledger
- A moderation appeal
- A case timeline

---

# 45. DEVELOPMENT RULES FOR CLAUDE

Claude must follow these rules while building.

## Product Rules

1. Keep HearOURVOICES separate from all unrelated projects.
2. Do not add gambling, sports, ladders, player markets, or entertainment rankings.
3. Do not turn the platform into a popularity-based social feed.
4. Evidence, sources, timelines, status labels, and audit history are required.
5. Serious claims must not publish without review.
6. Anonymous tips may be private, but anonymous public accusations are not allowed.
7. Officials must have correction and response tools.
8. Moderation actions must have reasons and appeals.
9. Scores must be explainable and versioned.
10. Missing data must not count as failure.
11. AI output must be labeled and reviewable.
12. Sensitive evidence must remain restricted.
13. Demo data must be fictional.
14. All privileged actions must be logged.
15. Build for accessibility and mobile use.

## Coding Rules

1. Use TypeScript.
2. Use strict typing.
3. Validate API inputs.
4. Use database migrations.
5. Separate public and privileged API routes.
6. Add authorization checks server-side.
7. Do not trust client-side role checks.
8. Use signed URLs for restricted files.
9. Never place secrets in the repository.
10. Add tests for permissions, evidence access, moderation, score calculations, and campaign ledgers.
11. Add seed data.
12. Add an `.env.example`.
13. Add setup documentation.
14. Add clear comments only where logic is not obvious.
15. Use reusable components.
16. Add loading, empty, error, and permission-denied states.
17. Log important actions.
18. Do not silently delete audit history.
19. Protect against duplicate form submission.
20. Add pagination and filtering to large lists.

---

# 46. RECOMMENDED REPOSITORY STRUCTURE

```text
hearourvoices/
├── apps/
│   ├── web/
│   ├── admin/
│   └── worker/
├── packages/
│   ├── ui/
│   ├── database/
│   ├── auth/
│   ├── permissions/
│   ├── evidence/
│   ├── scoring/
│   ├── moderation/
│   ├── notifications/
│   ├── search/
│   └── shared/
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── evidence-policy.md
│   ├── moderation-policy.md
│   ├── scoring-methodology.md
│   ├── privacy-model.md
│   └── deployment.md
├── infrastructure/
├── scripts/
├── tests/
├── .env.example
├── README.md
└── package.json
```

---

# 47. FIRST BUILD ORDER

Claude should build in this order:

1. Project setup
2. Authentication
3. Database schema
4. Role and permission system
5. Jurisdiction setup
6. Official and agency profiles
7. Source and citation system
8. Claims
9. Evidence upload and storage
10. Evidence review
11. Claim-evidence relationships
12. Public profile pages
13. Community dashboard
14. Records request builder
15. Scorecards
16. Official response and correction system
17. Moderation
18. Audit logs
19. Search
20. Notifications
21. Admin tools
22. Testing
23. Security review
24. Deployment documentation

Do not begin with advanced AI, nationwide data, or crowdfunding before the evidence, permissions, moderation, and audit foundations are working.

---

# 48. MVP ACCEPTANCE CRITERIA

The MVP is ready for a controlled pilot when:

- A user can create an account
- A user can select a jurisdiction
- A verified user can submit a concern
- Evidence can be uploaded securely
- Evidence can be redacted
- A reviewer can approve or reject publication
- A claim can link to supporting and contradicting evidence
- A visitor can understand the claim status
- An official can submit a response
- A correction can be published
- A scorecard shows its methodology
- A records request can be drafted and tracked
- A moderator can take action
- A user can appeal
- Audit logs capture privileged changes
- Restricted files cannot be accessed publicly
- Demo data works
- Permission tests pass
- The app works on mobile
- Basic accessibility tests pass
- Backups and error monitoring are configured

---

# 49. RISK REGISTER

## Risk: Rumor and Defamation

Response:

- Structured claims
- Evidence requirements
- Review workflow
- Status labels
- Official responses
- Corrections
- Legal escalation

## Risk: Political Bias

Response:

- Public methodology
- Versioned scoring
- Consistent rules
- Diverse review
- Appeals
- No pay-to-rank

## Risk: Bot Manipulation

Response:

- Verification
- Rate limits
- Device and behavior signals
- Duplicate detection
- Manual review

## Risk: Sensitive Data Exposure

Response:

- Redaction
- Restricted storage
- Access controls
- Legal review
- Audit logs
- Incident response

## Risk: Bad Crowdfunding Campaign

Response:

- Organizer verification
- Campaign review
- Restricted use
- Milestones
- Receipts
- Transparent ledger
- Refund rules

## Risk: Inaccurate Court Analytics

Response:

- Sample-size warnings
- Data completeness
- Methodology disclosure
- Privacy thresholds
- Human review
- No causal claims without support

## Risk: Founder or Moderator Abuse

Response:

- Append-only audit logs
- Appeals
- Public transparency reports
- Separation of roles
- Independent governance over time

## Risk: Low Adoption

Response:

- Start with one community
- Solve real local information problems
- Partner with community researchers
- Publish useful local briefs
- Make records requests easy
- Demonstrate concrete outcomes

---

# 50. FINAL PRODUCT VISION

HearOURVOICES should become the easiest and most trustworthy way for ordinary people to understand what is happening in their community and what they can lawfully do about it.

A successful version of HearOURVOICES will allow a person to open the app and see:

- What government decided
- Who voted for it
- What officials promised
- What actually happened
- How public money was spent
- What courts and prosecutors are doing
- What evidence exists
- What remains disputed
- What records citizens are requesting
- What investigations are active
- What lawful action is available
- Whether government responded
- Whether conditions improved

The platform should not tell users what political opinion to hold.

It should give them the records, evidence, context, tools, and transparent process needed to reach informed conclusions and participate lawfully.

---

# 51. MASTER CLAUDE BUILD PROMPT

Copy the following prompt into Claude after attaching this specification:

> You are the lead product engineer, software architect, security engineer, database designer, and UX implementation partner for HearOURVOICES.
>
> The attached HearOURVOICES Master Product, Business, Governance, Data, and Developer Specification is the source of truth.
>
> Build the platform in controlled phases. Do not add unrelated features. Do not combine it with Action Ladder, billiards, gaming, gambling, sports rankings, fantasy markets, or general social-media mechanics.
>
> Begin by auditing the current repository. Produce:
>
> 1. A current-state architecture summary
> 2. A gap analysis against the master specification
> 3. A prioritized implementation plan
> 4. A database migration plan
> 5. A permission matrix
> 6. A security-risk list
> 7. A file-by-file implementation plan
>
> Then implement the next highest-priority phase.
>
> Use TypeScript, strict validation, server-side authorization, migrations, audit logging, secure file handling, reusable components, and tests.
>
> Do not publish serious allegations automatically. Build claims, evidence, source quality, redaction, review status, official response, corrections, moderation, appeals, and public audit history as first-class systems.
>
> Use fictional demo data only.
>
> Before changing major architecture, explain:
>
> - What will change
> - Why it is needed
> - Which files will change
> - Whether a migration is required
> - What tests will prove it works
>
> After each implementation phase, provide:
>
> - Files created
> - Files modified
> - Database changes
> - Environment variables
> - Test instructions
> - Manual verification steps
> - Known limitations
> - Recommended next phase
>
> Never overwrite working code without first understanding it. Preserve the original repository or create a safe branch before major changes.

---

# 52. SOURCE-OF-TRUTH NOTICE

This document should remain in the project repository at:

`/docs/HEAROURVOICES_MASTER_SPEC.md`

When product rules change:

1. Update this document
2. Add a version number
3. Add a change log
4. Update affected database, API, design, legal, and moderation documents
5. Do not allow undocumented changes to become permanent product policy

---

# 53. RECOMMENDED NEXT DOCUMENTS

Create these supporting documents after the master specification:

1. Database schema and migration plan
2. API contract
3. Permission matrix
4. Evidence and chain-of-custody policy
5. Moderation policy
6. Scorecard methodology
7. CivicFund financial policy
8. Privacy policy draft
9. Terms of service draft
10. Incident-response plan
11. Public-record template library
12. UX wireframes
13. MVP sprint plan
14. Pilot-jurisdiction data plan
15. Legal-review checklist

---

# 54. CHANGE LOG

## Version 1.0

Initial consolidated specification including:

- Product mission
- Government scorecards
- Official profiles
- Judge and prosecutor dashboards
- Court and case timelines
- Claims versus evidence
- Evidence Vault
- Public-record tools
- CivicFund
- Petitions
- Lawful civic action
- Replacement Tracker
- Vote Verification Hub
- Community investigations
- AI organization
- Anti-bot controls
- Credibility and reputation
- Moderation transparency
- Legal-risk reduction
- Database structure
- API structure
- Architecture
- Security
- Permissions
- MVP
- Roadmap
- Business model
- Governance
- Claude development instructions
