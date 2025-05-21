import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip,
  Button,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ExploreIcon from '@mui/icons-material/Explore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';
import { styled } from '@mui/material/styles';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import confetti from 'canvas-confetti';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSwipeable } from 'react-swipeable';
import TranslateIcon from '@mui/icons-material/Translate';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import ScienceIcon from '@mui/icons-material/Science';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CategoryIcon from '@mui/icons-material/Category';

// Import our components
import WorldMap from '../components/WorldMap';
import FactCarousel from '../components/FactCarousel';
import VocabularyCards from '../components/VocabularyCards';

// Define the lens types and their icons
const lensIcons: Record<string, any> = {
  'Core Identity': <ExploreIcon sx={{ color: '#6C63FF', fontSize: 32, mr: 1 }} />,
  'How It Works': <LightbulbIcon sx={{ color: '#FFD93D', fontSize: 32, mr: 1 }} />,
  'Where It Comes From': <PublicIcon sx={{ color: '#4ECDC4', fontSize: 32, mr: 1 }} />,
  'Where It Started': <LinkIcon sx={{ color: '#FF6B6B', fontSize: 32, mr: 1 }} />,
  'Time Travel Journey': <LinkIcon sx={{ color: '#AD98FF', fontSize: 32, mr: 1 }} />,
  'Size Comparisons': <ExploreIcon sx={{ color: '#6BE4A3', fontSize: 32, mr: 1 }} />,
  'Safety & Care': <LightbulbIcon sx={{ color: '#95E1D3', fontSize: 32, mr: 1 }} />,
  'Ecosystem Role': <PublicIcon sx={{ color: '#6C63FF', fontSize: 32, mr: 1 }} />,
  'Cultural Stories': <PublicIcon sx={{ color: '#FF9CA2', fontSize: 32, mr: 1 }} />,
  'Cultural Link': <LinkIcon sx={{ color: '#FFD93D', fontSize: 32, mr: 1 }} />,
  'Math & Patterns': <LightbulbIcon sx={{ color: '#4ECDC4', fontSize: 32, mr: 1 }} />,
  'Tiny → Huge Scale': <ExploreIcon sx={{ color: '#FF6B6B', fontSize: 32, mr: 1 }} />,
  'Environmental Impact': <PublicIcon sx={{ color: '#95E1D3', fontSize: 32, mr: 1 }} />,
  'Language Hop': <LinkIcon sx={{ color: '#6C63FF', fontSize: 32, mr: 1 }} />,
  'Career Link': <LightbulbIcon sx={{ color: '#FFD93D', fontSize: 32, mr: 1 }} />,
  'Amazing Records': <StarIcon sx={{ color: '#5EC6FF', fontSize: 32, mr: 1 }} />,
  'Future Glimpse': <ExploreIcon sx={{ color: '#4ECDC4', fontSize: 32, mr: 1 }} />,
  'Fun Fact': <LightbulbIcon sx={{ color: '#FF6B6B', fontSize: 32, mr: 1 }} />,
};

