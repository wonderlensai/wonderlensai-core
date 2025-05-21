import { Home, CameraAlt, School, Group } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const navItems = [
  { label: 'Home', icon: <Home fontSize="large" />, path: '/' },
  { label: 'Scan', icon: <CameraAlt fontSize="large" />, path: '/scan' },
  { label: 'Learn', icon: <School fontSize="large" />, path: '/learn' },
  { label: 'Shared', icon: <Group fontSize="large" />, path: '/shared' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [activeTab, setActiveTab] = useState('/');

  // Detect screen size for responsive navigation
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Determine active tab based on path
  useEffect(() => {
    // Special case for learning-card page - should activate Scan tab
    if (location.pathname === '/learning-card') {
      setActiveTab('/scan');
    }
    // Home page only matches exact path
    else if (location.pathname === '/') {
      setActiveTab('/');
    }
    // For other paths, match the beginning part
    else {
      const matchingNav = navItems.find(item => 
        item.path !== '/' && location.pathname.startsWith(item.path)
      );
      if (matchingNav) {
        setActiveTab(matchingNav.path);
      }
    }
  }, [location.pathname]);

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

  // Styles for iPad navigation (can be tablet-style or dock-style)
  const tabletNavStyles = {
    // For iPad in portrait, we show a more spacious bottom nav
    portrait: {
      height: '75px',
      paddingBottom: '5px',
      paddingTop: '5px',
    },
    // For iPad in landscape, we can use a more desktop-like approach
    landscape: {
      height: '75px',
      paddingBottom: '5px',
      paddingTop: '5px',
    },
  };

  const isLandscape = window.innerWidth > window.innerHeight;
  const navStyle = isLargeScreen 
    ? (isLandscape ? tabletNavStyles.landscape : tabletNavStyles.portrait)
    : { height: '65px' }; // Mobile style

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[999] ${isLargeScreen ? 'md:desktop-navigation mx-auto' : ''}`}
      style={{
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: 'none',
        boxShadow: '0 -3px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* iPad/tablet optimized navigation */}
      <div className={`${isLargeScreen ? 'max-w-4xl' : 'max-w-md'} mx-auto`}>
        <div className="grid grid-cols-4">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.path;
            return (
              <button
                key={item.label}
                className="flex flex-col items-center justify-center py-2 relative"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  transition: 'all var(--transition-normal)',
                  ...navStyle,
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
                  className={`font-bold ${isLargeScreen ? 'text-sm' : 'text-xs'}`}
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