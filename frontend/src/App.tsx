import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, BottomNavigation, BottomNavigationAction, Box, CssBaseline } from '@mui/material';
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
import HomeIcon from '@mui/icons-material/Home';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SchoolIcon from '@mui/icons-material/School';
import ShareIcon from '@mui/icons-material/Share';

// Kid-friendly theme with playful colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B', // Warm coral
      light: '#FF8E8E',
      dark: '#E64A4A',
    },
    secondary: {
      main: '#4ECDC4', // Turquoise
      light: '#7EDCD6',
      dark: '#2E9E96',
    },
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    success: {
      main: '#95E1D3', // Mint green
    },
    warning: {
      main: '#FFD93D', // Sunny yellow
    },
    error: {
      main: '#FF8B8B', // Soft red
    },
  },
  typography: {
    fontFamily: '"Baloo 2", "Comic Sans MS", "Comic Sans", cursive',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
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
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(0);

  useEffect(() => {
    if (location.pathname === '/scan' || location.pathname === '/learning-card') setNavValue(1);
    else if (
      location.pathname === '/learn' ||
      location.pathname.startsWith('/learn/')
    ) setNavValue(2);
    else if (location.pathname.startsWith('/shared')) setNavValue(3);
    else setNavValue(0);
  }, [location.pathname]);

  return (
    <Box sx={{ minHeight: '100vh', fontFamily: 'Nunito, sans-serif', background: 'linear-gradient(135deg, #e0e7ff 0%, #fceabb 100%)', position: 'relative' }}>
      <CssBaseline />
      {/* Animated background shapes */}
      <Box sx={{ position: 'fixed', zIndex: 0, top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Example floating shapes */}
        <Box sx={{ position: 'absolute', top: 40, left: 20, width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF 60%, #FFD93D 100%)', opacity: 0.18, animation: 'float1 8s ease-in-out infinite' }} />
        <Box sx={{ position: 'absolute', bottom: 60, right: 30, width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #4ECDC4 60%, #FF6B6B 100%)', opacity: 0.13, animation: 'float2 10s ease-in-out infinite' }} />
        <Box sx={{ position: 'absolute', top: 200, right: 80, width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD93D 60%, #6C63FF 100%)', opacity: 0.12, animation: 'float3 12s ease-in-out infinite' }} />
        <style>{`
          @keyframes float1 { 0%{transform:translateY(0);} 50%{transform:translateY(-20px);} 100%{transform:translateY(0);} }
          @keyframes float2 { 0%{transform:translateY(0);} 50%{transform:translateY(30px);} 100%{transform:translateY(0);} }
          @keyframes float3 { 0%{transform:translateY(0);} 50%{transform:translateY(-15px);} 100%{transform:translateY(0);} }
        `}</style>
      </Box>
      {/* Main content */}
      <Box sx={{ position: 'relative', zIndex: 1, pb: 10 }}>{children}</Box>
      {/* Bottom Navigation */}
      <BottomNavigation
        value={navValue}
        onChange={(_, newValue) => {
          setNavValue(newValue);
          if (newValue === 0) navigate('/');
          else if (newValue === 1) navigate('/scan');
          else if (newValue === 2) navigate('/learn');
          else if (newValue === 3) navigate('/shared');
        }}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100vw',
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.04)',
          zIndex: 10,
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Scan" icon={<CameraAltIcon />} />
        <BottomNavigationAction label="Learn" icon={<SchoolIcon />} />
        <BottomNavigationAction label="Shared" icon={<ShareIcon />} />
      </BottomNavigation>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AppShell><Home /></AppShell>} />
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
