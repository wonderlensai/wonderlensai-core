import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Chip,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ScienceIcon from '@mui/icons-material/Science';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import FlareIcon from '@mui/icons-material/Flare';
import CloseIcon from '@mui/icons-material/Close';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChildCareIcon from '@mui/icons-material/ChildCare';

export interface Material {
  name: string;
  essential: boolean;
}

export interface ExperimentStep {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface ScienceExperimentProps {
  title: string;
  description: string;
  ageRange: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: string;
  materials: Material[];
  steps: ExperimentStep[];
  learningPoints: string[];
  safetyNotes?: string[];
  showComponent: boolean;
  onClose: () => void;
}

const ScienceExperiment: React.FC<ScienceExperimentProps> = ({
  title,
  description,
  ageRange,
  difficulty,
  timeRequired,
  materials,
  steps,
  learningPoints,
  safetyNotes = [],
  showComponent,
  onClose
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{[k: number]: boolean}>({});

  useEffect(() => {
    if (!showComponent) {
      // Reset state when component is hidden
      setActiveStep(0);
      setCompleted({});
    }
  }, [showComponent]);

  if (!showComponent) return null;

  const totalSteps = steps.length;
  const allStepsCompleted = Object.keys(completed).length === totalSteps;

  const handleNext = () => {
    const newCompleted = {...completed};
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    
    const newActiveStep = Math.min(activeStep + 1, totalSteps);
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  const getDifficultyColor = (level: string) => {
    switch(level) {
      case 'easy':
        return '#6BE4A3';
      case 'medium':
        return '#FFD93D';
      case 'hard':
        return '#FF6B6B';
      default:
        return '#6BE4A3';
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      sx={{
        width: '100%',
        mb: 3,
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          p: 3,
          bgcolor: 'rgba(107, 228, 163, 0.15)',
          borderBottom: '3px dashed rgba(107, 228, 163, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'rgba(107, 228, 163, 0.1)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(107, 228, 163, 0.1)',
            zIndex: 0,
          }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScienceIcon sx={{ fontSize: 32, color: '#6BE4A3', mr: 1 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#2D3748' }}>
              {title}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            aria-label="Close experiment"
            sx={{ color: '#FF6B6B' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            mb: 3,
            color: '#4A5568',
            maxWidth: '95%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {description}
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mt: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Chip
            icon={<ChildCareIcon />}
            label={`Ages: ${ageRange}`}
            size="small"
            sx={{ 
              bgcolor: 'white',
              border: '1px solid rgba(107, 228, 163, 0.5)',
            }}
          />
          
          <Chip
            icon={<EmojiObjectsIcon />}
            label={`Difficulty: ${difficulty}`}
            size="small"
            sx={{ 
              bgcolor: 'white',
              border: `1px solid ${getDifficultyColor(difficulty)}`,
              '& .MuiChip-icon': {
                color: getDifficultyColor(difficulty),
              }
            }}
          />
          
          <Chip
            icon={<PlayArrowIcon />}
            label={`Time: ${timeRequired}`}
            size="small"
            sx={{ 
              bgcolor: 'white',
              border: '1px solid rgba(94, 123, 255, 0.5)',
              '& .MuiChip-icon': {
                color: '#5E7BFF',
              }
            }}
          />
        </Box>
      </Box>

      {/* Materials Section */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ListAltIcon sx={{ color: '#FFD93D', mr: 1 }} />
          <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 700 }}>
            Materials You'll Need
          </Typography>
        </Box>
        
        <List sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 0 }}>
          {materials.map((material, index) => (
            <Chip
              key={index}
              label={material.name}
              variant={material.essential ? "filled" : "outlined"}
              color={material.essential ? "primary" : "default"}
              size="small"
              sx={{ 
                borderRadius: 1,
                px: 1,
              }}
            />
          ))}
        </List>
      </Box>

      {/* Instructions Stepper */}
      <Box sx={{ p: 3 }}>
        <Stepper 
          activeStep={activeStep} 
          orientation="vertical"
          sx={{
            '& .MuiStepLabel-root': {
              cursor: 'pointer'
            }
          }}
        >
          {steps.map((step, index) => (
            <Step key={index} completed={completed[index]}>
              <StepLabel onClick={handleStep(index)}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    color: activeStep === index ? '#5E7BFF' : '#2D3748' 
                  }}
                >
                  {step.title}
                </Typography>
              </StepLabel>
              <Box sx={{ ml: 2, mt: 1, mb: 2, display: activeStep === index ? 'block' : 'none' }}>
                <AnimatePresence>
                  {activeStep === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: 2,
                          borderColor: 'rgba(0,0,0,0.1)',
                          mb: 2
                        }}
                      >
                        <CardContent>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontFamily: '"Comic Neue", "Comic Sans MS", cursive',
                              fontSize: '1.1rem',
                              mb: 2 
                            }}
                          >
                            {step.description}
                          </Typography>
                          
                          {step.imageUrl && (
                            <Box 
                              sx={{ 
                                mt: 2, 
                                mb: 2, 
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            >
                              <img 
                                src={step.imageUrl} 
                                alt={`Step ${index + 1}: ${step.title}`} 
                                style={{ 
                                  width: '100%', 
                                  height: 'auto', 
                                  display: 'block'
                                }} 
                              />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button 
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          variant="outlined"
                        >
                          Back
                        </Button>
                        <Button 
                          onClick={handleNext}
                          variant="contained"
                          color="primary"
                        >
                          {index === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </Step>
          ))}
        </Stepper>
        
        {allStepsCompleted && (
          <Box 
            sx={{ 
              mt: 3, 
              p: 3, 
              borderRadius: 2, 
              bgcolor: 'rgba(107, 228, 163, 0.1)',
              border: '2px dashed #6BE4A3'
            }}
          >
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: '#2D3748' }}>
              <CheckCircleIcon sx={{ color: '#6BE4A3', mr: 1 }} />
              Great job! You've completed the experiment!
            </Typography>
            <Button 
              onClick={handleReset}
              variant="outlined" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Start Over
            </Button>
          </Box>
        )}
      </Box>

      {/* Learning Points */}
      <Box sx={{ p: 3, bgcolor: 'rgba(94, 123, 255, 0.05)', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiObjectsIcon sx={{ color: '#5E7BFF', mr: 1 }} />
          <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 700 }}>
            What You'll Learn
          </Typography>
        </Box>
        
        <List sx={{ pt: 0 }}>
          {learningPoints.map((point, index) => (
            <ListItem 
              key={index}
              sx={{ 
                px: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(94, 123, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <FlareIcon sx={{ color: '#5E7BFF' }} />
              </ListItemIcon>
              <ListItemText 
                primary={point}
                primaryTypographyProps={{
                  variant: 'body1',
                  fontWeight: 500,
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Safety Notes, if any */}
      {safetyNotes.length > 0 && (
        <Box sx={{ p: 3, bgcolor: 'rgba(255, 107, 107, 0.05)', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon sx={{ color: '#FF6B6B', mr: 1 }} />
            <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 700 }}>
              Safety Notes
            </Typography>
          </Box>
          
          <List sx={{ pt: 0 }}>
            {safetyNotes.map((note, index) => (
              <ListItem 
                key={index}
                sx={{ 
                  px: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <WarningIcon sx={{ color: '#FF6B6B' }} fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={note}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default ScienceExperiment; 