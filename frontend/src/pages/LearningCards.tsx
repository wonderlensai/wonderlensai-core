import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
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
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import QuizIcon from '@mui/icons-material/Quiz';
import confetti from 'canvas-confetti';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ExploreIcon from '@mui/icons-material/Explore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock data for development - will be replaced with actual API response
const mockLearningData = {
  title: "Ancient Egyptian Pyramid",
  facts: [
    "Built over 4,500 years ago!",
    "Made of about 2.3 million stone blocks",
    "Each block weighs as much as a car",
    "The Great Pyramid was the tallest building for 3,800 years"
  ],
  funFact: "The pyramids were built so precisely that they align with the stars!",
  question: "Can you guess how many years it took to build the Great Pyramid?",
  answer: "It took about 20 years to build the Great Pyramid!"
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

const sectionMap = [
  {
    label: 'Object Introduction',
    icon: <ExploreIcon sx={{ color: '#6C63FF', fontSize: 32, mr: 1 }} />,
    key: 'objectIntroduction',
    color: '#6C63FF',
  },
  {
    label: 'Core Concept',
    icon: <LightbulbIcon sx={{ color: '#FFD93D', fontSize: 32, mr: 1 }} />,
    key: 'coreConcept',
    color: '#FFD93D',
  },
  {
    label: 'Interesting Fact',
    icon: <EmojiObjectsIcon sx={{ color: '#4ECDC4', fontSize: 32, mr: 1 }} />,
    key: 'interestingFact',
    color: '#4ECDC4',
  },
  {
    label: 'Related Knowledge',
    icon: <LinkIcon sx={{ color: '#FF6B6B', fontSize: 32, mr: 1 }} />,
    key: 'relatedKnowledge',
    color: '#FF6B6B',
  },
  {
    label: 'Real-World Connection',
    icon: <PublicIcon sx={{ color: '#95E1D3', fontSize: 32, mr: 1 }} />,
    key: 'realWorldConnection',
    color: '#95E1D3',
  },
  {
    label: 'Extend Learning',
    icon: <QuizIcon sx={{ color: '#9B59B6', fontSize: 32, mr: 1 }} />,
    key: 'extendLearning',
    color: '#9B59B6',
  },
];

const LearningCards = () => {
  const { subject = 'unknown' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { imageData, learningData: stateLearningData } = location.state || {};
  const [learningData, setLearningData] = useState(stateLearningData || mockLearningData);
  const cardRef = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    if (stateLearningData) {
      setLearningData(stateLearningData);
      console.log('[Frontend] Received learningData from backend:', stateLearningData);
      setIsLoading(false);
    } else {
      // Simulate API call for mock data
      setIsLoading(true);
      setTimeout(() => {
        setLearningData(mockLearningData);
        setIsLoading(false);
      }, 1500);
    }
  }, [imageData, subject, stateLearningData]);

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

  // Map OpenAI response to new structure
  const structuredData: Record<string, any> = {
    objectIntroduction: learningData.objectIntroduction || learningData["Object Introduction"] || '',
    coreConcept: learningData.coreConcept || learningData["Core Concept"] || '',
    interestingFact: learningData.interestingFact || learningData["Interesting Fact"] || '',
    relatedKnowledge: learningData.relatedKnowledge || learningData["Related Knowledge"] || [],
    realWorldConnection: learningData.realWorldConnection || learningData["Real-World Connection"] || '',
    extendLearning: learningData.extendLearning || learningData["Extend Learning"] || [],
  };

  useEffect(() => {
    if (!isLoading && cardRef.current) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: [sectionMap[currentSection].color, '#fff', '#FFD93D', '#4ECDC4', '#FF6B6B', '#95E1D3'],
        scalar: 0.7,
      });
    }
    // eslint-disable-next-line
  }, [currentSection, isLoading]);

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
            Learning Cards
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
            ref={cardRef}
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
                  background: `linear-gradient(135deg, ${sectionMap[currentSection].color}20 0%, ${sectionMap[currentSection].color}40 100%)`,
                  border: `3px solid ${sectionMap[currentSection].color}60`,
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
                    {sectionMap[currentSection].icon}
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ mb: 0, color: sectionMap[currentSection].color, textAlign: 'center', fontSize: { xs: '1.3rem', sm: '1.7rem' }, fontWeight: 700, letterSpacing: 1 }}
                    >
                      {sectionMap[currentSection].label}
                    </Typography>
                    <IconButton
                      onClick={() => handleSpeak(structuredData[sectionMap[currentSection].key])}
                      sx={{ ml: 2, color: speaking ? '#FFD93D' : '#6C63FF', background: speaking ? '#FFFDE7' : 'transparent', transition: 'all 0.2s', boxShadow: speaking ? '0 0 8px #FFD93D' : 'none' }}
                      aria-label="Listen to card"
                    >
                      <VolumeUpIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" component="div" sx={{ textAlign: 'center', fontSize: { xs: '1.08rem', sm: '1.18rem' }, color: '#333', fontWeight: 500, mt: 2 }}>
                    {sectionMap[currentSection].key === 'relatedKnowledge' && Array.isArray(structuredData.relatedKnowledge) ? (
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {structuredData.relatedKnowledge.map((fact: string, idx: number) => (
                          <Typography component="li" variant="body1" key={idx} sx={{ mb: 1, listStyle: 'disc', display: 'list-item', fontSize: { xs: '1.08rem', sm: '1.18rem' }, textAlign: 'center', color: '#333', fontWeight: 500 }}>
                            {fact}
                          </Typography>
                        ))}
                      </Box>
                    ) : sectionMap[currentSection].key === 'extendLearning' && Array.isArray(structuredData.extendLearning) ? (
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {structuredData.extendLearning.map((qa: any, idx: number) => (
                          <Box key={idx} sx={{ mb: 2 }}>
                            <Typography component="li" variant="body1" sx={{ fontWeight: 700, color: '#6C63FF', listStyle: 'decimal', display: 'list-item', fontSize: { xs: '1.08rem', sm: '1.18rem' } }}>
                              {qa.question}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#333', ml: 2, fontSize: { xs: '1.05rem', sm: '1.12rem' } }}>
                              {qa.answer}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      structuredData[sectionMap[currentSection].key]
                    )}
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
                {sectionMap.map((section, index) => (
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
                        backgroundColor: currentSection === index ? section.color : 'grey.300',
                        border: currentSection === index ? `2px solid ${section.color}` : '2px solid #eee',
                        '&:hover': {
                          backgroundColor: currentSection === index ? section.color : 'grey.400',
                        },
                        p: 0.5,
                        transition: 'all 0.2s',
                      }}
                      aria-label={`Go to section ${index + 1}`}
                    />
                  </motion.div>
                ))}
                <IconButton
                  onClick={() => setCurrentSection((prev) => (prev + 1) % sectionMap.length)}
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