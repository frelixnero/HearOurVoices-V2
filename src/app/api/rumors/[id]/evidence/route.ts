import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { rumorEvidenceSchema } from '@/lib/validation/rumors';
import { addRumorEvidence } from '@/lib/rumors/service';
import { ok, fail } from '@/lib/http/responses';
import { rumorsEnabled } from '@/lib/flags';

// Add supporting/refuting evidence to a rumor (a note + optional source link).
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  if (!rumorsEnabled()) return fail('not_found', 'Not found.', 404);
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in to add evidence.', 401);
  const body = rumorEvidenceSchema.parse(await req.json());
  const ev = await addRumorEvidence({
    rumorId: ctx.params.id,
    userId: user.id,
    displayName: user.displayName,
    anonymous: body.anonymous,
    stance: body.stance,
    note: body.note,
    url: body.url,
  });
  return ok({ id: ev.id }, { status: 201 });
});
