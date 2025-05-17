import React from 'react';

export default function WonderlandMascot({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="#ffe066" stroke="#ffb4a2" strokeWidth="8" />
      <ellipse cx="60" cy="70" rx="32" ry="28" fill="#fff" />
      <ellipse cx="45" cy="65" rx="6" ry="8" fill="#444" />
      <ellipse cx="75" cy="65" rx="6" ry="8" fill="#444" />
      <ellipse cx="60" cy="85" rx="12" ry="6" fill="#ffb4a2" />
      <ellipse cx="60" cy="90" rx="6" ry="2" fill="#fff" />
      <ellipse cx="60" cy="40" rx="18" ry="10" fill="#fff" />
      <ellipse cx="60" cy="38" rx="8" ry="4" fill="#ffe066" />
      <ellipse cx="60" cy="38" rx="3" ry="1.5" fill="#fff" />
      <ellipse cx="40" cy="38" rx="2" ry="1" fill="#fff" />
      <ellipse cx="80" cy="38" rx="2" ry="1" fill="#fff" />
    </svg>
  );
} 