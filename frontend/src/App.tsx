import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './pages/Home';
import Scan from './pages/Scan';
import LearningCards from './pages/LearningCards';
import SharedLearning from './pages/SharedLearning';
import History from './pages/History';
import Science from './pages/Science';
import Math from './pages/Math';
import Geography from './pages/Geography';
import Learn from './pages/Learn';
import ScanHistory from './pages/ScanHistory';
import AgeCollector from './components/AgeCollector';
import { UserProvider } from './contexts/UserContext';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaHome, FaCamera, FaGraduationCap, FaShareAlt } from 'react-icons/fa';
import BottomNav from './components/BottomNav';

// Updated kid-friendly theme with modern color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#5E7BFF', // Vibrant blue (main accent)
      light: '#738FFF',
      dark: '#4A62CC',
    },
    secondary: {
      main: '#FF7285', // Warm coral (contrast color)
      light: '#FF9EAA',
      dark: '#E25C6D',
    },
    background: {
      default: '#F8FAFF', // Soft blue background
      paper: '#FFFFFF', // Clean white for cards
    },
    success: {
      main: '#6BE4A3', // Fresh mint green
    },
    warning: {
      main: '#FFDB63', // Bright yellow
    },
    error: {
      main: '#FF6B6B', // Gentle red
    },
    info: {
      main: '#6FDFDF', // Turquoise
    },
    text: {
      primary: '#2D3748', // Deep blue-gray
      secondary: '#718096', // Medium gray
    },
  },
  typography: {
    fontFamily: '"Nunito", "Baloo 2", system-ui, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      color: '#2D3748',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#2D3748',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#2D3748',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontSize: '1.1rem',
          padding: '10px 20px',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5E7BFF 0%, #6FDFDF 100%)', // Gradient blue to turquoise
          boxShadow: '0 4px 10px rgba(94, 123, 255, 0.15)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #FF7285 0%, #FFDB63 100%)', // Gradient coral to yellow
          boxShadow: '0 4px 10px rgba(255, 114, 133, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(94, 123, 255, 0.08)', // Soft shadow
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
});

// Add this to prevent the default scroll restoration
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function AppShell({ children }: { children: React.ReactNode }) {
  // Use effect to prevent automatic scroll restoration
  useEffect(() => {
    // Force the window to maintain its scroll position
    const handleRouteChange = () => {
      if (typeof window !== 'undefined') {
        window.scrollTo(window.scrollX, window.scrollY);
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);

    // Detect iPad/tablet devices
    const isIpad = () => {
      // Check if device is iPad-sized or larger
      return window.innerWidth >= 768 && 
             (navigator.userAgent.includes('iPad') || 
              (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document));
    };

    // Set class on body for device-specific styling
    const setDeviceClass = () => {
      if (isIpad()) {
        document.body.classList.add('is-ipad');
        // For larger iPad Pro
        if (window.innerWidth >= 1024) {
          document.body.classList.add('is-ipad-pro');
        }
      } else {
        document.body.classList.add('is-mobile');
      }

      // Add orientation classes
      if (window.innerWidth > window.innerHeight) {
        document.body.classList.add('landscape');
      } else {
        document.body.classList.add('portrait');
      }
    };

    // Handle orientation changes
    const handleResize = () => {
      document.body.classList.remove('landscape', 'portrait');
      if (window.innerWidth > window.innerHeight) {
        document.body.classList.add('landscape');
      } else {
        document.body.classList.add('portrait');
      }
    };

    setDeviceClass();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className="flex flex-col font-sans overflow-x-hidden"
      style={{ 
        minHeight: '100vh', 
        paddingBottom: '65px', // Match the navigation height
        backgroundColor: 'var(--color-background)',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* App background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="animated-bg-shape" style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(94, 123, 255, 0.07) 0%, rgba(94, 123, 255, 0) 70%)',
          top: '-200px',
          right: '-200px',
        }} />
        <div className="animated-bg-shape" style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(111, 223, 223, 0.07) 0%, rgba(111, 223, 223, 0) 70%)',
          bottom: '10%',
          left: '-150px',
          animationDelay: '0.5s',
        }} />
      </div>
      
      {/* App content with safe area inset padding */}
      <div 
        className="app-container" 
        style={{ 
          paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
          padding: '4px 4px',
          maxWidth: '98%',
          width: '98%',
          margin: '0 auto'
        }}
      >
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

function App() {
  const [userAge, setUserAge] = useState<number | null>(null);
  const [showAgeCollector, setShowAgeCollector] = useState(false);

  // Load age from localStorage on app start
  useEffect(() => {
    const savedAge = localStorage.getItem('wonderlens-user-age');
    if (savedAge) {
      setUserAge(parseInt(savedAge));
    } else {
      setShowAgeCollector(true);
    }
  }, []);

  // Handle age selection
  const handleAgeSelect = (age: number) => {
    setUserAge(age);
    localStorage.setItem('wonderlens-user-age', age.toString());
    setShowAgeCollector(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Age Collector Modal */}
        <AgeCollector 
          isVisible={showAgeCollector} 
          onAgeSelect={handleAgeSelect} 
        />
        
        {/* Main App Routes with User Context */}
        <UserProvider age={userAge}>
          <Routes>
            <Route path="/" element={<AppShell><Home /></AppShell>} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/scan" element={<AppShell><Scan /></AppShell>} />
            <Route path="/history" element={<AppShell><History /></AppShell>} />
            <Route path="/scan-history" element={<AppShell><ScanHistory /></AppShell>} />
            <Route path="/science" element={<AppShell><Science /></AppShell>} />
            <Route path="/math" element={<AppShell><Math /></AppShell>} />
            <Route path="/geography" element={<AppShell><Geography /></AppShell>} />
            <Route path="/learning-card" element={<AppShell><LearningCards /></AppShell>} />
            <Route path="/learn" element={<AppShell><Learn /></AppShell>} />
            <Route path="/learn/:subject" element={<AppShell><LearningCards /></AppShell>} />
            <Route path="/shared" element={<AppShell><SharedLearning /></AppShell>} />
          </Routes>
        </UserProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
