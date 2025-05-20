import { Home, CameraAlt, School, Group } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

const navItems = [
  { label: 'Home', icon: <Home fontSize="large" />, path: '/' },
  { label: 'Scan', icon: <CameraAlt fontSize="large" />, path: '/scan' },
  { label: 'Learn', icon: <School fontSize="large" />, path: '/learn' },
  { label: 'Shared', icon: <Group fontSize="large" />, path: '/shared' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Override default scroll restoration behavior in React Router v7
  useEffect(() => {
    // Set scroll position before navigation
    const handleNavigation = () => {
      // Prevent automatic scroll restoration
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    };

    handleNavigation(); // Set initial settings
    
    return () => {
      // Clean up on unmount
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Handle navigation without scrolling to top
  const handleNavClick = (path: string) => {
    // Only navigate if not already on the page to avoid unnecessary re-renders
    if (location.pathname !== path) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Navigate to the new page
      navigate(path);
      
      // Use a small timeout to ensure the page has rendered before trying to restore scroll
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 0);
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999]" 
      style={{
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: 'none',
        boxShadow: '0 -3px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Full width navigation bar - no borders */}
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-4">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                className="flex flex-col items-center justify-center py-2 relative"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  transition: 'all var(--transition-normal)',
                  height: '65px',
                }}
                onClick={() => handleNavClick(item.path)}
              >
                <div 
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all var(--transition-normal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '3px',
                  }}
                >
                  {item.icon}
                </div>
                <span 
                  className="text-xs font-bold"
                  style={{ 
                    fontFamily: 'var(--font-family)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                    transition: 'all var(--transition-normal)',
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area extension */}
      <div 
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          height: 'env(safe-area-inset-bottom)',
          width: '100%',
          position: 'absolute',
          bottom: '-env(safe-area-inset-bottom)',
          left: 0,
          right: 0
        }}
      />
    </div>
  );
} 