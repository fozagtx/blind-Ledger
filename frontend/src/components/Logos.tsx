// Inline SVG logos for partner / infra credit on the trust bar.
// Stored locally to avoid hotlinking issues.

export function ArbitrumLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 2500 2500" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Arbitrum">
      <circle cx="1250" cy="1250" r="1250" fill="#213147" />
      <path
        d="M1567 1740l-141 -394 -354 619h-218l517 -871 36-62c14-22 40-35 67-35 27 0 53 13 67 35l589 988h-218l-345-280z"
        fill="#12AAFF"
      />
      <path
        d="M1839 1844c-12 6-26 9-39 9h-274l-89-249 110-188 292 428z"
        fill="#9DCCED"
      />
      <path
        d="M1015 920c14-22 40-35 67-35h360l-389 668-218-377c-14-22-14-49 0-71l180-185z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function FhenixLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Fhenix">
      <defs>
        <linearGradient id="fhenix-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF6B35" />
          <stop offset="1" stopColor="#F7B500" />
        </linearGradient>
      </defs>
      <path
        d="M50 8c-8 18-18 26-30 36 0 22 14 40 30 48 16-8 30-26 30-48-12-10-22-18-30-36z"
        fill="url(#fhenix-g)"
      />
      <path
        d="M50 32c-3 7-8 11-14 16 0 11 7 19 14 23 7-4 14-12 14-23-6-5-11-9-14-16z"
        fill="#FFE5B0"
        opacity="0.4"
      />
    </svg>
  );
}

export function UsdcLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="USDC">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path
        d="M20.5 18.5c0-2.4-1.4-3.2-4.3-3.5-2-.3-2.4-.8-2.4-1.6 0-.8.6-1.4 1.9-1.4 1.1 0 1.7.4 2 1.3.1.2.3.4.5.4h1c.3 0 .5-.2.5-.5v-.1c-.3-1.4-1.4-2.4-2.9-2.7v-1.5c0-.3-.2-.5-.6-.5h-.9c-.3 0-.5.2-.5.5v1.5c-2 .3-3.3 1.6-3.3 3.3 0 2.3 1.4 3.1 4.2 3.5 1.9.3 2.5.7 2.5 1.7 0 1-.9 1.7-2.1 1.7-1.7 0-2.2-.7-2.4-1.6-.1-.3-.3-.4-.5-.4h-1.1c-.3 0-.5.2-.5.5v.1c.3 1.6 1.3 2.7 3.4 3v1.5c0 .3.2.5.6.5h.9c.3 0 .5-.2.5-.5v-1.5c2-.3 3.4-1.7 3.4-3.6z"
        fill="#FFFFFF"
      />
      <path
        d="M12.5 25.5c-5.2-1.9-7.9-7.7-6-12.9 1-2.7 3.1-4.8 5.8-5.8.3-.1.5-.4.5-.7v-1c0-.2-.1-.4-.3-.5h-.2c-6.3 2-9.8 8.7-7.8 15 1.2 3.7 4.1 6.6 7.8 7.8.3.1.6 0 .7-.3.1-.1.1-.2.1-.3v-1c0-.2-.2-.4-.5-.5l-.1.2zm7-26.4c-.3-.1-.6 0-.7.3-.1.1-.1.2-.1.3v1c0 .2.2.4.5.5 5.2 1.9 7.9 7.7 6 12.9-1 2.7-3.1 4.8-5.8 5.8-.3.1-.5.4-.5.7v1c0 .2.1.4.3.5h.2c6.3-2 9.8-8.7 7.8-15-1.2-3.7-4.1-6.6-7.8-7.8z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