const lensColors: Record<string, string> = {
  'Core Identity': '#6C63FF',
  'How It Works': '#FFD93D',
  'Where It Comes From': '#4ECDC4',
  'Where It Started': '#FF6B6B',
  'Time Travel Journey': '#AD98FF',
  'Size Comparisons': '#6BE4A3',
  'Safety & Care': '#95E1D3',
  'Ecosystem Role': '#6C63FF',
  'Cultural Stories': '#FF9CA2',
  'Cultural Link': '#FFD93D',
  'Math & Patterns': '#4ECDC4',
  'Tiny → Huge Scale': '#FF6B6B',
  'Environmental Impact': '#95E1D3',
  'Language Hop': '#6C63FF',
  'Career Link': '#FFD93D',
  'Amazing Records': '#5EC6FF',
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

// New interfaces for enhanced learning content
interface Fact {
  id: number;
  title: string;
  content: string;
  type: 'fun' | 'science' | 'history' | 'game' | 'challenge';
  color: string;
}

// Interface for vocabulary words coming from Language Hop lens
interface VocabularyWord {
  id: number;
  word: string;
  pronunciation?: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
  language: string;
  audio?: string;
}

// New interface for vocabulary data from OpenAI response
interface ApiVocabulary {
  primaryTerm: string;
  relatedTerms: string[];
  simpleDef: string;
}

// New interface for country information from OpenAI response
interface CountryInfo {
  origin: string;
  relevance: string;
}

interface EnhancedLearningData {
  // Map data
  countryCode?: string;
  countryName?: string;
  countries?: Array<{code: string, name: string}>;  // Add support for multiple countries
  geographyFacts?: string;
  
  // Vocabulary data
  vocabulary?: VocabularyWord[];
  
  // Additional facts
  facts?: Fact[];
}

interface LearningData {
  object: string;
  category?: string; // New field from OpenAI
  lenses: Lens[];
  message?: string;
  // Country information from OpenAI response
  countryInfo?: CountryInfo;
  // Vocabulary information from OpenAI response 
  vocabulary?: ApiVocabulary;
  // Optional enhanced data
  enhancedData?: EnhancedLearningData;
}

// Interface for caching scanned items
interface ScannedItem {
  id: string;
  timestamp: number;
  imageData: string;
  learningData: LearningData;
}

// Cache key for storing items in localStorage
const CACHE_KEY = 'wonderlens_scanned_items';

const LearningCards = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [isLoading, setIsLoading] = useState(true);
  const { imageData, learningData: stateLearningData } = location.state || {};
  const [learningData, setLearningData] = useState<LearningData | null>(stateLearningData || null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  
  // New state for vocabulary card swipe functionality
  const [vocabCardIndex, setVocabCardIndex] = useState(0);
  
  // New state to determine if we should show the map section
  const [showInlineMap, setShowInlineMap] = useState(false);
  
  // Get enhanced data if available
  const enhancedData = useMemo(() => {
    return learningData?.enhancedData || null;
  }, [learningData]);
  
  // Determine which enhanced features are available
  const hasMap = useMemo(() => !!enhancedData?.countryCode, [enhancedData]);
  const hasVocabulary = useMemo(() => 
    !!enhancedData?.vocabulary && enhancedData.vocabulary.length > 0, 
    [enhancedData]
  );
  const hasFacts = useMemo(() => 
    !!enhancedData?.facts && enhancedData.facts.length > 0, 
    [enhancedData]
  );
  
  // Get fact for the current section if available
  const currentFact = useMemo(() => {
    if (!hasFacts || !enhancedData?.facts) return null;
    // Use modulo to cycle through facts based on currentSection
    return enhancedData.facts[currentSection % enhancedData.facts.length];
  }, [enhancedData, hasFacts, currentSection]);

  // Create swipeable handlers with improved configuration
  const swipeHandlers = useSwipeable({
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
    delta: 50, // Minimum swipe distance
    swipeDuration: 500, // Maximum time for swipe to be considered valid
  });
  
  // Create swipeable handlers for vocabulary cards
  const vocabSwipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const vocabulary = enhancedData?.vocabulary || [];
      if (vocabulary.length > 0) {
        setVocabCardIndex((prev) => Math.min(prev + 1, vocabulary.length - 1));
      }
    },
    onSwipedRight: () => {
      const vocabulary = enhancedData?.vocabulary || [];
      if (vocabulary.length > 0) {
        setVocabCardIndex((prev) => Math.max(prev - 1, 0));
      }
    },
    trackMouse: true,
    delta: 50,
    swipeDuration: 500,
  });
  
  // Create the reusable card variants for animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Cache the current item in the backend
  const cacheCurrentItem = async (imageData: string, learningData: LearningData) => {
    try {
      // The scan has already been created and stored in the backend during the analyze step,
      // so we don't need to do anything here - the scan is already cached in the database
      
      console.log('Item already cached in backend database');
    } catch (error) {
      console.error('Error with scan caching:', error);
    }
  };

  useEffect(() => {
    if (stateLearningData && imageData) {
      setLearningData(stateLearningData);
      console.log('[Frontend] Received learningData from backend:', stateLearningData);
      setIsLoading(false);
      
      // Cache the item
      cacheCurrentItem(imageData, stateLearningData);
      
      // If we have mock data, initialize it
      if (!stateLearningData.enhancedData) {
        // In a real app, this would come from the backend
        // For this demo, let's create some mock enhanced data for testing
        initializeMockEnhancedData(stateLearningData);
      }
    }
  }, [stateLearningData, imageData]);

  // Function to initialize mock enhanced data for demo purposes
  const initializeMockEnhancedData = (data: LearningData) => {
    // Check if it's an object that might have country info
    const whereFromLens = data.lenses.find(lens => 
      lens.name === 'Where It Comes From'
    );
    
    const hasGeography = !!whereFromLens;
    
    // Check if it might have language relevance
    const languageHopLens = data.lenses.find(lens => 
      lens.name === 'Language Hop'
    );
    
    const hasLanguage = !!languageHopLens;
    
    // For demo purposes, add some mock enhanced data
    const mockEnhanced: EnhancedLearningData = {};
    
    // Add some facts for all objects
    mockEnhanced.facts = [
      {
        id: 1,
        title: 'Did You Know?',
        content: `${data.object} has many interesting properties that make it unique!`,
        type: 'fun',
        color: '#FFD93D'
      },
      {
        id: 2,
        title: 'Science Connection',
        content: `Scientists study ${data.object.toLowerCase()} to learn more about our world.`,
        type: 'science',
        color: '#6FDFDF'
      }
    ];
    
    // Always add geography data for any object with a "Where It Comes From" lens or countryInfo
    if (hasGeography || data.countryInfo) {
      // If we have country info from OpenAI response, use it
      if (data.countryInfo) {
        const countryName = data.countryInfo.origin;
        
        // Try to map the country name to a country code
        const commonCountries = [
          { name: 'United States', code: 'USA' },
          { name: 'China', code: 'CHN' },
          { name: 'Japan', code: 'JPN' },
          { name: 'Germany', code: 'DEU' },
          { name: 'France', code: 'FRA' },
          { name: 'Italy', code: 'ITA' },
          { name: 'Brazil', code: 'BRA' },
          { name: 'India', code: 'IND' },
          { name: 'Canada', code: 'CAN' },
          { name: 'Australia', code: 'AUS' },
          { name: 'United Kingdom', code: 'GBR' },
          { name: 'Spain', code: 'ESP' },
          { name: 'Mexico', code: 'MEX' },
          { name: 'Netherlands', code: 'NLD' }
        ];
        
        const countryMatch = commonCountries.find(country => 
          countryName.includes(country.name) || country.name.includes(countryName)
        );
        
        if (countryMatch) {
          mockEnhanced.countryCode = countryMatch.code;
          mockEnhanced.countryName = countryMatch.name;
          mockEnhanced.countries = [{ code: countryMatch.code, name: countryMatch.name }];
        } else {
          // Default to US if no country match is found
          mockEnhanced.countryCode = 'USA';
          mockEnhanced.countryName = 'United States';
          mockEnhanced.countries = [{ code: 'USA', name: 'United States' }];
        }
        
        // Use the relevance information for geography facts
        mockEnhanced.geographyFacts = data.countryInfo.relevance;
      } else {
        // Extract possible country name from the lens text as fallback
        const lensText = whereFromLens?.text || '';
        
        // Try to identify a country in the text (simple heuristic)
        const commonCountries = [
          { name: 'United States', code: 'USA' },
          { name: 'China', code: 'CHN' },
          { name: 'Japan', code: 'JPN' },
          { name: 'Germany', code: 'DEU' },
          { name: 'France', code: 'FRA' },
          { name: 'Italy', code: 'ITA' },
          { name: 'Brazil', code: 'BRA' },
          { name: 'India', code: 'IND' },
          { name: 'Canada', code: 'CAN' },
          { name: 'Australia', code: 'AUS' },
          { name: 'United Kingdom', code: 'GBR' },
          { name: 'Spain', code: 'ESP' },
          { name: 'Mexico', code: 'MEX' }
        ];
        
        // Find all countries mentioned in the text
        const foundCountries = commonCountries.filter(country => 
          lensText.includes(country.name)
        );
        
        if (foundCountries.length > 0) {
          // If multiple countries are found, store them all
          mockEnhanced.countries = foundCountries;
          
          // For backward compatibility, also set the first country as primary
          mockEnhanced.countryCode = foundCountries[0].code;
          mockEnhanced.countryName = foundCountries[0].name;
        } else {
          // Default to US if no country is found
          mockEnhanced.countryCode = 'USA';
          mockEnhanced.countryName = 'United States';
          mockEnhanced.countries = [{ code: 'USA', name: 'United States' }];
        }
        
        mockEnhanced.geographyFacts = lensText || `${data.object} is commonly found in ${mockEnhanced.countryName}.`;
      }
      
      // Add additional countries if this is a product with international distribution
      if (data.object.toLowerCase().includes('roller') || data.object.toLowerCase().includes('skate')) {
        mockEnhanced.countries = [
          { code: 'USA', name: 'United States' },
          { code: 'JPN', name: 'Japan' },
          { code: 'DEU', name: 'Germany' },
          { code: 'NLD', name: 'Netherlands' }
        ];
        mockEnhanced.geographyFacts = `${data.object} were first created in the Netherlands in the 1700s. Today, most of the world's roller skates are manufactured in China, the United States, and Japan, with different countries specializing in different styles.`;
      }
    }
    
    // Process vocabulary information
    if (hasLanguage || data.vocabulary) {
      if (data.vocabulary) {
        // Use vocabulary data from OpenAI response
        mockEnhanced.vocabulary = [
          {
            id: 1,
            word: data.vocabulary.primaryTerm,
            pronunciation: `/ˈsæmpəl/`,
            translation: data.vocabulary.simpleDef,
            partOfSpeech: 'noun',
            example: `The ${data.vocabulary.primaryTerm.toLowerCase()} is very interesting.`,
            language: 'English'
          }
        ];
        
        // Add related terms as additional vocabulary entries
        if (data.vocabulary.relatedTerms && data.vocabulary.relatedTerms.length > 0) {
          // Add Spanish translation for the first related term
          mockEnhanced.vocabulary.push({
            id: 2,
            word: `El ${data.vocabulary.relatedTerms[0].toLowerCase()}`,
            pronunciation: `/el ˈsæmpəl/`,
            translation: data.vocabulary.relatedTerms[0],
            partOfSpeech: 'sustantivo',
            example: `El ${data.vocabulary.relatedTerms[0].toLowerCase()} es muy interesante.`,
            language: 'Spanish'
          });
          
          // Add French translation for the second related term if available
          if (data.vocabulary.relatedTerms.length > 1) {
            mockEnhanced.vocabulary.push({
              id: 3,
              word: `Le ${data.vocabulary.relatedTerms[1].toLowerCase()}`,
              pronunciation: `/lə ˈsæmpəl/`,
              translation: data.vocabulary.relatedTerms[1],
              partOfSpeech: 'nom',
              example: `Le ${data.vocabulary.relatedTerms[1].toLowerCase()} est très intéressant.`,
              language: 'French'
            });
          }
        }
      } else {
        // Fallback to original mock vocabulary if no OpenAI vocabulary data
        mockEnhanced.vocabulary = [
          {
            id: 1,
            word: data.object,
            pronunciation: `/ˈsæmpəl/`,
            translation: `The ${data.object.toLowerCase()} (definition)`,
            partOfSpeech: 'noun',
            example: `The ${data.object.toLowerCase()} is very interesting.`,
            language: 'English'
          },
          {
            id: 2,
            word: `El ${data.object.toLowerCase()}`,
            pronunciation: `/el ˈsæmpəl/`,
            translation: data.object,
            partOfSpeech: 'sustantivo',
            example: `El ${data.object.toLowerCase()} es muy interesante.`,
            language: 'Spanish'
          }
        ];
      }
    }
    
    // Update the learning data with enhanced content
    setLearningData({
      ...data,
      enhancedData: mockEnhanced
    });
  };

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

  // Handler for back button
  const handleBack = () => {
    navigate(-1);
  };

  // Check if current section is geography related
  const isGeographySection = useMemo(() => 
    learningData?.lenses[currentSection]?.name === 'Where It Comes From',
    [learningData, currentSection]
  );

  // Automatically show map if we're on a geography section
  useEffect(() => {
    setShowInlineMap(isGeographySection);
  }, [isGeographySection]);

  if (!learningData) {
    return (
      <Box
        sx={{
          width: '100%',
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
          width: '100%',
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
        width: '100%',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
        py: { xs: 2, sm: 4 },
        px: { xs: 0, md: 2 },
        minHeight: '100vh',
      }}
    >
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: { xs: '100%', sm: 600, md: 800, lg: 1000 }, 
          mx: 'auto',
          px: { xs: 2, sm: 0 }
        }}
      >
        {/* Back button */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={handleBack} 
            sx={{ 
              bgcolor: 'white', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              mr: 2
            }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Learning about {learningData.object}
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
          <Box sx={{ mb: { xs: 12, md: 16 } }}>
            {/* Image and Main Card */}
            <Box sx={{ mb: 5 }}>
              <motion.div
                {...swipeHandlers}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={cardVariants}
              >
                {/* Image Container with improved styling */}
                {imageData && (
                  <Box 
                    component={motion.div}
                    whileHover={{ scale: 1.02 }}
                    sx={{ 
                      position: 'relative',
                      mb: 3,
                      borderRadius: { xs: 3, md: 4 },
                      overflow: 'hidden',
                      boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                      maxWidth: { xs: '100%', sm: '80%', md: '60%' },
                      mx: 'auto',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        pt: '60%', // 5:3 aspect ratio
                        overflow: 'hidden',
                        backgroundColor: '#F0F4F8',
                      }}
                    >
                      <img
                        src={imageData}
                        alt={`Scanned ${learningData.object}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          // If image fails to load from URL, show a placeholder
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite error loop
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWltYWdlIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ij48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIj48L3BvbHlsaW5lPjwvc3ZnPg==';
                        }}
                      />
                      
                      {/* Object name overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 2,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                          {learningData.object}
                        </Typography>
                        {learningData.category && (
                          <Chip
                            size="small"
                            label={learningData.category}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.8)',
                              color: '#2D3748',
                              fontWeight: 600,
                              ml: 1
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Lens Card Section with integrated fun facts */}
                <Box 
                  sx={{
                    width: '100%',
                    mb: 4,
                    position: 'relative'
                  }}
                >
                  {/* Left Arrow */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: { xs: -16, sm: -24 },
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: 2,
                      display: currentSection === 0 ? 'none' : 'flex',
                    }}
                    onClick={() => setCurrentSection((prev) => Math.max(prev - 1, 0))}
                    aria-label="Previous"
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>

                  <motion.div
                    whileHover={{ y: -5 }}
                  >
                    <LearningCard
                      ref={cardRef}
                      sx={{
                        background: `linear-gradient(135deg, ${lensColors[learningData.lenses[currentSection].name]}15 0%, ${lensColors[learningData.lenses[currentSection].name]}30 100%)`,
                        border: `3px solid ${lensColors[learningData.lenses[currentSection].name]}40`,
                        mx: 'auto',
                        width: '100%',
                        minHeight: { xs: 220, sm: 260 },
                        display: 'flex',
                        flexDirection: 'column',
                        p: { xs: 3, sm: 4 },
                        boxShadow: '0 12px 36px rgba(0,0,0,0.13)',
                        position: 'relative',
                      }}
                    >
                      <CardContent sx={{ p: 0, width: '100%', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {lensIcons[learningData.lenses[currentSection].name]}
                            <Typography
                              variant="h5"
                              component="h2"
                              sx={{ 
                                color: lensColors[learningData.lenses[currentSection].name], 
                                textAlign: 'left', 
                                fontSize: { xs: '1.3rem', sm: '1.7rem' }, 
                                fontWeight: 700, 
                                letterSpacing: 1 
                              }}
                            >
                              {learningData.lenses[currentSection].name}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => handleSpeak(learningData.lenses[currentSection].text)}
                            sx={{ 
                              color: speaking ? '#FFD93D' : '#6C63FF', 
                              background: speaking ? '#FFFDE7' : 'transparent', 
                              transition: 'all 0.2s', 
                              boxShadow: speaking ? '0 0 8px #FFD93D' : 'none',
                              '&:hover': { background: 'rgba(255,255,255,0.7)' }
                            }}
                            aria-label={speaking ? "Stop speaking" : "Listen to card"}
                          >
                            <VolumeUpIcon sx={{ fontSize: 28 }} />
                          </IconButton>
                        </Box>
                        
                        <Typography 
                          variant="body1" 
                          component="div" 
                          sx={{ 
                            textAlign: 'left', 
                            fontSize: { xs: '1.05rem', sm: '1.15rem' }, 
                            color: '#2D3748', 
                            fontWeight: 500, 
                            mt: 1, 
                            fontFamily: '"Comic Neue", "Comic Sans MS", "Comic Sans", cursive',
                            lineHeight: 1.5
                          }}
                        >
                          {learningData.lenses[currentSection].text.split(/(?<=[.!?])\s+/).map((sentence, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                              <CheckCircleIcon sx={{ color: lensColors[learningData.lenses[currentSection].name], fontSize: 18, mt: '2px', mr: 1 }} />
                              <span>{sentence}</span>
                            </Box>
                          ))}
                        </Typography>
                        
                        {/* Integrated fun fact - only show if available and for certain cards */}
                        {currentFact && currentSection % 2 === 0 && (
                          <Box 
                            sx={{ 
                              mt: 2, 
                              p: 2, 
                              borderRadius: 2, 
                              bgcolor: `${currentFact.color}15`,
                              border: `1px dashed ${currentFact.color}`,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {getFactIcon(currentFact.type)}
                              <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 700, color: currentFact.color }}>
                                {currentFact.title}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: '"Comic Neue", "Comic Sans MS", cursive',
                                fontSize: '0.95rem',
                                color: '#2D3748',
                              }}
                            >
                              {currentFact.content}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </LearningCard>
                  </motion.div>

                  {/* Right Arrow */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: { xs: -16, sm: -24 },
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: 2,
                      display: currentSection === learningData.lenses.length - 1 ? 'none' : 'flex',
                    }}
                    onClick={() => setCurrentSection((prev) => Math.min(prev + 1, learningData.lenses.length - 1))}
                    aria-label="Next"
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Box>

                {/* Improved navigation dots with labels */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 1,
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: { xs: 0.5, sm: 1 },
                    maxWidth: '100%',
                    overflow: 'auto'
                  }}
                >
                  {learningData.lenses.map((lens, index) => (
                    <motion.div
                      key={index}
                      animate={{ 
                        scale: currentSection === index ? 1.1 : 1, 
                        opacity: currentSection === index ? 1 : 0.7 
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{ display: 'inline-block' }}
                      onClick={() => setCurrentSection(index)}
                    >
                      <Box
                        sx={{
                          borderRadius: 2,
                          px: { xs: 0.5, sm: 1 },
                          py: 0.5,
                          mx: { xs: 0.3, sm: 0.5 },
                          bgcolor: currentSection === index ? `${lensColors[lens.name]}30` : 'transparent',
                          border: currentSection === index ? `1px solid ${lensColors[lens.name]}` : '1px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: { xs: 'column', md: 'row' },
                          minWidth: { xs: 35, sm: 40, md: 'auto' },
                          maxWidth: { xs: 60, sm: 100, md: 'none' },
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: currentSection === index ? lensColors[lens.name] : 'rgba(0, 0, 0, 0.2)',
                            mr: { xs: 0, md: 1 },
                            mb: { xs: 0.5, md: 0 },
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: { xs: 'none', sm: 'block' },
                            fontWeight: currentSection === index ? 600 : 400,
                            fontSize: '0.7rem',
                            color: currentSection === index ? lensColors[lens.name] : 'rgba(0, 0, 0, 0.6)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {lens.name}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>

              {/* Inline World Map when on geography section */}
              {isGeographySection && (enhancedData?.countryCode || enhancedData?.countries) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box sx={{ mt: 4, mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: lensColors['Where It Comes From']
                        }}
                      >
                        <PublicIcon sx={{ mr: 1 }} />
                        Where {learningData.object} Come{learningData.object.endsWith('s') ? '' : 's'} From
                      </Typography>
                      
                      {/* Add interactive country button */}
                      {learningData.object.toLowerCase().includes('skate') && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PublicIcon />}
                          onClick={() => {
                            // Add Netherlands as a historical origin for skates
                            if (enhancedData) {
                              const updatedData = { ...enhancedData };
                              // Create or update countries array
                              const countries = updatedData.countries || [];
                              // Check if Netherlands is already in the list
                              if (!countries.some(c => c.code === 'NLD')) {
                                updatedData.countries = [
                                  ...countries,
                                  { code: 'NLD', name: 'Netherlands' }
                                ];
                                // Update the learning data
                                setLearningData({
                                  ...learningData,
                                  enhancedData: updatedData
                                });
                              }
                            }
                          }}
                          sx={{ 
                            borderColor: lensColors['Where It Comes From'],
                            color: lensColors['Where It Comes From'],
                            '&:hover': {
                              borderColor: lensColors['Where It Comes From'],
                              backgroundColor: `${lensColors['Where It Comes From']}10`
                            }
                          }}
                        >
                          Show Historical Origin
                        </Button>
                      )}
                    </Box>
                    
                    {/* Pass countries data to WorldMap if available */}
                    <Box 
                      sx={{ 
                        borderRadius: 2, 
                        overflow: 'hidden',
                        border: '1px solid #DDE6F0',
                        '& .leaflet-container': {
                          width: '100%',
                          height: '100%'
                        }
                      }}
                    >
                      <WorldMap 
                        countryName={enhancedData?.countryName} 
                        countryCode={enhancedData?.countryCode}
                        countries={enhancedData?.countries}
                        funFact={enhancedData?.geographyFacts} 
                        inline={true}
                        height={350}
                      />
                    </Box>
                  </Box>
                </motion.div>
              )}
            </Box>

            {/* Explore More Section - Simplified with only World Map and Vocabulary */}
            {(hasMap || hasVocabulary) && !isGeographySection && (
              // Only show this section when not on geography section
              <Box sx={{ width: '100%', mt: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: '#2D3748',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolIcon sx={{ mr: 1, color: '#5E7BFF' }} />
                    Explore More About {learningData.object}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 3 }}>
                    {/* Geography/Map Section - Show map directly */}
                    {hasMap && (
                      <Box 
                        sx={{ 
                          flex: 1,
                          p: 0, 
                          bgcolor: 'white', 
                          borderRadius: 3,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                          overflow: 'hidden', // Ensure content doesn't overflow rounded corners
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 2,
                          mb: 0,
                          backgroundColor: '#F8FCFF', 
                          borderBottom: '1px solid #E5EFF5'
                        }}>
                          <PublicIcon sx={{ color: '#4ECDC4', fontSize: 22, mr: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            Geography
                          </Typography>
                        </Box>
                        
                        <Box sx={{ p: 2, pb: 0 }}>
                          <Typography variant="body1" sx={{ mb: 2, fontSize: '0.95rem' }}>
                            {enhancedData?.geographyFacts || `Learn about where ${learningData.object} comes from.`}
                          </Typography>
                        </Box>
                        
                        {/* Show map directly with improved layout */}
                        <Box 
                          sx={{ 
                            borderRadius: 0,
                            overflow: 'hidden',
                            '& .leaflet-container': {
                              width: '100%',
                              height: '100%'
                            }
                          }}
                        >
                          <WorldMap 
                            countryName={enhancedData?.countryName} 
                            countryCode={enhancedData?.countryCode}
                            countries={enhancedData?.countries}
                            funFact={undefined} // Remove the funFact to avoid duplication since we already show the geography facts above
                            inline={true}
                            height={320}
                          />
                        </Box>
                      </Box>
                    )}
                    
                    {/* Vocabulary Section - Show vocabulary cards directly with swipe functionality */}
                    {hasVocabulary && (
                      <Box 
                        sx={{ 
                          flex: 1,
                          p: 3, 
                          bgcolor: 'white', 
                          borderRadius: 3,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TranslateIcon sx={{ color: '#6C63FF', fontSize: 24, mr: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Vocabulary
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                          Learn how to say "{learningData.object}" in different languages:
                        </Typography>
                        
                        {/* Display vocabulary cards with swipable functionality */}
                        {enhancedData?.vocabulary && enhancedData.vocabulary.length > 0 && (
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            {enhancedData.vocabulary.length > 1 && (
                              <>
                                <IconButton
                                  sx={{
                                    position: 'absolute',
                                    left: -12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 2,
                                    background: 'rgba(255,255,255,0.9)',
                                    boxShadow: 2,
                                    display: vocabCardIndex === 0 ? 'none' : 'flex',
                                    width: 32,
                                    height: 32,
                                  }}
                                  onClick={() => setVocabCardIndex((prev) => Math.max(prev - 1, 0))}
                                  aria-label="Previous vocabulary card"
                                >
                                  <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                
                                <IconButton
                                  sx={{
                                    position: 'absolute',
                                    right: -12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 2,
                                    background: 'rgba(255,255,255,0.9)',
                                    boxShadow: 2,
                                    display: enhancedData?.vocabulary && vocabCardIndex === (enhancedData.vocabulary.length - 1) ? 'none' : 'flex',
                                    width: 32,
                                    height: 32,
                                  }}
                                  onClick={() => {
                                    const vocabulary = enhancedData?.vocabulary || [];
                                    if (vocabulary.length > 0) {
                                      setVocabCardIndex((prev) => Math.min(prev + 1, vocabulary.length - 1));
                                    }
                                  }}
                                  aria-label="Next vocabulary card"
                                >
                                  <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </>
                            )}
                            
                            <motion.div
                              {...vocabSwipeHandlers}
                              key={vocabCardIndex}
                              initial={{ opacity: 0, x: 50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -50 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 3,
                                  borderRadius: 2,
                                  backgroundColor: vocabCardIndex % 2 === 0 ? '#F0F7FF' : '#F5F3FF',
                                  border: `1px solid ${vocabCardIndex % 2 === 0 ? '#E1EFFF' : '#EAE6FF'}`,
                                  minHeight: 200,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: vocabCardIndex % 2 === 0 ? '#6C63FF' : '#5EC6FF' }}>
                                      {enhancedData?.vocabulary && enhancedData.vocabulary[vocabCardIndex]?.word}
                                    </Typography>
                                    <Chip 
                                      size="small" 
                                      label={enhancedData?.vocabulary && enhancedData.vocabulary[vocabCardIndex]?.language} 
                                      sx={{ 
                                        bgcolor: vocabCardIndex % 2 === 0 ? '#6C63FF' : '#5EC6FF', 
                                        color: 'white', 
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        px: 1
                                      }} 
                                    />
                                  </Box>
                                  
                                  {enhancedData?.vocabulary && enhancedData.vocabulary[vocabCardIndex]?.pronunciation && (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: 'text.secondary', 
                                        mb: 3,
                                        fontFamily: 'monospace',
                                        bgcolor: 'rgba(0,0,0,0.03)',
                                        p: 1,
                                        borderRadius: 1,
                                        display: 'inline-block'
                                      }}
                                    >
                                      Pronunciation: {enhancedData.vocabulary[vocabCardIndex].pronunciation}
                                    </Typography>
                                  )}
                                  
                                  <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                                    {enhancedData?.vocabulary && enhancedData.vocabulary[vocabCardIndex]?.translation}
                                  </Typography>
                                </Box>
                                
                                {enhancedData?.vocabulary && enhancedData.vocabulary[vocabCardIndex]?.example && (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontStyle: 'italic', 
                                      color: 'text.secondary',
                                      p: 2,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(255,255,255,0.5)'
                                    }}
                                  >
                                    "{enhancedData.vocabulary[vocabCardIndex].example}"
                                  </Typography>
                                )}
                                
                                {/* Pagination dots for vocabulary cards */}
                                {enhancedData?.vocabulary && enhancedData.vocabulary.length > 1 && (
                                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    {enhancedData.vocabulary.map((_, idx) => (
                                      <Box 
                                        key={idx}
                                        sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: '50%',
                                          mx: 0.5,
                                          bgcolor: vocabCardIndex === idx 
                                            ? (vocabCardIndex % 2 === 0 ? '#6C63FF' : '#5EC6FF')
                                            : 'rgba(0,0,0,0.1)',
                                          transition: 'all 0.2s',
                                          cursor: 'pointer'
                                        }}
                                        onClick={() => setVocabCardIndex(idx)}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Paper>
                            </motion.div>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </Box>
            )}
            
            {/* Enhanced Components - Shown when activated */}
            {enhancedData && (
              <>
                {/* We no longer need these modal components since content is displayed inline */}
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Helper function to get fact icon
const getFactIcon = (type: string) => {
  switch (type) {
    case 'fun':
      return <StarIcon sx={{ fontSize: 20, color: '#FFD93D' }} />;
    case 'science':
      return <ScienceIcon sx={{ fontSize: 20, color: '#6FDFDF' }} />;
    case 'history':
      return <LightbulbIcon sx={{ fontSize: 20, color: '#FF9CA2' }} />;
    case 'game':
      return <SportsEsportsIcon sx={{ fontSize: 20, color: '#6BE4A3' }} />;
    case 'challenge':
      return <EmojiObjectsIcon sx={{ fontSize: 20, color: '#AD98FF' }} />;
    default:
      return <StarIcon sx={{ fontSize: 20, color: '#FFD93D' }} />;
  }
};

export default LearningCards; 