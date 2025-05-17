import React from 'react';

export default function PlayfulCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-white via-yellow-50 to-pink-50 shadow-2xl p-6 border-4 border-yellow-300 hover:shadow-3xl transition-all duration-200">
      {children}
    </div>
  );
} 