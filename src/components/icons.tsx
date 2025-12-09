import type { SVGProps } from 'react';

export function ShiraPayLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 10h18" />
      <path d="M3 14h18" />
      <path d="M16 6l-4 4-4-4" />
      <path d="M8 18l4-4 4 4" />
    </svg>
  );
}
