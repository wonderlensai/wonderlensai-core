import React from 'react';

const WonderlandMascot = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#FFD93D" stroke="#6C63FF" strokeWidth="4" />
    <ellipse cx="32" cy="40" rx="16" ry="10" fill="#FFF" opacity="0.7" />
    <ellipse cx="24" cy="28" rx="4" ry="6" fill="#6C63FF" />
    <ellipse cx="40" cy="28" rx="4" ry="6" fill="#6C63FF" />
    <ellipse cx="24" cy="30" rx="1.2" ry="2" fill="#fff" />
    <ellipse cx="40" cy="30" rx="1.2" ry="2" fill="#fff" />
    <path d="M26 44 Q32 50 38 44" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="32" cy="18" rx="6" ry="2.5" fill="#FFD93D" stroke="#6C63FF" strokeWidth="1.5" />
  </svg>
);

export default WonderlandMascot; 