import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import CelebrationIcon from '@mui/icons-material/Celebration';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ExploreIcon from '@mui/icons-material/Explore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import confetti from 'canvas-confetti';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSwipeable } from 'react-swipeable';

// Define the lens types and their icons
const lensIcons: Record<string, any> = {
  'Core Identity': <ExploreIcon sx={{ color: '#6C63FF', fontSize: 32, mr: 1 }} />,
  'How It Works': <LightbulbIcon sx={{ color: '#FFD93D', fontSize: 32, mr: 1 }} />,
  'Where It Comes From': <PublicIcon sx={{ color: '#4ECDC4', fontSize: 32, mr: 1 }} />,
  'Where It Started': <LinkIcon sx={{ color: '#FF6B6B', fontSize: 32, mr: 1 }} />,
  'Safety & Care': <LightbulbIcon sx={{ color: '#95E1D3', fontSize: 32, mr: 1 }} />,
  'Ecosystem Role': <PublicIcon sx={{ color: '#6C63FF', fontSize: 32, mr: 1 }} />,
  'Cultural Link': <LinkIcon sx={{ color: '#FFD93D', fontSize: 32, mr: 1 }} />,
  'Math & Patterns': <LightbulbIcon sx={{ color: '#4ECDC4', fontSize: 32, mr: 1 }} />,
  'Tiny → Huge Scale': <ExploreIcon sx={{ color: '#FF6B6B', fontSize: 32, mr: 1 }} />,
  'Environmental Impact': <PublicIcon sx={{ color: '#95E1D3', fontSize: 32, mr: 1 }} />,
  'Language Hop': <LinkIcon sx={{ color: '#6C63FF', fontSize: 32, mr: 1 }} />,
  'Career Link': <LightbulbIcon sx={{ color: '#FFD93D', fontSize: 32, mr: 1 }} />,
  'Future Glimpse': <ExploreIcon sx={{ color: '#4ECDC4', fontSize: 32, mr: 1 }} />,
  'Fun Fact': <LightbulbIcon sx={{ color: '#FF6B6B', fontSize: 32, mr: 1 }} />,
};

const lensColors: Record<string, string> = {
  'Core Identity': '#6C63FF',
  'How It Works': '#FFD93D',
  'Where It Comes From': '#4ECDC4',
  'Where It Started': '#FF6B6B',
  'Safety & Care': '#95E1D3',
  'Ecosystem Role': '#6C63FF',
  'Cultural Link': '#FFD93D',
  'Math & Patterns': '#4ECDC4',
  'Tiny → Huge Scale': '#FF6B6B',
  'Environmental Impact': '#95E1D3',
  'Language Hop': '#6C63FF',
  'Career Link': '#FFD93D',
  'Future Glimpse': '#4ECDC4',
  'Fun Fact': '#FF6B6B',
};

const LearningCard = styled(Card)({
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
});

const ImageContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 300,
  borderRadius: 20,
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

interface Lens {
  name: string;
  text: string;
}

interface LearningData {
  object: string;
  lenses: Lens[];
  message?: string;
}

