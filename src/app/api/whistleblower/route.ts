import { handle } from '@/lib/http/route';
import { tipSchema } from '@/lib/validation/whistleblower';
import { submitTip } from '@/lib/whistleblower/service';
import { whistleblowerEnabled } from '@/lib/whistleblower/crypto';
import { ok, ApiError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Public, anonymous submission. We deliberately read ONLY the message body —
// never the IP, headers, or any identifying request data. Nothing about the
// sender is stored.
export const POST = handle(async (req: Request) => {
  if (!whistleblowerEnabled()) {
    throw new ApiError('conflict', 'The secure tip line is being set up and isn’t accepting submissions yet. Please check back soon.');
  }
  const { message, category } = tipSchema.parse(await req.json());
  await submitTip(message, category);
  return ok({ received: true }, { status: 201 });
});
