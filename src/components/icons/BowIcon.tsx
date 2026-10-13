import React from 'react';

export function BowIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 9.5C12 9.5 11 6.5 8 6.5C5 6.5 4 8.5 4 10.5C4 12.5 5.5 13.5 8 13.5C10.5 13.5 12 12.5 12 12.5M12 9.5C12 9.5 13 6.5 16 6.5C19 6.5 20 8.5 20 10.5C20 12.5 18.5 13.5 16 13.5C13.5 13.5 12 12.5 12 12.5M12 9.5V12.5M12 12.5L10 17.5M12 12.5L14 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="12" cy="11.5" r="1.5" fill="currentColor"/>
    </svg>
  );
}
