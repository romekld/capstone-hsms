interface Cho2LogoProps {
  className?: string;
  title?: string;
}

export function Cho2Logo({ className, title = 'CHO2 logo' }: Cho2LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cho2-logo-bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F8F67" />
          <stop offset="1" stopColor="#11A77A" />
        </linearGradient>
        <linearGradient id="cho2-logo-shine" x1="18" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.24" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id="cho2-logo-shadow" x="4" y="4" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#065F46" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter="url(#cho2-logo-shadow)">
        <rect x="8" y="8" width="48" height="48" rx="14" fill="url(#cho2-logo-bg)" />
        <rect x="8" y="8" width="48" height="48" rx="14" fill="url(#cho2-logo-shine)" />
      </g>
      <path
        d="M17 34H24L28.5 25L32.75 39L37.75 28.5L40.5 34H47"
        stroke="white"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
