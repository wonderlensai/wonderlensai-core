import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, CircularProgress, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ModelViewerProps {
  modelUrl?: string;
  title?: string;
  description?: string;
  showViewer: boolean;
  onClose: () => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  title = '3D Model',
  description = 'Interact with this 3D model - drag to rotate, pinch to zoom!',
  showViewer,
  onClose
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const modelViewerRef = useRef<HTMLIFrameElement>(null);
  const theme = useTheme();

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setTimeout(() => setIsLoading(false), 500); // Add small delay for smoother transition
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Reset the model position
  const resetModel = () => {
    if (modelViewerRef.current && modelViewerRef.current.contentWindow) {
      // This would work if we had direct access to the model-viewer element
      // Instead, we're using the iframe approach for simplicity
      modelViewerRef.current.src = modelViewerRef.current.src;
    }
  };

  // Generate iframe content with model-viewer
  const getModelViewerIframe = () => {
    // This creates an iframe that embeds the model-viewer web component
    // In a real app, you'd likely want to use the actual model-viewer element directly
    // But this approach works without additional dependencies
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: transparent;
              font-family: 'Arial', sans-serif;
            }
            model-viewer {
              width: 100%;
              height: 100%;
              background-color: transparent;
              --poster-color: transparent;
            }
            .progress {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 80px;
              height: 80px;
              color: #5E7BFF;
            }
          </style>
        </head>
        <body>
          <model-viewer
            src="${modelUrl}"
            camera-controls
            auto-rotate
            rotation-per-second="30deg"
            interaction-prompt="auto"
            ar
            shadow-intensity="1"
            exposure="0.75"
            shadow-softness="0.5"
            environment-image="neutral"
            style="background-color: transparent;"
          >
            <div class="progress" slot="poster">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" stroke="#E0E0E0" stroke-width="8" fill="none"></circle>
                <circle cx="40" cy="40" r="36" stroke="#5E7BFF" stroke-width="8" fill="none" stroke-dasharray="226" stroke-dashoffset="0">
                  <animate attributeName="stroke-dashoffset" from="226" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </model-viewer>
        </body>
      </html>
    `;
  };

  if (!showViewer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{ 
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        zIndex: isFullscreen ? 1500 : 10,
        backgroundColor: isFullscreen ? 'rgba(0,0,0,0.9)' : 'transparent',
      }}
    >
      <Box
        sx={{
          width: '100%',
          borderRadius: isFullscreen ? 0 : 3,
          overflow: 'hidden',
          boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.12)',
          border: isFullscreen ? 'none' : `3px solid ${theme.palette.primary.light}`,
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
            borderBottom: `2px dashed ${theme.palette.primary.light}`,
            bgcolor: theme.palette.primary.light + '20',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThreeDRotationIcon sx={{ color: theme.palette.primary.main, fontSize: 24, mr: 1 }} />
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={resetModel}
              size="small"
              sx={{ mr: 1, color: theme.palette.primary.main }}
              aria-label="Reset model position"
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              onClick={toggleFullscreen}
              size="small"
              sx={{ mr: 1, color: theme.palette.primary.main }}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: theme.palette.error.main }}
              aria-label="Close viewer"
            >
              <HighlightOffIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Model Viewer */}
        <Box
          sx={{
            position: 'relative',
            height: isFullscreen ? 'calc(100vh - 120px)' : 400,
            bgcolor: '#FAFAFA',
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.9)',
                zIndex: 2,
              }}
            >
              <CircularProgress size={60} color="primary" />
              <Typography variant="body1" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                Loading 3D model...
              </Typography>
            </Box>
          )}

          <iframe
            ref={modelViewerRef}
            srcDoc={getModelViewerIframe()}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              opacity: iframeLoaded && !isLoading ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
            title="3D Model Viewer"
            allow="camera; autoplay; fullscreen; xr-spatial-tracking"
            onLoad={handleIframeLoad}
          />
        </Box>

        {/* Description */}
        <Box sx={{ p: 2, borderTop: `2px dashed ${theme.palette.primary.light}`, bgcolor: theme.palette.background.paper }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: '"Comic Neue", "Comic Sans MS", cursive',
              fontSize: '1.1rem',
              color: theme.palette.text.primary,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ModelViewer; 