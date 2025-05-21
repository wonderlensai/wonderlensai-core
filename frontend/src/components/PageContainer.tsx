import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  withBackground?: boolean;
  className?: string;
}

/**
 * PageContainer - A modernized container with Apple/Instagram-inspired styling
 * Creates a clean, kid-friendly container for page content
 */
const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  withBackground = true,
  className = '',
}) => {
  return (
    <div 
      className={`w-full mx-auto mb-8 md:mb-10 ${
        // Different max-widths based on device size
        // Default for mobile, adjusts for tablet/iPad
        className
      }`}
      style={{
        // Handle iPad Pro differently (max content width)
        maxWidth: 'calc(100% - 32px)',
      }}
    >
      <div 
        className={`w-full rounded-2xl p-5 md:p-6 ${withBackground ? 'kid-card' : ''}`} 
        style={{ 
          boxShadow: withBackground ? 'var(--shadow-md)' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageContainer; 