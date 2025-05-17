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
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaHome, FaCamera, FaGraduationCap, FaShareAlt } from 'react-icons/fa';
import BottomNav from './components/BottomNav';

// Updated kid-friendly theme with new color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#5EC6FF', // Sky Blue (Main accent)
      light: '#8DD5FF',
      dark: '#4BAAD8',
    },
    secondary: {
      main: '#FF757D', // Bright Coral (Contrast, call-to-action)
      light: '#FF9CA2',
      dark: '#E15E65',
    },
    background: {
      default: '#F8FBFF', // Very Pale Blue (Main background)
      paper: '#FFFFFF', // White (Clean sections, cards)
    },
    success: {
      main: '#6BEE90', // Fresh Green (Friendly, positive)
    },
    warning: {
      main: '#FFE26A', // Vivid Yellow (Energy & highlights)
    },
    error: {
      main: '#FF757D', // Bright Coral
    },
    info: {
      main: '#AD98FF', // Lavender/Purple (Imagination/curiosity)
    },
    text: {
      primary: '#232B3A', // Charcoal (Headings/text)
      secondary: '#7A869A', // Slate Gray (Secondary text)
    },
  },
  typography: {
    fontFamily: '"Baloo 2", "Comic Sans MS", "Comic Sans", cursive',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#232B3A', // Charcoal
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#232B3A', // Charcoal
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#232B3A', // Charcoal
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
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5EC6FF 0%, #AD98FF 100%)', // Gradient 1
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #FF757D 0%, #FFE26A 100%)', // Gradient 2
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(94, 198, 255, 0.12)', // Soft Shadow
          backgroundColor: '#FFFBE9', // Pale Yellow for card backgrounds
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // White
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
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <div 
      className="flex flex-col bg-white relative font-sans overflow-x-hidden"
      style={{ minHeight: '100vh', paddingBottom: '60px' }} // Add fixed padding for bottom nav
    >
      {/* Main content - with proper bottom padding */}
      <main className="relative z-10 flex-1 px-2 sm:px-0" style={{ 
        paddingBottom: 'calc(60px + env(safe-area-inset-bottom))'
      }}>
        {children}
      </main>
      {/* Colorful Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AppShell><Home /></AppShell>} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/scan" element={<AppShell><Scan /></AppShell>} />
          <Route path="/history" element={<AppShell><History /></AppShell>} />
          <Route path="/science" element={<AppShell><Science /></AppShell>} />
          <Route path="/math" element={<AppShell><Math /></AppShell>} />
          <Route path="/geography" element={<AppShell><Geography /></AppShell>} />
          <Route path="/learning-card" element={<AppShell><LearningCards /></AppShell>} />
          <Route path="/learn" element={<AppShell><Learn /></AppShell>} />
          <Route path="/learn/:subject" element={<AppShell><LearningCards /></AppShell>} />
          <Route path="/shared" element={<AppShell><SharedLearning /></AppShell>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
