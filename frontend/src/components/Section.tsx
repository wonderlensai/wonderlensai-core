import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Section - Enhanced section component with colorful, app-like styling
 * Features modern gradients and improved visual hierarchy
 */
const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => {
  return (
    <section className={`mb-6 mt-4 ${className}`}>
      <div className="flex items-center mb-6 relative">
        {/* Enhanced title with gradient background */}
        <div className="relative">
          <h2 
            className="font-extrabold text-2xl relative z-10 px-4 py-2" 
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {title}
          </h2>
          {/* Decorative background blob */}
          <div 
            className="absolute inset-0 -z-10 opacity-10 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              transform: 'scale(1.1)',
            }}
          />
        </div>
        
        {/* Enhanced decorative line */}
        <div className="ml-4 h-2 flex-grow rounded-full relative overflow-hidden" style={{ maxWidth: '80px' }}>
          <div 
            className="absolute inset-0 rounded-full"
            style={{ 
              background: 'linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)',
              opacity: 0.3,
            }} 
          />
          <div 
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ 
              background: 'linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)',
              opacity: 0.6,
              width: '60%',
            }} 
          />
        </div>
      </div>
      
      <div className="relative">
        {children}
      </div>
    </section>
  );
};

export default Section; 