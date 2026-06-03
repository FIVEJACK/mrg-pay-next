import type { SVGProps } from "react";

// Every icon used across the app. Single file for tree-shake-friendly named
// exports — bundlers drop the unused ones.

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReceiptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LoginIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M14 8l4 4-4 4M18 12H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InstantIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" />
    </svg>
  );
}

export function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="6.5" r="0.9" fill="currentColor" />
      <path d="M10 9.5v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2.5l8.5 3v6.2c0 5-3.5 8.6-8.5 9.8-5-1.2-8.5-4.8-8.5-9.8V5.5L12 2.5z"
        fill="#1111A8"
      />
      <path
        d="M8.5 12.2l2.3 2.3 4.7-4.7"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 12l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="6" cy="6" r="4" />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3l10 18H2L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path
        d="M12 10v4M12 17.5h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 13a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1M14 11a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaperclipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 11l-9 9a5 5 0 01-7-7l9-9a3 3 0 014 4l-9 9a1 1 0 01-2-2l8-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 11l18-7-7 18-2-7-9-4z" />
    </svg>
  );
}

export function DotsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  );
}

export function HeadsetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 14v-2a8 8 0 0116 0v2M4 14h3v6H6a2 2 0 01-2-2v-4zM20 14h-3v6h1a2 2 0 002-2v-4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TimerRoundedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 14" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10.6887 4.26L11.1887 3.76C11.442 3.50667 11.4487 3.08667 11.1887 2.82667L11.182 2.82C10.922 2.56 10.5087 2.56667 10.2487 2.82L9.74869 3.32C8.71535 2.49333 7.41535 2 6.00202 2C2.80202 2 0.0820199 4.64 0.00201991 7.84C-0.0846468 11.2267 2.62869 14 6.00202 14C9.32202 14 12.002 11.3133 12.002 8C12.002 6.58667 11.5087 5.28667 10.6887 4.26ZM6.66869 8C6.66869 8.36667 6.36869 8.66667 6.00202 8.66667C5.63535 8.66667 5.33535 8.36667 5.33535 8V5.33333C5.33535 4.96667 5.63535 4.66667 6.00202 4.66667C6.36869 4.66667 6.66869 4.96667 6.66869 5.33333V8Z"
        fill="currentColor"
      />
      <path
        d="M4.66862 1.33333H7.33529C7.70195 1.33333 8.00195 1.03333 8.00195 0.666667C8.00195 0.3 7.70195 0 7.33529 0H4.66862C4.30195 0 4.00195 0.3 4.00195 0.666667C4.00195 1.03333 4.30195 1.33333 4.66862 1.33333Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CheckCircleRounded(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6.66667 0C2.98667 0 0 2.98667 0 6.66667C0 10.3467 2.98667 13.3333 6.66667 13.3333C10.3467 13.3333 13.3333 10.3467 13.3333 6.66667C13.3333 2.98667 10.3467 0 6.66667 0ZM4.86 9.52667L2.46667 7.13333C2.20667 6.87333 2.20667 6.45333 2.46667 6.19333C2.72667 5.93333 3.14667 5.93333 3.40667 6.19333L5.33333 8.11333L9.92 3.52667C10.18 3.26667 10.6 3.26667 10.86 3.52667C11.12 3.78667 11.12 4.20667 10.86 4.46667L5.8 9.52667C5.54667 9.78667 5.12 9.78667 4.86 9.52667Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CheckRounded(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 9" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3.44833 6.775L1.135 4.46167C0.875 4.20167 0.455 4.20167 0.195 4.46167C-0.065 4.72167 -0.065 5.14167 0.195 5.40167L2.98167 8.18833C3.24167 8.44833 3.66167 8.44833 3.92167 8.18833L10.975 1.135C11.235 0.875 11.235 0.455 10.975 0.195C10.715 -0.065 10.295 -0.065 10.035 0.195L3.44833 6.775Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MultiRealmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 2499.39 560.57" fill="none" aria-hidden="true" {...props}>
      <path d="M992.89 367.67v192.89H800V367.67z" fill="#00b277" />
      <path d="M616.26 560.56H426.65c-20.74-35.92-25.92-44.9-46.66-80.82L656.98 0h189.61c20.74 35.92 25.92 44.9 46.66 80.82L616.27 560.57Z" fill="#00b277" />
      <path d="M236.26 560.56H46.66C25.92 524.64 20.74 515.66 0 479.74L276.98 0h189.61c20.74 35.92 25.92 44.9 46.66 80.82L236.27 560.57Z" fill="currentColor" />
      <path d="M1247.5.58h84c9.6 0 18.6 6.6 20.7 15.9l35.4 142.8c1.2 4.8 6 3.9 8.7 3.9 3.3 0 5.4-1.2 6-3.9l35.4-142.8c2.1-9.3 11.1-15.9 20.4-15.9h84.3c5.7 0 10.5 4.8 10.5 10.5v189c0 5.7-4.8 10.5-10.5 10.5h-31.5c-5.7 0-10.5-4.8-10.5-10.5v-147c0-5.1-4.8-5.4-6.9-5.4-.9 0-2.7.3-4.2.3-3.6 0-5.7 1.2-6.3 3.9l-35.4 142.8c-2.4 9.3-10.8 15.9-20.4 15.9h-64.5c-9.6 0-18-6.6-20.4-15.9l-35.7-142.8c-1.2-4.2-5.1-4.2-6.3-4.2s-3 .3-4.5.3c-3.6 0-6.3 1.8-6.3 5.1v147c0 5.7-4.8 10.5-10.5 10.5h-31.5c-5.7 0-10.5-4.8-10.5-10.5v-189c0-5.7 4.8-10.5 10.5-10.5" fill="currentColor" />
      <path d="M1576.9 158.08v-147c0-5.7 4.8-10.5 10.5-10.5h31.5c5.7 0 10.5 4.8 10.5 10.5v126c0 14.4 11.7 26.1 26.1 26.1h65.4c14.4 0 26.1-11.7 26.1-26.1v-126c0-5.7 5.1-10.5 10.8-10.5h31.2c5.7 0 10.5 4.8 10.5 10.5v147c0 29.1-23.4 52.5-52.5 52.5h-117.6c-21.6 0-40.5-12.9-48.3-32.1-2.7-6.3-4.2-13.2-4.2-20.4" fill="currentColor" />
      <path d="M1834 .58h31.5c5.7 0 10.5 4.8 10.5 10.5v141.9c0 5.7 4.5 10.2 10.5 10.2h87c6 0 10.8 4.8 10.8 10.8v26.1c0 5.7-5.1 10.5-10.8 10.5H1834c-5.7 0-10.5-4.8-10.5-10.5v-189c0-5.7 4.8-10.5 10.5-10.5" fill="currentColor" />
      <path d="M1966 .58h209.1c5.7 0 10.5 4.8 10.5 10.5v26.4c0 5.7-4.8 10.5-10.5 10.5h-67.8c-5.7 0-10.5 4.8-10.5 10.5v141.6c0 5.7-4.8 10.5-10.5 10.5h-31.5c-5.7 0-10.5-4.8-10.5-10.5V58.48c0-5.7-4.8-10.5-10.5-10.5H1966c-5.7 0-10.5-4.8-10.5-10.5v-26.4c0-5.7 4.8-10.5 10.5-10.5" fill="currentColor" />
      <path d="M2220.09.58h31.5c5.7 0 10.5 4.8 10.5 10.5v189c0 5.7-4.8 10.5-10.5 10.5h-31.5c-5.7 0-10.5-4.8-10.5-10.5v-189c0-5.7 4.8-10.5 10.5-10.5" fill="currentColor" />
      <path d="M1237 361.06c0-5.7 4.8-10.5 10.5-10.5h149.4c28.8 0 52.2 23.4 52.2 52.5v26.7c0 18.9-7.8 33.3-23.1 43.5-3.6 2.4-5.4 4.5-5.4 6 0 10.2 38.4 59.4 38.4 72.3 0 4.8-4.5 9-10.2 9h-40.2c-3.6 0-7.5-2.1-9-5.4l-36-67.8c-1.5-2.7-5.4-4.8-9-4.8H1300c-6 0-10.5 4.5-10.5 10.2v57.3c0 5.7-4.8 10.5-10.5 10.5h-31.5c-5.7 0-10.5-4.8-10.5-10.5zm52.5 47.4v16.2c0 5.7 4.8 10.5 10.5 10.5h86.1c5.7 0 10.8-4.8 10.8-10.5v-16.2c0-5.7-5.1-10.5-10.8-10.5H1300c-2.7 0-5.1.9-7.2 3s-3.3 4.8-3.3 7.5" fill="currentColor" />
      <path d="M1483 550.06v-189c0-5.7 4.8-10.5 10.5-10.5h183.3c5.7 0 10.5 4.8 10.5 10.5v26.4c0 5.7-4.8 10.5-10.5 10.5H1546c-9 0-10.5 6.9-10.5 12.3v4.8c0 8.1 4.2 13.8 10.5 13.8h116.1c6 0 10.8 4.5 10.8 10.5v26.4c0 5.7-4.8 10.2-10.8 10.2H1546c-10.2 0-10.8 10.8-10.8 15.9 0 1.8.3 6 .3 9.3 0 7.2 4.2 12 10.5 12h137.7c6 0 10.8 4.8 10.8 10.8v26.1c0 5.7-5.1 10.5-10.8 10.5h-190.2c-2.7 0-5.1-1.2-7.2-3.3s-3.3-4.5-3.3-7.2" fill="currentColor" />
      <path d="M1718.49 548.26c0-.3.3-1.2.6-2.1l71.4-185.1c2.4-6.3 8.4-10.5 14.7-10.5h82.8c6.3 0 12.3 4.2 14.7 10.5l71.4 185.1c.3.9.6 1.8.6 2.1v1.8c0 5.7-4.5 10.5-10.5 10.5h-36.6c-20.4 0-10.5-50.1-30.9-50.1h-100.2c-20.4 0-10.5 50.1-30.9 50.1h-36.6c-5.7 0-10.5-4.8-10.5-10.5zm96.91-85.2h62.4c2.4 0 5.4-1.8 5.4-3.9 0-3.9-18.3-50.1-18.9-52.2-2.4-6-5.7-9-10.2-9h-15c-4.5 0-7.2 3.3-9.9 9-1.5 2.7-3 6.9-5.1 12.6-6 15.9-14.1 37.8-14.1 39.6 0 2.1 3 3.9 5.4 3.9" fill="currentColor" />
      <path d="M2009.19 350.56h31.5c5.7 0 10.5 4.8 10.5 10.5v141.9c0 5.7 4.5 10.2 10.5 10.2h87c6 0 10.8 4.8 10.8 10.8v26.1c0 5.7-5.1 10.5-10.8 10.5h-139.5c-5.7 0-10.5-4.8-10.5-10.5v-189c0-5.7 4.8-10.5 10.5-10.5" fill="currentColor" />
      <path d="M2193.99 350.56h84c9.6 0 18.6 6.6 20.7 15.9l35.4 142.8c1.2 4.8 6 3.9 8.7 3.9 3.3 0 5.4-1.2 6-3.9l35.4-142.8c2.1-9.3 11.1-15.9 20.4-15.9h84.3c5.7 0 10.5 4.8 10.5 10.5v189c0 5.7-4.8 10.5-10.5 10.5h-31.5c-5.7 0-10.5-4.8-10.5-10.5v-147c0-5.1-4.8-5.4-6.9-5.4-.9 0-2.7.3-4.2.3-3.6 0-5.7 1.2-6.3 3.9l-35.4 142.8c-2.4 9.3-10.8 15.9-20.4 15.9h-64.5c-9.6 0-18-6.6-20.4-15.9l-35.7-142.8c-1.2-4.2-5.1-4.2-6.3-4.2s-3 .3-4.5.3c-3.6 0-6.3 1.8-6.3 5.1v147c0 5.7-4.8 10.5-10.5 10.5h-31.5c-5.7 0-10.5-4.8-10.5-10.5v-189c0-5.7 4.8-10.5 10.5-10.5" fill="currentColor" />
    </svg>
  );
}