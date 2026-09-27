import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { rateLimit } from '@/lib/http/rate-limit';
import { citizenReportSchema, journalistReportSchema } from '@/lib/validation/reports';
import { submitCitizenReport, submitJournalistReport, listReports } from '@/lib/reports/service';
import { isJournalist } from '@/lib/reports/journalist';
import { ok, fail, paginated } from '@/lib/http/responses';
import type { ClaimStatus } from '@/lib/reports/labels';

export const dynamic = 'force-dynamic';

// Public feed. Filter by lane (citizen | journalist) and optional claim status.
export const GET = handle(async (req) => {
  const url = new URL(req.url);
  const laneParam = url.searchParams.get('lane');
  const lane = laneParam === 'CITIZEN' || laneParam === 'JOURNALIST' ? laneParam : undefined;
  const { items, nextCursor } = await listReports({
    lane,
    status: (url.searchParams.get('status') as ClaimStatus) ?? undefined,
    cursor: url.searchParams.get('cursor'),
  });
  const shaped = items.map((r) => ({
    id: r.id, lane: r.lane, displayName: r.displayName, label: r.label,
    claimStatus: r.claimStatus, title: r.title, body: r.body, topic: r.topic,
    whyImportant: r.whyImportant, neutralityFlags: r.neutralityFlags, createdAt: r.createdAt,
  }));
  return paginated(shaped, { nextCursor });
});

// Submit to a lane. Citizen lane is open to any signed-in user; the Journalist
// lane requires a qualified (isJournalist) contributor.
export const POST = handle(async (req) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Please sign in to post.', 401);
  const rl = rateLimit(`creport:${user.id}`, { limit: 8, windowMs: 60_000 });
  if (!rl.allowed) return fail('rate_limited', 'You’re posting quickly — try again shortly.', 429);

  const raw = await req.json();

  if (raw?.lane === 'JOURNALIST') {
    if (!(await isJournalist(user.id))) {
      return fail('permission_denied', 'The Independent Civic Journalist lane is for qualified contributors. Build a record in Citizen Reports first, then apply.', 403);
    }
    const body = journalistReportSchema.parse(raw);
    const { report, held, neutrality } = await submitJournalistReport({ authorUserId: user.id, ...body });
    return ok({
      id: report.id, lane: 'JOURNALIST', held, neutralityFlags: neutrality.flags,
      message: held ? 'Received — held for a safety review before publishing.'
        : neutrality.flags.length ? 'Published. We flagged some wording for transparency.'
        : 'Published. Thank you for reporting to the standard.',
    }, { status: 201 });
  }

  const body = citizenReportSchema.parse(raw);
  const { report, held } = await submitCitizenReport({
    authorUserId: user.id, displayName: user.displayName,
    anonymous: body.anonymous, label: body.label, title: body.title,
    body: body.body, topic: body.topic, sourceUrl: body.sourceUrl || undefined,
  });
  return ok({
    id: report.id, lane: 'CITIZEN', held,
    message: held ? 'Received — held for a safety review before it appears.'
      : 'Posted. It’s labeled and starts as “Unreviewed” — no accuracy grade until it can be checked.',
  }, { status: 201 });
});
