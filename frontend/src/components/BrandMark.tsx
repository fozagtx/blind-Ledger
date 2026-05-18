// Blind Ledger brand mark.
//
// Concept: a frosted card holding two "ledger lines" intersected by a wax-seal
// medallion. The two lines read as a ledger entry; the centered medallion reads
// as "sealed", both meanings in one glyph. Scales cleanly from 16px to 96px.

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, { box: number; rx: number; logoCls: string }> = {
  sm: { box: 28, rx: 8, logoCls: "h-7 w-7" },
  md: { box: 36, rx: 10, logoCls: "h-9 w-9" },
  lg: { box: 56, rx: 14, logoCls: "h-14 w-14" },
};

export function BlindLedgerMark({ size = "md", className }: { size?: Size; className?: string }) {
  const s = sizes[size];
  return (
    <svg
      viewBox="0 0 32 32"
      className={`${s.logoCls} ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Blind Ledger"
    >
      <defs>
        <linearGradient id="bl-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D7E7FE" />
        </linearGradient>
        <linearGradient id="bl-seal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0044B9" />
          <stop offset="60%" stopColor="#2670DC" />
          <stop offset="100%" stopColor="#4EB1FF" />
        </linearGradient>
        <radialGradient id="bl-highlight" cx="0.35" cy="0.35" r="0.5">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Frosted container */}
      <rect
        width="32"
        height="32"
        rx={s.rx}
        fill="url(#bl-bg)"
        stroke="rgba(0,34,89,0.12)"
        strokeWidth="0.5"
      />
      {/* Two ledger lines */}
      <rect x="6" y="10.5" width="20" height="1.8" rx="0.9" fill="#002259" />
      <rect x="6" y="19.7" width="20" height="1.8" rx="0.9" fill="#002259" />
      {/* Wax-seal medallion (the "sealed" middle) */}
      <circle cx="16" cy="16" r="4.2" fill="url(#bl-seal)" />
      <circle cx="16" cy="16" r="4.2" fill="url(#bl-highlight)" />
      <circle cx="16" cy="16" r="1.5" fill="#FFFFFF" opacity="0.95" />
    </svg>
  );
}

export function BlindLedgerWordmark({
  size = "md",
  tagline,
  className,
}: {
  size?: Size;
  tagline?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <BlindLedgerMark size={size} />
      <div>
        <div
          className="font-semibold text-navy display-tight leading-none"
          style={{ fontSize: size === "lg" ? 24 : size === "md" ? 18 : 15 }}
        >
          Blind Ledger
        </div>
        {tagline ? (
          <div className="text-[11px] text-neutral-700 mt-0.5 leading-tight">{tagline}</div>
        ) : null}
      </div>
    </div>
  );
}
