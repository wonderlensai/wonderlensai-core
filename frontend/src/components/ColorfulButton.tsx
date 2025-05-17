import React from 'react';

export default function ColorfulButton({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
  return (
    <button
      className="bg-gradient-to-r from-pink-400 via-yellow-300 to-blue-400 text-white font-extrabold py-4 px-8 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 border-2 border-white drop-shadow-lg"
      style={{ fontFamily: 'Baloo 2, Nunito, cursive', fontSize: 20, letterSpacing: 0.5 }}
      onClick={onClick}
    >
      {children}
    </button>
  );
} 