import React, { useState, useRef } from 'react';
import { Box, Typography, IconButton, Paper, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TranslateIcon from '@mui/icons-material/Translate';
import SchoolIcon from '@mui/icons-material/School';

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

interface VocabularyCardsProps {
  words: VocabularyWord[];
  title?: string;
  showComponent: boolean;
  onClose: () => void;
}

const VocabularyCards: React.FC<VocabularyCardsProps> = ({
  words,
  title = "Vocabulary",
  showComponent,
  onClose
}) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  if (!showComponent || words.length === 0) return null;

  const currentWord = words[currentIndex];
  
  const playAudio = () => {
    if (!currentWord.audio) return;
    
    const audio = new Audio(currentWord.audio);
    audio.play();
  };
  
  const resetCards = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setDirection(null);
  };
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      // Swiped right - next card
      handleCardNavigation('right');
    } else if (info.offset.x < -threshold) {
      // Swiped left - prev card
      handleCardNavigation('left');
    }
  };
  
  const handleCardNavigation = (dir: string) => {
    setExiting(true);
    setDirection(dir);
    
    // Wait for exit animation to complete
    setTimeout(() => {
      if (dir === 'right') {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
      }
      setFlipped(false);
      setExiting(false);
      setDirection(null);
    }, 300);
  };

  const cardVariants = {
    initial: (direction: string | null) => ({
      x: direction === 'right' ? -300 : direction === 'left' ? 300 : 0,
      opacity: direction ? 0 : 1,
      rotateY: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      rotateY: flipped ? 180 : 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        rotateY: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }
      }
    },
    exit: (direction: string | null) => ({
      x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
      opacity: 0,
      transition: { duration: 0.2, ease: "easeInOut" }
    })
  };

  return (
    <Box
      sx={{
        width: '100%',
        mb: 3,
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: theme.palette.primary.main,
          borderBottom: '3px dashed rgba(255,255,255,0.5)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TranslateIcon sx={{ color: 'white', fontSize: 24, mr: 1 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            {title} ({currentIndex + 1}/{words.length})
          </Typography>
        </Box>
        <Box>
          <IconButton
            onClick={resetCards}
            size="small"
            sx={{ mr: 1, color: 'white' }}
            aria-label="Reset cards"
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'white' }}
            aria-label="Close vocabulary cards"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Card Container */}
      <Box
        ref={dragConstraintsRef}
        sx={{
          position: 'relative',
          height: 320,
          bgcolor: '#FAFAFA',
          p: 3,
          perspective: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={cardVariants}
            custom={direction}
            style={{
              position: 'absolute',
              width: '100%',
              maxWidth: 320,
              height: 260,
              margin: '0 auto',
              transformStyle: 'preserve-3d',
              cursor: 'pointer',
            }}
            onClick={handleFlip}
            drag={!exiting ? "x" : false}
            dragConstraints={dragConstraintsRef}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
          >
            {/* Card Front - Word */}
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: 4,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(45deg, #5E7BFF20 0%, #738FFF40 100%)',
                border: '3px solid #5E7BFF40',
                zIndex: flipped ? 0 : 1,
                opacity: flipped ? 0 : 1,
              }}
            >
              <Typography
                variant="h4"
                component="h3"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                {currentWord.word}
              </Typography>
              
              {currentWord.pronunciation && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: 'italic',
                      color: theme.palette.text.secondary,
                      mr: 1,
                    }}
                  >
                    {currentWord.pronunciation}
                  </Typography>
                  {currentWord.audio && (
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); playAudio(); }}>
                      <VolumeUpIcon fontSize="small" color="primary" />
                    </IconButton>
                  )}
                </Box>
              )}
              
              <Chip
                label={currentWord.language}
                color="primary"
                variant="outlined"
                size="small"
                icon={<TranslateIcon />}
                sx={{ mt: 1 }}
              />
              
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  mt: 3,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                (Tap to see translation)
              </Typography>
            </Paper>

            {/* Card Back - Translation */}
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: 4,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(45deg, #FFD93D20 0%, #FFD93D40 100%)',
                border: '3px solid #FFD93D40',
                transform: 'rotateY(180deg)',
                zIndex: flipped ? 1 : 0,
                opacity: flipped ? 1 : 0,
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: 700,
                  color: '#E26D12',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                {currentWord.translation}
              </Typography>
              
              {currentWord.partOfSpeech && (
                <Chip
                  label={currentWord.partOfSpeech}
                  color="secondary"
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
              
              {currentWord.example && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: 'italic',
                      color: theme.palette.text.secondary,
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    "{currentWord.example}"
                  </Typography>
                </Box>
              )}
              
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  mt: 3,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                (Tap to see word)
              </Typography>
            </Paper>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Indicators */}
        <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          {words.map((_, index) => (
            <Box
              key={index}
              component={motion.div}
              animate={{ scale: index === currentIndex ? 1.2 : 1 }}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.2)',
                mx: 0.5,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setDirection(index > currentIndex ? 'right' : 'left');
                setExiting(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setFlipped(false);
                  setExiting(false);
                  setDirection(null);
                }, 300);
              }}
            />
          ))}
        </Box>

        {/* Swipe Instructions */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Chip
            icon={<SchoolIcon fontSize="small" />}
            label="Swipe cards to navigate"
            size="small"
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '0.75rem',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </Box>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: '#F7F9FC',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <IconButton
          onClick={() => handleCardNavigation('left')}
          disabled={exiting || words.length <= 1}
          size="large"
          sx={{
            bgcolor: theme.palette.primary.light + '20',
            '&:hover': { bgcolor: theme.palette.primary.light + '30' },
          }}
          aria-label="Previous card"
        >
          <motion.div whileTap={{ scale: 0.9 }}>
            <RefreshIcon sx={{ transform: 'scaleX(-1)' }} />
          </motion.div>
        </IconButton>
        
        <IconButton
          onClick={handleFlip}
          size="large"
          sx={{
            bgcolor: theme.palette.secondary.light + '20',
            '&:hover': { bgcolor: theme.palette.secondary.light + '30' },
          }}
          aria-label="Flip card"
        >
          <motion.div whileTap={{ scale: 0.9 }}>
            {flipped ? <CheckIcon /> : <TranslateIcon />}
          </motion.div>
        </IconButton>

        <IconButton
          onClick={() => handleCardNavigation('right')}
          disabled={exiting || words.length <= 1}
          size="large"
          sx={{
            bgcolor: theme.palette.primary.light + '20',
            '&:hover': { bgcolor: theme.palette.primary.light + '30' },
          }}
          aria-label="Next card"
        >
          <motion.div whileTap={{ scale: 0.9 }}>
            <RefreshIcon />
          </motion.div>
        </IconButton>
      </Box>
    </Box>
  );
};

export default VocabularyCards; 