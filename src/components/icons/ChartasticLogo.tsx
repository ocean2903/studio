import type { SVGProps } from 'react';

export function ChartasticLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Chartastic Logo"
      {...props}
    >
      <path d="M4 12H7V20H4V12ZM10 8H13V20H10V8ZM16 4H19V20H16V4Z" fill="currentColor" />
    </svg>
  );
}
