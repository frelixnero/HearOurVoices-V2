// File malware/safety scan (spec §31 pipeline step 3, §32). This is a pluggable
// seam: the dev scanner does cheap checks (size limit + the industry-standard
// EICAR antivirus test signature). In staging/prod, wire SCAN_PROVIDER to a real
// engine (ClamAV daemon, VirusTotal, or a cloud scanner) behind this same call.
export interface ScanResult {
  clean: boolean;
  reason?: string;
}

const MAX_BYTES = 50 * 1024 * 1024; // 50MB dev cap
// EICAR standard antivirus test string — safe, universally used to test scanners.
const EICAR = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

export async function scanBytes(bytes: Buffer, filename?: string): Promise<ScanResult> {
  if (bytes.length === 0) return { clean: false, reason: 'Empty file.' };
  if (bytes.length > MAX_BYTES) return { clean: false, reason: 'File is too large.' };

  const provider = process.env.SCAN_PROVIDER ?? 'dev';
  if (provider === 'dev') {
    if (bytes.includes(Buffer.from(EICAR))) {
      return { clean: false, reason: 'File failed the malware scan.' };
    }
    return { clean: true };
  }
  // e.g. provider === 'clamav' | 'virustotal' — implement here with the real API.
  throw new Error(`SCAN_PROVIDER "${provider}" is not implemented. Set SCAN_PROVIDER=dev for local use.`);
}
