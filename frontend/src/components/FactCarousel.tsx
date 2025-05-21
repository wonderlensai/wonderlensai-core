import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ScienceIcon from '@mui/icons-material/Science';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StarIcon from '@mui/icons-material/Star';

interface Fact {
  id: number;
  title: string;
  content: string;
  type: 'fun' | 'science' | 'history' | 'game' | 'challenge';
  color: string;
}

interface FactCarouselProps {
  facts: Fact[];
  title?: string;
}

const FactCarousel: React.FC<FactCarouselProps> = ({ facts, title = "Cool Facts" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    if (facts.length <= 1 || isTouching) return;
    
    const interval = setInterval(() => {
      if (!isAnimating) {
        handleNext();
      }
    }, 7000);
    
    return () => clearInterval(interval);
  }, [currentIndex, isAnimating, facts.length, isTouching]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % facts.length);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + facts.length) % facts.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouching(true);
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching) return;
    
    const touchDiff = touchStart - e.touches[0].clientX;
    
    if (Math.abs(touchDiff) > 50) {
      if (touchDiff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setIsTouching(false);
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
  };

  const getFactIcon = (type: string) => {
    switch (type) {
      case 'fun':
        return <StarIcon sx={{ fontSize: 28, color: '#FFD93D' }} />;
      case 'science':
        return <ScienceIcon sx={{ fontSize: 28, color: '#6FDFDF' }} />;
      case 'history':
        return <LightbulbIcon sx={{ fontSize: 28, color: '#FF9CA2' }} />;
      case 'game':
        return <SportsEsportsIcon sx={{ fontSize: 28, color: '#6BE4A3' }} />;
      case 'challenge':
        return <EmojiObjectsIcon sx={{ fontSize: 28, color: '#AD98FF' }} />;
      default:
        return <StarIcon sx={{ fontSize: 28, color: '#FFD93D' }} />;
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }),
  };

  if (!facts || facts.length === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        width: '100%', 
        mb: 3, 
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          background: 'linear-gradient(90deg, #FFD93D 0%, #FFB6B9 100%)',
          backdropFilter: 'blur(8px)',
          borderBottom: '3px dashed rgba(255,255,255,0.5)',
        }}
      >
        {getFactIcon(facts[currentIndex].type)}
        <Typography variant="h6" component="h3" sx={{ ml: 1, color: 'white', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {title}
        </Typography>
      </Box>

      <Box 
        ref={containerRef}
        sx={{ 
          position: 'relative', 
          overflow: 'hidden',
          minHeight: 180,
          background: 'white',
          p: 2,
          touchAction: 'pan-y',
          borderRadius: '0 0 16px 16px',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence 
          initial={false} 
          custom={direction}
          onExitComplete={() => setIsAnimating(false)}
        >
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ 
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              padding: '16px'
            }}
          >
            <Paper 
              elevation={0}
              sx={{
                p: 2,
                height: '100%',
                borderRadius: 4,
                border: `2px solid ${facts[currentIndex].color}20`,
                background: `linear-gradient(135deg, ${facts[currentIndex].color}10 0%, ${facts[currentIndex].color}20 100%)`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getFactIcon(facts[currentIndex].type)}
                <Typography variant="h6" component="h3" sx={{ ml: 1, color: facts[currentIndex].color, fontWeight: 700 }}>
                  {facts[currentIndex].title}
                </Typography>
              </Box>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  flex: 1,
                  fontFamily: '"Comic Neue", "Comic Sans MS", cursive',
                  fontSize: '1.1rem',
                  lineHeight: 1.4,
                  color: '#2D3748',
                }}
              >
                {facts[currentIndex].content}
              </Typography>
            </Paper>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <Box sx={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 5 }}>
          {facts.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                mx: 0.5,
                bgcolor: index === currentIndex ? facts[currentIndex].color : 'rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s',
                transform: index === currentIndex ? 'scale(1.5)' : 'scale(1)',
              }}
              onClick={() => {
                if (isAnimating) return;
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
                setIsAnimating(true);
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Arrow navigation */}
      {facts.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
              zIndex: 2,
            }}
            disabled={isAnimating}
            aria-label="Previous fact"
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
              zIndex: 2,
            }}
            disabled={isAnimating}
            aria-label="Next fact"
          >
            <NavigateNextIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default FactCarousel; 