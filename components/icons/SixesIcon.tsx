import type { SVGProps } from 'react';

export function SixesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.228 6.066a5.5 5.5 0 1 0-7.013 7.012A5.5 5.5 0 1 0 15.228 6.066Z" />
      <path d="M16.83 9.819a5.556 5.556 0 0 0 1.098-.835 5.5 5.5 0 1 0-7.013 7.012 5.556 5.556 0 0 0 .836-1.098m5.28-6.796a5.556 5.556 0 0 0-1.098.836L8.92 15.97a5.556 5.556 0 0 0-.835 1.098" />
      <circle cx="7.5" cy="7.5" r="1" />
      <circle cx="16.5" cy="7.5" r="1" />
      <circle cx="7.5" cy="16.5" r="1" />
      <circle cx="16.5" cy="16.5" r="1" />
      <circle cx="12" cy="4.5" r="1" />
      <circle cx="12" cy="19.5" r="1" />
    </svg>
  );
}
