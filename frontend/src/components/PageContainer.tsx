import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  withBackground?: boolean;
}

/**
 * PageContainer - A modernized container with Apple/Instagram-inspired styling
 * Creates a clean, kid-friendly container for page content
 */
const PageContainer: React.FC<PageContainerProps> = ({ children, withBackground = true }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div 
        className={`w-full rounded-2xl p-5 ${withBackground ? 'kid-card' : ''}`} 
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