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
        paddingBottom: 'env(safe-area-inset-bottom)',
        // Create a safe area around the bottom navigation
        marginBottom: '0', // Ensure no margin pushes it up
        width: '100%', // Make sure it spans full width
      }}
    >
      <div 
        className="mx-auto overflow-hidden border-t border-gray-300 shadow-lg" 
        style={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 -4px 20px rgba(94, 198, 255, 0.12)', 
          maxWidth: '600px', // Match your app's max width
        }}
      >
        <div className="grid grid-cols-4">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                className={`flex flex-col items-center justify-center py-3 relative`}
                style={{
                  backgroundColor: isActive ? '#F8FBFF' : 'white',
                  borderRight: index !== navItems.length - 1 ? '1px solid #e5e7eb' : 'none',
                  transition: 'all 0.2s ease',
                  height: '60px', // Fixed height for consistency
                }}
                onClick={() => handleNavClick(item.path)}
              >
                <div style={{
                  color: isActive ? '#5EC6FF' : '#7A869A',
                }}>
                  {item.icon}
                </div>
                <span 
                  className="text-xs font-bold mt-1"
                  style={{ 
                    fontFamily: 'Baloo 2, Nunito, cursive',
                    color: isActive ? '#5EC6FF' : '#7A869A'
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-b-md" 
                    style={{ 
                      background: 'linear-gradient(90deg, #5EC6FF 0%, #AD98FF 100%)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 