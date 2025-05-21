import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Section - A modernized section component with clean, native-like styling
 * Uses custom design system with Instagram/Apple inspired aesthetics
 */
const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => {
  return (
    <section className={`mb-4 mt-3 ${className}`}>
      <div className="flex items-center mb-4">
        <h2 
          className="font-extrabold text-xl" 
          style={{ 
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h2>
        <div className="ml-3 h-1 flex-grow rounded-full" style={{ 
          background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
          opacity: 0.15,
          maxWidth: '40px'
        }} />
      </div>
      <div className="relative">
        {children}
      </div>
    </section>
  );
};

export default Section; 