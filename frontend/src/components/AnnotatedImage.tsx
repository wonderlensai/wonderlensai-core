import React, { useState } from 'react';
import { Box, Typography, Paper, Popover, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import InfoIcon from '@mui/icons-material/Info';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

interface Annotation {
  id: number;
  x: number; // percent from left
  y: number; // percent from top
  label: string;
  description: string;
  color?: string;
}

interface AnnotatedImageProps {
  imageUrl: string;
  title?: string;
  annotations: Annotation[];
  showComponent: boolean;
  onClose: () => void;
  altText?: string;
}

const AnnotatedImage: React.FC<AnnotatedImageProps> = ({
  imageUrl,
  title = "Annotated Image",
  annotations,
  showComponent,
  onClose,
  altText = "Interactive annotated image"
}) => {
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!showComponent) return null;

  const handleAnnotationClick = (event: React.MouseEvent<HTMLDivElement>, annotation: Annotation) => {
    setOpenPopover(event.currentTarget);
    setSelectedAnnotation(annotation);
  };

  const handlePopoverClose = () => {
    setOpenPopover(null);
    setSelectedAnnotation(null);
  };

  const getRandomColor = (id: number) => {
    const colors = [
      '#FF6B6B', '#FFD93D', '#6BE4A3', '#6FDFDF', '#5E7BFF', 
      '#FF9CA2', '#AD98FF', '#A0E7E5'
    ];
    return colors[id % colors.length];
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '3px dashed rgba(108, 99, 255, 0.3)',
          bgcolor: 'rgba(108, 99, 255, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2D3748' }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#FF6B6B' }}
          aria-label="Close annotated image"
        >
          <HighlightOffIcon />
        </IconButton>
      </Box>

      {/* Image container with annotations */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          pt: '56.25%', // 16:9 aspect ratio
          overflow: 'hidden',
          background: '#F7F9FC',
        }}
      >
        {/* Loading skeleton while image loads */}
        {!imageLoaded && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F0F4F8',
            }}
          >
            <motion.div
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
                scale: [0.98, 1, 0.98]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              <Box sx={{
                width: '60%',
                height: '60%',
                borderRadius: 2,
                m: 'auto',
                bgcolor: '#E1E8EF',
              }} />
            </motion.div>
          </Box>
        )}
        
        {/* Actual image */}
        <img
          src={imageUrl}
          alt={altText}
          onLoad={() => setImageLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#F7F9FC',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Annotation hotspots */}
        {imageLoaded && annotations.map((annotation) => {
          const color = annotation.color || getRandomColor(annotation.id);
          return (
            <Box
              key={annotation.id}
              component={motion.div}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                transition: {
                  delay: annotation.id * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(event) => handleAnnotationClick(event as React.MouseEvent<HTMLDivElement>, annotation)}
              sx={{
                position: 'absolute',
                left: `${annotation.x}%`,
                top: `${annotation.y}%`,
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'white',
                border: `3px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                zIndex: 2,
                transition: 'all 0.2s',
              }}
              aria-label={`View annotation for ${annotation.label}`}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>
                {annotation.id}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Legend section */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          bgcolor: '#FAFBFC',
        }}
      >
        {annotations.map((annotation) => {
          const color = annotation.color || getRandomColor(annotation.id);
          return (
            <Box
              key={annotation.id}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={(event) => handleAnnotationClick(event as React.MouseEvent<HTMLDivElement>, annotation)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 0.5,
                px: 1,
                borderRadius: 2,
                bgcolor: 'white',
                border: `1px solid ${color}30`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: color,
                  mr: 1,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {annotation.id}
              </Box>
              <Typography variant="body2">{annotation.label}</Typography>
              <InfoIcon sx={{ ml: 0.5, fontSize: 14, color: 'text.secondary' }} />
            </Box>
          );
        })}
      </Box>

      {/* Popover for annotation details */}
      <Popover
        open={Boolean(openPopover)}
        anchorEl={openPopover}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            maxWidth: 300,
          }
        }}
      >
        {selectedAnnotation && (
          <Paper sx={{ p: 0 }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: selectedAnnotation.color || getRandomColor(selectedAnnotation.id),
              color: 'white'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {selectedAnnotation.label}
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2">
                {selectedAnnotation.description}
              </Typography>
            </Box>
          </Paper>
        )}
      </Popover>
    </Box>
  );
};

export default AnnotatedImage; 