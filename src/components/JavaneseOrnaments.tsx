import React from 'react';

export const GununganMotif: React.FC<{ className?: string }> = ({ className = 'w-12 h-16' }) => (
  <svg
    viewBox="0 0 80 112"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M40 4C34 18 22 30 14 48C8 62 8 80 16 94H64C72 80 72 62 66 48C58 30 46 18 40 4Z"
      stroke="currentColor"
      strokeWidth="1.35"
    />
    <path
      d="M40 14C35.5 26 27 37 21 51C16.5 62 16.5 76 23 88H57C63.5 76 63.5 62 59 51C53 37 44.5 26 40 14Z"
      stroke="currentColor"
      strokeWidth="0.95"
      strokeOpacity="0.72"
    />
    <path
      d="M40 24V88M28 58C34 52 46 52 52 58M23 72C31 64 49 64 57 72M31 44C35 40 45 40 49 44"
      stroke="currentColor"
      strokeWidth="1.05"
      strokeLinecap="round"
    />
    <circle cx="40" cy="34" r="2.5" fill="currentColor" fillOpacity="0.8" />
    <circle cx="40" cy="50" r="4" stroke="currentColor" strokeWidth="1.15" />
    <path d="M10 100H70M20 106H60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const KawungDivider: React.FC<{ className?: string }> = ({ className = 'w-48 h-6' }) => (
  <svg
    viewBox="0 0 260 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 14H86M174 14H254" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.45" />
    <circle cx="130" cy="14" r="8" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="130" cy="14" r="2.4" fill="currentColor" />
    <path
      d="M112 14C116 9.5 121 9.5 122 14C121 18.5 116 18.5 112 14ZM148 14C144 9.5 139 9.5 138 14C139 18.5 144 18.5 148 14Z"
      stroke="currentColor"
      strokeWidth="1.1"
    />
    <path
      d="M96 14C99 11 103 11 104 14C103 17 99 17 96 14ZM164 14C161 11 157 11 156 14C157 17 161 17 164 14Z"
      stroke="currentColor"
      strokeWidth="0.95"
      strokeOpacity="0.7"
    />
  </svg>
);

export const UkiranCorner: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M4 34V12C4 7.58172 7.58172 4 12 4H34"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M10 25V14C10 11.7909 11.7909 10 14 10H25"
      stroke="currentColor"
      strokeWidth="0.95"
      strokeOpacity="0.6"
      strokeLinecap="round"
    />
    <circle cx="10" cy="10" r="2" fill="currentColor" />
    <circle cx="34" cy="4" r="1.3" fill="currentColor" fillOpacity="0.65" />
    <circle cx="4" cy="34" r="1.3" fill="currentColor" fillOpacity="0.65" />
  </svg>
);

export const BatikKawungPattern: React.FC<{
  id?: string;
  className?: string;
}> = ({ id = 'kawung-pattern', className = 'opacity-[0.045]' }) => (
  <svg
    className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
        <circle cx="32" cy="32" r="2.2" fill="currentColor" />
        <ellipse cx="32" cy="16" rx="6" ry="12" stroke="currentColor" strokeWidth="1" fill="none" />
        <ellipse cx="32" cy="48" rx="6" ry="12" stroke="currentColor" strokeWidth="1" fill="none" />
        <ellipse cx="16" cy="32" rx="12" ry="6" stroke="currentColor" strokeWidth="1" fill="none" />
        <ellipse cx="48" cy="32" rx="12" ry="6" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="0" cy="0" r="4" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <circle cx="64" cy="0" r="4" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <circle cx="0" cy="64" r="4" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <circle cx="64" cy="64" r="4" stroke="currentColor" strokeWidth="0.8" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>
);

export const CoupleMonogramCrest: React.FC<{
  groomInitial: string;
  brideInitial: string;
  className?: string;
}> = ({ groomInitial, brideInitial, className = 'w-20 h-20' }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle cx="44" cy="44" r="41" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" />
      <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.65" />
      <path d="M44 2L47 7H41L44 2Z" fill="currentColor" fillOpacity="0.7" />
      <path d="M44 86L47 81H41L44 86Z" fill="currentColor" fillOpacity="0.7" />
    </svg>
    <span className="absolute font-serif text-lg font-semibold tracking-wider text-current">
      {groomInitial}&amp;{brideInitial}
    </span>
  </div>
);
