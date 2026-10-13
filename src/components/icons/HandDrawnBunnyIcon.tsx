import React from 'react';

export function HandDrawnBunnyIcon({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hand-drawn style bunny head */}
      <path 
        d="M30 40 C 20 10, 40 10, 45 40 M55 40 C 60 10, 80 10, 70 40" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M25 50 C 25 35, 75 35, 75 50 C 75 75, 25 75, 25 50 Z" 
        fill="white"
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
      {/* Eyes */}
      <circle cx="40" cy="55" r="2" fill="currentColor" />
      <circle cx="60" cy="55" r="2" fill="currentColor" />
      {/* Nose/Mouth */}
      <path d="M48 62 L50 64 L52 62 M50 64 L50 67" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Whiskers */}
      <path d="M35 60 L25 58 M35 63 L25 65 M65 60 L75 58 M65 63 L75 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Little paws */}
      <path d="M40 75 C 40 85, 45 85, 45 75 M55 75 C 55 85, 60 85, 60 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
