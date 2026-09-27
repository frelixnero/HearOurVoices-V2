import { handle } from '@/lib/http/route';
import { currentViewer } from '@/lib/permissions/viewer';
import { resolveEvidenceAccess } from '@/lib/evidence/service';
import { ok, fail } from '@/lib/http/responses';

// Resolve a signed download URL for the correct copy. Non-privileged/anonymous
// viewers only ever receive the redacted public copy; originals require legal/
// admin + MFA (§14.4, §32). Denied requests return 403.
export const GET = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const viewer = await currentViewer();
  const access = await resolveEvidenceAccess(ctx.params.id, viewer);
  if (access.copy === 'none') {
    return fail('permission_denied', 'You cannot access this evidence.', 403);
  }
  return ok({ copy: access.copy, url: access.url });
});
