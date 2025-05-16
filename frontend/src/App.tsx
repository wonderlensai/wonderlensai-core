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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-yellow-50 to-blue-100 relative font-sans">
      {/* Animated background shapes */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-10 left-5 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-300 to-yellow-200 opacity-20 animate-float1" />
        <div className="absolute bottom-16 right-8 w-32 h-32 rounded-full bg-gradient-to-br from-teal-200 to-pink-200 opacity-15 animate-float2" />
        <div className="absolute top-48 right-20 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-200 to-indigo-200 opacity-10 animate-float3" />
        <style>{`
          @keyframes float1 { 0%{transform:translateY(0);} 50%{transform:translateY(-20px);} 100%{transform:translateY(0);} }
          @keyframes float2 { 0%{transform:translateY(0);} 50%{transform:translateY(30px);} 100%{transform:translateY(0);} }
          @keyframes float3 { 0%{transform:translateY(0);} 50%{transform:translateY(-15px);} 100%{transform:translateY(0);} }
        `}</style>
      </div>
      {/* Main content */}
      <main className="relative z-10 flex-1 pb-24 px-2 sm:px-0">{children}</main>
      {/* Colorful Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-20 bg-gradient-to-r from-pink-200 via-yellow-100 to-blue-200 shadow-t flex justify-around items-center h-20 rounded-t-3xl border-t border-gray-100">
        <button className={`flex flex-col items-center text-xs font-bold focus:outline-none transition-all ${navValue===0?'text-pink-500 scale-110':'text-gray-400'}`} onClick={()=>{setNavValue(0);navigate('/');}}>
          <FaHome className="text-2xl mb-1" />
          Home
        </button>
        <button className={`flex flex-col items-center text-xs font-bold focus:outline-none transition-all ${navValue===1?'text-teal-500 scale-110':'text-gray-400'}`} onClick={()=>{setNavValue(1);navigate('/scan');}}>
          <FaCamera className="text-2xl mb-1" />
          Scan
        </button>
        <button className={`flex flex-col items-center text-xs font-bold focus:outline-none transition-all ${navValue===2?'text-yellow-500 scale-110':'text-gray-400'}`} onClick={()=>{setNavValue(2);navigate('/learn');}}>
          <FaGraduationCap className="text-2xl mb-1" />
          Learn
        </button>
        <button className={`flex flex-col items-center text-xs font-bold focus:outline-none transition-all ${navValue===3?'text-purple-500 scale-110':'text-gray-400'}`} onClick={()=>{setNavValue(3);navigate('/shared');}}>
          <FaShareAlt className="text-2xl mb-1" />
          Shared
        </button>
      </nav>
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
