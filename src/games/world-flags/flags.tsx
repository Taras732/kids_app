// Прості SVG-прапори (рендеряться на будь-якій ОС, на відміну від emoji-прапорів на Windows).
import type { ReactNode } from 'react';

function Frame({ code, children }: { code: string; children: ReactNode }) {
  const cid = `flagclip-${code}`;
  return (
    <svg viewBox="0 0 60 40" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label={code}>
      <defs>
        <clipPath id={cid}>
          <rect width="60" height="40" rx="4" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${cid})`}>{children}</g>
      <rect x="0.5" y="0.5" width="59" height="39" rx="4" fill="none" stroke="rgba(0,0,0,.14)" />
    </svg>
  );
}

function usStripes() {
  const out: ReactNode[] = [];
  for (let i = 0; i < 13; i++) {
    out.push(<rect key={i} y={(i * 40) / 13} width="60" height={40 / 13} fill={i % 2 === 0 ? '#B22234' : '#fff'} />);
  }
  return out;
}

const FLAGS: Record<string, ReactNode> = {
  UA: (<><rect width="60" height="20" fill="#0057B7" /><rect y="20" width="60" height="20" fill="#FFDD00" /></>),
  PL: (<><rect width="60" height="20" fill="#fff" /><rect y="20" width="60" height="20" fill="#DC143C" /></>),
  DE: (<><rect width="60" height="13.34" fill="#111" /><rect y="13.34" width="60" height="13.33" fill="#DD0000" /><rect y="26.67" width="60" height="13.33" fill="#FFCE00" /></>),
  FR: (<><rect width="20" height="40" fill="#0055A4" /><rect x="20" width="20" height="40" fill="#fff" /><rect x="40" width="20" height="40" fill="#EF4135" /></>),
  IT: (<><rect width="20" height="40" fill="#009246" /><rect x="20" width="20" height="40" fill="#fff" /><rect x="40" width="20" height="40" fill="#CE2B37" /></>),
  ES: (<><rect width="60" height="10" fill="#AA151B" /><rect y="10" width="60" height="20" fill="#F1BF00" /><rect y="30" width="60" height="10" fill="#AA151B" /></>),
  JP: (<><rect width="60" height="40" fill="#fff" /><circle cx="30" cy="20" r="10" fill="#BC002D" /></>),
  SE: (<><rect width="60" height="40" fill="#006AA7" /><rect x="17" width="7" height="40" fill="#FECC00" /><rect y="16.5" width="60" height="7" fill="#FECC00" /></>),
  US: (<><g>{usStripes()}</g><rect width="26" height="21.5" fill="#3C3B6E" /></>),
  CA: (<><rect width="60" height="40" fill="#fff" /><rect width="15" height="40" fill="#FF0000" /><rect x="45" width="15" height="40" fill="#FF0000" /><path d="M30 8 l2.5 6 6-1 -3 5 5 3 -6 1 1 6 -5.5 -4 -5.5 4 1 -6 -6 -1 5 -3 -3 -5 6 1z" fill="#FF0000" /></>),
  BR: (<><rect width="60" height="40" fill="#009B3A" /><polygon points="30,5 55,20 30,35 5,20" fill="#FEDF00" /><circle cx="30" cy="20" r="8" fill="#002776" /></>),
  GB: (
    <>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3" />
      <rect x="25" width="10" height="40" fill="#fff" />
      <rect y="15" width="60" height="10" fill="#fff" />
      <rect x="27" width="6" height="40" fill="#C8102E" />
      <rect y="17" width="60" height="6" fill="#C8102E" />
    </>
  ),
};

/** SVG-прапор за ISO-кодом (UA, PL, DE…). */
export function Flag({ code }: { code: string }) {
  return <Frame code={code}>{FLAGS[code] ?? <rect width="60" height="40" fill="#EEF0F7" />}</Frame>;
}
