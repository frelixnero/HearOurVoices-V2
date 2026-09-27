// Identity / residency verification seam (spec §6.3, §22.2, §32). Only an
// encrypted reference is ever stored — never raw ID images (§32). The dev provider
// auto-approves so the "become a Verified Citizen" flow works locally; a real
// vendor (Stripe Identity, Persona, etc.) drops in behind this interface.
export interface StartResult {
  reference: string;
  redirectUrl?: string; // where a real vendor would send the user
}
export interface CheckResult {
  status: 'approved' | 'pending' | 'rejected';
  verifiedName?: string;
  verifiedJurisdiction?: string;
}

export interface IdentityProvider {
  start(userId: string): Promise<StartResult>;
  check(reference: string): Promise<CheckResult>;
}

export class MockIdentityProvider implements IdentityProvider {
  async start(userId: string): Promise<StartResult> {
    return { reference: `mock_kyc_${userId}_${Date.now()}` };
  }
  async check(_reference: string): Promise<CheckResult> {
    // Dev: auto-approve. A real vendor returns the true status from a webhook/poll.
    return { status: 'approved', verifiedName: 'Verified Resident' };
  }
}

export function identityProvider(): IdentityProvider {
  // Only 'mock' implemented; wire 'persona'/'stripe_identity' here in prod.
  return new MockIdentityProvider();
}
