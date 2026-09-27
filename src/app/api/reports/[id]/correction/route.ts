import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { correctionSchema } from '@/lib/validation/reports';
import { issueCorrection } from '@/lib/reports/service';
import { prisma } from '@/lib/db/client';
import { ok, fail } from '@/lib/http/responses';

// Issue a voluntary correction on your own report (counts positively toward your
// record — honesty is rewarded, not punished).
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in to correct your report.', 401);
  const report = await prisma.communityReport.findUniqueOrThrow({ where: { id: ctx.params.id } });
  if (report.authorUserId !== user.id) {
    return fail('permission_denied', 'Only the author can voluntarily correct a report.', 403);
  }
  const body = correctionSchema.parse(await req.json());
  const correction = await issueCorrection({
    reportId: ctx.params.id, correctedByUserId: user.id, note: body.note, voluntary: true,
  });
  return ok({ id: correction.id }, { status: 201 });
});
