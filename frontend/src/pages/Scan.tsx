import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { styled } from '@mui/material/styles';

// Enhanced styled components with premium feel
const CameraContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 600,
  height: 400,
  margin: '0 auto',
  borderRadius: 24,
  overflow: 'hidden',
  backgroundColor: '#000',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
  },
}));

const CameraButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 72,
  height: 72,
  backgroundColor: alpha(theme.palette.primary.main, 0.9),
  backdropFilter: 'blur(8px)',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translateX(-50%) scale(1.05)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 36,
    color: '#fff',
  },
  transition: 'all 0.3s ease',
}));

const PreviewImage = styled('img')(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 24,
}));

const UploadContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  height: 400,
  margin: '0 auto',
  borderRadius: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const AnalyzeButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
  },
  transition: 'all 0.3s ease',
}));

// Utility to compress image to below 100 KB
async function compressImageToBase64(
  fileOrDataUrl: File | string,
  maxSizeKB = 100,
  maxWidth = 800,
  maxHeight = 800
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let [w, h] = [img.width, img.height];
      if (w > maxWidth || h > maxHeight) {
        const scale = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      ctx.drawImage(img, 0, 0, w, h);
      
      // Start with a lower quality for better compression
      let quality = 0.6;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // If still too large, reduce quality further
      while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      // If still too large, reduce dimensions
      if (dataUrl.length / 1024 > maxSizeKB) {
        const scale = Math.sqrt(maxSizeKB / (dataUrl.length / 1024));
        w = Math.round(w * scale);
        h = Math.round(h * scale);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      }
      
      resolve(dataUrl);
    };
    img.onerror = reject;
    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

const Scan = () => {
  const { subject = 'unknown' } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [tab, setTab] = useState(0); // 0 = Camera, 1 = Upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customPrompt] = useState('');

  // Stop camera utility
  const stopCamera = () => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  };

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleBack = () => {
    stopCamera();
    navigate('/');
  };

  // Camera capture
  const handleCapture = async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload handler
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setCapturedImage(null); // clear camera image if any
    };
    reader.readAsDataURL(file);
  };

  // Analyze (send to backend)
  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const imageData = uploadedImage || capturedImage;
      if (!imageData) {
        console.log('No image data available');
        return;
      }
      console.log('Starting image analysis for subject:', subject);
      stopCamera();
      
      // Log original image size
      const originalSizeKB = Math.round(imageData.length / 1024);
      console.log('Original image size:', originalSizeKB, 'KB');
      console.log('Original image data length:', imageData.length, 'bytes');
      
      // Compress image before sending
      console.log('Starting image compression...');
      const compressedImage = await compressImageToBase64(imageData, 100);
      const compressedSizeKB = Math.round(compressedImage.length / 1024);
      console.log('Compressed image size:', compressedSizeKB, 'KB');
      console.log('Compressed image data length:', compressedImage.length, 'bytes');
      console.log('Compression ratio:', (originalSizeKB / compressedSizeKB).toFixed(2), 'x');

      // Verify compression worked
      if (compressedSizeKB >= originalSizeKB) {
        console.warn('Compression did not reduce image size!');
      }

      console.log('Preparing API request...');
      const requestBody = {
        image: compressedImage,
        subject: subject,
        prompt: customPrompt
      };
      const requestSizeKB = Math.round(JSON.stringify(requestBody).length / 1024);
      console.log('Request payload size:', requestSizeKB, 'KB');

      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:7001/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Received response from backend:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to analyze image');
      }
      
      const learningData = await response.json();
      console.log('Successfully received learning data:', learningData);
      
      navigate(`/learn/${subject}`, {
        state: {
          imageData: compressedImage,
          learningData,
        },
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      // You might want to show this error to the user
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Camera start/stop logic (if needed)
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  // Tab switch: stop camera if switching away from camera
  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    if (newValue !== 0) stopCamera();
    if (newValue === 0) setUploadedImage(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton 
              onClick={handleBack} 
              sx={{ 
                mr: 2,
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '-0.5px',
              }}
            >
              Wonderlens AI
            </Typography>
          </Box>
        </motion.div>

        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          centered 
          sx={{ 
            mb: 4,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
            },
          }}
        >
          <StyledTab icon={<CameraAltIcon />} label="Camera" />
          <StyledTab icon={<UploadFileIcon />} label="Upload" />
        </Tabs>

        <AnimatePresence mode="wait">
          {tab === 0 ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CameraContainer>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {!stream && !capturedImage && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
                      Click to start camera
                    </Typography>
                  </Box>
                )}
                {capturedImage ? (
                  <PreviewImage src={capturedImage} alt="Preview" />
                ) : stream ? (
                  <CameraButton onClick={handleCapture} disabled={isLoading}>
                    {isLoading ? (
                      <CircularProgress size={40} sx={{ color: 'white' }} />
                    ) : (
                      <CameraAltIcon />
                    )}
                  </CameraButton>
                ) : (
                  <CameraButton onClick={startCamera}>
                    <CameraAltIcon />
                  </CameraButton>
                )}
              </CameraContainer>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UploadContainer>
                {uploadedImage ? (
                  <PreviewImage src={uploadedImage} alt="Uploaded Preview" />
                ) : (
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    sx={{ 
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      padding: '12px 24px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,1)',
                      },
                    }}
                  >
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleUpload}
                    />
                  </Button>
                )}
              </UploadContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {(capturedImage || uploadedImage) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <AnalyzeButton
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Analyze'}
              </AnalyzeButton>
            </Box>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography
            variant="body1"
            align="center"
            sx={{ 
              mt: 4, 
              color: 'text.secondary',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            {tab === 0
              ? 'Point your camera at something interesting or upload an image to learn more about it!'
              : 'Upload an image to learn more about it!'}
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Scan; 