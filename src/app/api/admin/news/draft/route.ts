import { z } from 'zod';
import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { draftBreakdown, newsDraftEnabled } from '@/lib/civic/draft';
import { ACTION_TYPES } from '@/lib/civic/labels';
import { ok, ApiError } from '@/lib/http/responses';
import type { ActionType } from '@/lib/civic/labels';

export const dynamic = 'force-dynamic';

const schema = z.object({
  rawText: z.string().min(40, 'Paste more of the source text (at least a paragraph).').max(12000),
  actionType: z.enum(ACTION_TYPES).optional(),
});

// Staff-only. Drafts a plain-language breakdown for review — never publishes.
export const POST = handle(async (req: Request) => {
  await requireModerator();
  if (!newsDraftEnabled()) {
    throw new ApiError('conflict', 'AI draft-assist isn’t connected yet. Add XAI_API_KEY in Vercel to enable it.');
  }
  const { rawText, actionType } = schema.parse(await req.json());
  const draft = await draftBreakdown(rawText, actionType as ActionType | undefined);
  return ok({ draft });
});
