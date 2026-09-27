// Brand mark (spec §36): a speech bubble containing a rising soundwave — "voices
// being heard, rising toward accountability." Uses currentColor so it adapts.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M6 8.5A4.5 4.5 0 0 1 10.5 4h19A4.5 4.5 0 0 1 34 8.5v15a4.5 4.5 0 0 1-4.5 4.5H18l-7.5 6.5a1 1 0 0 1-1.66-.75V28h-.34A4.5 4.5 0 0 1 6 23.5v-15Z"
        fill="currentColor"
      />
      <g stroke="#fff" strokeWidth="2.1" strokeLinecap="round">
        <line x1="13" y1="19" x2="13" y2="13" />
        <line x1="18" y1="21" x2="18" y2="10" />
        <line x1="23" y1="19" x2="23" y2="14" />
        <line x1="28" y1="21" x2="28" y2="11" />
      </g>
    </svg>
  );
}

export function Wordmark({ withMark = true, size = 20 }: { withMark?: boolean; size?: number }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      {withMark && (
        <span className="wordmark-mark" style={{ color: 'var(--red)' }}>
          <LogoMark size={size * 1.7} />
        </span>
      )}
      <span className="wordmark-text">
        Hear<span className="wordmark-our">OUR</span>VOICES
      </span>
    </span>
  );
}
