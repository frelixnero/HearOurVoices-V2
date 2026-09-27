// hearOURvoices brand mark: a speech bubble with a red soundwave inside,
// beside the wordmark (OUR in red). `light` renders the bubble white for dark bars.
export function HovLogo({ light = true, size = 22 }: { light?: boolean; size?: number }) {
  const bubble = light ? '#ffffff' : '#0f1523';
  return (
    <span className={`hov-logo${light ? '' : ' dark'}`} style={{ fontSize: size }}>
      <svg width={size * 1.9} height={size * 1.9} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M6 9.5A4.5 4.5 0 0 1 10.5 5h19A4.5 4.5 0 0 1 34 9.5v13a4.5 4.5 0 0 1-4.5 4.5H16.5l-6.2 5.4A1 1 0 0 1 8.7 31.6V27h.3A4.5 4.5 0 0 1 6 22.5v-13Z"
          fill={bubble}
        />
        <g stroke="#e63329" strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="19" x2="12" y2="14" />
          <line x1="16" y1="21" x2="16" y2="11" />
          <line x1="20" y1="18" x2="20" y2="14" />
          <line x1="24" y1="22" x2="24" y2="10" />
          <line x1="28" y1="19" x2="28" y2="15" />
        </g>
      </svg>
      <span>
        <span className="lo-hear">hear</span>
        <span className="lo-our">OUR</span>
        <span className="lo-voices">voices</span>
      </span>
    </span>
  );
}