const LearningCards = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { imageData, learningData: stateLearningData } = location.state || {};
  const [learningData, setLearningData] = useState<LearningData | null>(stateLearningData || null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (learningData && learningData.lenses) {
        setCurrentSection((prev) => Math.min(prev + 1, learningData.lenses.length - 1));
      }
    },
    onSwipedRight: () => {
      if (learningData && learningData.lenses) {
        setCurrentSection((prev) => Math.max(prev - 1, 0));
      }
    },
    trackMouse: true,
  });

  useEffect(() => {
    if (stateLearningData) {
      setLearningData(stateLearningData);
      console.log('[Frontend] Received learningData from backend:', stateLearningData);
      setIsLoading(false);
    }
  }, [stateLearningData]);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleSpeak = (text: string) => {
    if (!synthRef.current) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synthRef.current.speak(utter);
  };

  useEffect(() => {
    if (!isLoading && cardRef.current && learningData?.lenses) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: [lensColors[learningData.lenses[currentSection].name], '#fff', '#FFD93D', '#4ECDC4', '#FF6B6B', '#95E1D3'],
        scalar: 0.7,
      });
    }
  }, [currentSection, isLoading, learningData]);

  if (!learningData) {
    return (
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
          py: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" color="error">
          No learning data available. Please try scanning again.
        </Typography>
      </Box>
    );
  }

  if (learningData.object === 'unrecognized') {
    return (
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
          py: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" color="error">
          {learningData.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
        py: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
            aria-label="Back to home"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontSize: { xs: '1.5rem', sm: '2rem' }, flex: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1 }}>
            {learningData.object}
          </Typography>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <motion.div
            {...handlers}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%' }}
          >
            {imageData && (
              <ImageContainer sx={{ mx: 'auto', mb: 2, width: '100%', maxWidth: 320, height: { xs: 160, sm: 220 }, borderRadius: 6, border: '3px dashed #FFD93D', background: '#FFFDE7' }}>
                <img
                  src={imageData}
                  alt="Captured"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 24,
                  }}
                />
              </ImageContainer>
            )}

            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LearningCard
                sx={{
                  background: `linear-gradient(135deg, ${lensColors[learningData.lenses[currentSection].name]}20 0%, ${lensColors[learningData.lenses[currentSection].name]}40 100%)`,
                  border: `3px solid ${lensColors[learningData.lenses[currentSection].name]}60`,
                  mx: 'auto',
                  width: '100%',
                  maxWidth: 340,
                  minHeight: { xs: 140, sm: 180 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 3, sm: 4 },
                  boxShadow: '0 12px 36px rgba(0,0,0,0.13)',
                  mb: 3,
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: 0, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {lensIcons[learningData.lenses[currentSection].name]}
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ mb: 0, color: lensColors[learningData.lenses[currentSection].name], textAlign: 'center', fontSize: { xs: '1.3rem', sm: '1.7rem' }, fontWeight: 700, letterSpacing: 1 }}
                    >
                      {learningData.lenses[currentSection].name}
                    </Typography>
                    <IconButton
                      onClick={() => handleSpeak(learningData.lenses[currentSection].text)}
                      sx={{ ml: 2, color: speaking ? '#FFD93D' : '#6C63FF', background: speaking ? '#FFFDE7' : 'transparent', transition: 'all 0.2s', boxShadow: speaking ? '0 0 8px #FFD93D' : 'none' }}
                      aria-label="Listen to card"
                    >
                      <VolumeUpIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" component="div" sx={{ textAlign: 'left', fontSize: { xs: '1.18rem', sm: '1.28rem' }, color: '#333', fontWeight: 500, mt: 2, fontFamily: '"Comic Neue", "Comic Sans MS", "Comic Sans", cursive' }}>
                    {learningData.lenses[currentSection].text.split(/(?<=[.!?])\s+/).map((sentence, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <CheckCircleIcon sx={{ color: lensColors[learningData.lenses[currentSection].name], fontSize: 18, mt: '2px', mr: 1 }} />
                        <span>{sentence}</span>
                      </Box>
                    ))}
                  </Typography>
                </CardContent>
              </LearningCard>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 1,
                  gap: 2,
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                {learningData.lenses.map((lens, index) => (
                  <motion.div
                    key={index}
                    animate={{ scale: currentSection === index ? 1.3 : 1, opacity: currentSection === index ? 1 : 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ display: 'inline-block' }}
                  >
                    <IconButton
                      onClick={() => setCurrentSection(index)}
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: currentSection === index ? lensColors[lens.name] : 'grey.300',
                        border: currentSection === index ? `2px solid ${lensColors[lens.name]}` : '2px solid #eee',
                        '&:hover': {
                          backgroundColor: currentSection === index ? lensColors[lens.name] : 'grey.400',
                        },
                        p: 0.5,
                        transition: 'all 0.2s',
                      }}
                      aria-label={`Go to section ${index + 1}`}
                    />
                  </motion.div>
                ))}
                <IconButton
                  onClick={() => setCurrentSection((prev) => (prev + 1) % learningData.lenses.length)}
                  sx={{
                    ml: 2,
                    backgroundColor: '#FFD93D',
                    color: '#fff',
                    border: '2px solid #FFD93D',
                    '&:hover': { backgroundColor: '#FF6B6B' },
                    width: 36,
                    height: 36,
                  }}
                  aria-label="Next section"
                >
                  <CelebrationIcon />
                </IconButton>
              </Box>
            </Box>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default LearningCards; 