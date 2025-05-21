import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

// Enhanced styled components with premium feel
const CameraContainer = styled(Paper)(() => ({
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

const CameraButton = styled(IconButton)(() => ({
  position: 'absolute',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 72,
  height: 72,
  backgroundColor: '#5EC6FF', // Main accent color
  backdropFilter: 'blur(8px)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5EC6FF 0%, #AD98FF 100%)',
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

const UploadContainer = styled(Paper)(() => ({
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

const StyledTab = styled(Tab)(() => ({
  minHeight: 64,
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
  '&.Mui-selected': {
    color: '#FF6B6B',
  },
}));

const AnalyzeButton = styled(Button)(() => ({
  borderRadius: 16,
  padding: '12px 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #FF6B6B 0%, #E64A4A 100%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
  },
  transition: 'all 0.3s ease',
}));

// Interface for cached scanned items
interface ScannedItem {
  id: string;
  timestamp: number;
  imageData: string;
  learningData: {
    object: string;
    category?: string;
    lenses: Array<{ name: string; text: string }>;
    message?: string;
    countryInfo?: {
      origin: string;
      relevance: string;
    };
    vocabulary?: {
      primaryTerm: string;
      relatedTerms: string[];
      simpleDef: string;
    };
  };
}

// Cache key for storing items in localStorage
const CACHE_KEY = 'wonderlens_scanned_items';

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

// Add device info utility
function generateUUID() {
  // RFC4122 version 4 compliant UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function getDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}
function getDeviceInfo() {
  return {
    deviceId: getDeviceId(),
    deviceType: navigator.platform || 'web',
    osVersion: navigator.userAgent,
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
  };
}

const Scan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [tab, setTab] = useState(0); // 0 = Camera, 1 = Upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cachedItems, setCachedItems] = useState<ScannedItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load cached items
  useEffect(() => {
    const fetchScanHistory = async () => {
      try {
        setIsLoading(true);
        
        // Get device ID for the current session
        const deviceId = getDeviceId();
        
        // Fetch scan history from the backend
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scans/history?device_id=${deviceId}`);
        
        if (!response.ok) {
          console.error('Error fetching scan history:', response.status);
          return;
        }
        
        const historyData = await response.json();
        console.log('[Frontend] Received scan history:', historyData);
        
        // Transform the backend response to match the ScannedItem interface
        const transformedItems: ScannedItem[] = historyData.map((item: any) => ({
          id: item.id,
          timestamp: item.timestamp,
          imageData: item.image_url, // This might need conversion if it's a Supabase URL
          learningData: item.learningData
        }));
        
        setCachedItems(transformedItems);
        setShowHistory(transformedItems.length > 0);
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScanHistory();
  }, []);

  // Function to handle viewing a cached item
  const handleViewCachedItem = (item: ScannedItem) => {
    // Navigate to learning card page with the item data
    // The image could be a URL or base64 - the LearningCards component handles both
    navigate('/learning-card', {
      state: {
        imageData: item.imageData,
        learningData: item.learningData,
      },
    });
  };

  // Function to delete a cached item
  const handleDeleteCachedItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    try {
      // Send delete request to backend
      const deviceId = getDeviceId();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scans/${id}?device_id=${deviceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.error('Failed to delete item:', response.status);
        return;
      }
      
      // Update state
      const updatedItems = cachedItems.filter(item => item.id !== id);
      setCachedItems(updatedItems);
      setShowHistory(updatedItems.length > 0);
    } catch (error) {
      console.error('Error deleting cached item:', error);
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log('Camera stream set on video element (from useEffect)', stream);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
        console.log('[Camera] Captured DataURL:', imageData.substring(0, 100), '...');
        console.log('[Camera] DataURL length:', imageData.length);
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
      const result = event.target?.result as string;
      console.log('[Upload] Uploaded DataURL:', result.substring(0, 100), '...');
      console.log('[Upload] DataURL length:', result.length);
      setUploadedImage(result);
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
      // Validate DataURL
      if (!imageData.startsWith('data:image/')) {
        alert('Invalid image data. Please try again.');
        setIsLoading(false);
        return;
      }
      console.log('Starting image analysis');
      stopCamera();
      
      // Log original image size
      const originalSizeKB = Math.round(imageData.length / 1024);
      console.log('Original image size:', originalSizeKB, 'KB');
      
      // Compress image before sending
      console.log('Starting image compression...');
      const compressedImage = await compressImageToBase64(imageData, 100);
      const compressedSizeKB = Math.round(compressedImage.length / 1024);
      console.log('Compressed image size:', compressedSizeKB, 'KB');

      // Verify compression worked
      if (compressedSizeKB >= originalSizeKB) {
        console.warn('Compression did not reduce image size!');
      }

      // Add device_info to request
      const deviceInfo = getDeviceInfo();
      console.log('Device info to send:', deviceInfo);

      console.log('Preparing API request...');
      const requestBody = {
        image: compressedImage,
        device_info: deviceInfo
      };
      const requestSizeKB = Math.round(JSON.stringify(requestBody).length / 1024);
      console.log('Request payload size:', requestSizeKB, 'KB');
      console.log('Request body:', requestBody);

      console.log('Sending request to backend...');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Received response from backend:', response.status);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Unknown error (no JSON response from server)' };
        }
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to analyze image');
      }
      
      const learningData = await response.json();
      console.log('Successfully received learning data:', learningData);
      
      // Navigate to learning card page with the response data
      navigate('/learning-card', {
        state: {
          imageData: compressedImage,
          learningData,
        },
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Camera start/stop logic (if needed)
  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Camera stream set on video element', mediaStream);
      } else {
        console.log('videoRef.current is null');
      }
    } catch (error) {
      setCameraError('Unable to access camera. Please check permissions and try again.');
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
        background: '#F8FBFF',
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          centered 
          sx={{ 
            mb: 4,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
              backgroundColor: tab === 0 ? '#5EC6FF' : '#AD98FF',
            },
          }}
        >
          <StyledTab 
            icon={<CameraAltIcon sx={{ color: tab === 0 ? '#5EC6FF' : '#7A869A' }} />} 
            label="Camera" 
            sx={{ color: tab === 0 ? '#5EC6FF' : '#7A869A', fontWeight: tab === 0 ? 700 : 500 }} 
          />
          <StyledTab 
            icon={<UploadFileIcon sx={{ color: tab === 1 ? '#AD98FF' : '#7A869A' }} />} 
            label="Upload" 
            sx={{ color: tab === 1 ? '#AD98FF' : '#7A869A', fontWeight: tab === 1 ? 700 : 500 }} 
          />
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
              <CameraContainer sx={{ backgroundColor: '#FFFFFF' }}>
                {capturedImage ? (
                  <>
                    <PreviewImage src={capturedImage} alt="Preview" style={{ boxShadow: '0 4px 24px rgba(94,198,255,0.12)', border: '4px solid #fff', marginTop: 24 }} />
                    <Box sx={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', gap: 2 }}>
                      <Button variant="outlined" onClick={() => { setCapturedImage(null); startCamera(); }} sx={{ borderRadius: 8, fontWeight: 600, px: 4, py: 1, color: '#5EC6FF', borderColor: '#5EC6FF', '&:hover': { borderColor: '#AD98FF', color: '#AD98FF' } }}>
                        Retake
                      </Button>
                      <Button variant="contained" onClick={handleAnalyze} sx={{ borderRadius: 8, fontWeight: 600, px: 4, py: 1, background: 'linear-gradient(135deg, #5EC6FF 0%, #AD98FF 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(94,198,255,0.12)', '&:hover': { background: 'linear-gradient(135deg, #AD98FF 0%, #5EC6FF 100%)' } }} disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Analyze'}
                      </Button>
                    </Box>
                  </>
                ) : stream ? (
                  <>
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
                    <CameraButton onClick={handleCapture} disabled={isLoading}>
                      {isLoading ? (
                        <CircularProgress size={40} sx={{ color: 'white' }} />
                      ) : (
                        <>
                          <CameraAltIcon />
                          <Typography variant="caption" sx={{ color: 'white', display: 'block', mt: 1 }}>
                            Click Picture
                          </Typography>
                        </>
                      )}
                    </CameraButton>
                  </>
                ) : (
                  <>
                    {cameraError && (
                      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>{cameraError}</Typography>
                      </Box>
                    )}
                    <CameraButton onClick={startCamera}>
                      <CameraAltIcon />
                    </CameraButton>
                  </>
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
              <UploadContainer sx={{ backgroundColor: '#FFFFFF' }}>
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
                      background: 'linear-gradient(135deg, #5EC6FF 0%, #AD98FF 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 20px rgba(94,198,255,0.12)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #AD98FF 0%, #5EC6FF 100%)',
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

        {(uploadedImage) && (
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
              ? 'Click the button to take a picture, then analyze it to learn more!'
              : 'Upload an image to learn more about it!'}
          </Typography>
        </motion.div>

        {/* Previously Scanned Items Section */}
        {cachedItems.length > 0 && (
          <Box sx={{ mt: 7, width: '100%' }}>
            {/* History Header */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1, color: '#6C63FF' }} />
                <Typography 
                  variant="h6" 
                  sx={{ fontWeight: 600, color: '#2D3748' }}
                >
                  Previously Scanned
                </Typography>
              </Box>
              <Button 
                onClick={() => setShowHistory(!showHistory)}
                sx={{ fontSize: '0.875rem' }}
              >
                {showHistory ? 'Hide' : 'Show'}
              </Button>
            </Box>

            {/* Cached Items Grid */}
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={2}>
                  {/* Limit to first 6 items (2 rows on mobile, 3 rows on desktop) */}
                  {cachedItems.slice(0, 6).map((item) => (
                    <Grid item xs={6} sm={4} key={item.id}>
                      <Card 
                        sx={{ 
                          borderRadius: 3, 
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          transition: 'all 0.2s',
                          height: '100%', // Make all cards the same height
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative', width: '100%' }}>
                          {/* Delete button outside of CardActionArea */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 2,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => handleDeleteCachedItem(item.id, e)}
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.8)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" sx={{ color: '#FF6B6B' }} />
                            </IconButton>
                          </Box>

                          <CardActionArea 
                            onClick={() => handleViewCachedItem(item)}
                            sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              height: '100%', 
                              alignItems: 'stretch'
                            }}
                          >
                            <Box sx={{ position: 'relative', width: '100%', pt: '75%' /* 4:3 Aspect Ratio */ }}>
                              <CardMedia
                                component="img"
                                image={item.imageData}
                                alt={`Scanned ${item.learningData.object}`}
                                sx={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  backgroundColor: '#f0f0f0'
                                }}
                                onError={(e) => {
                                  // If image fails to load from URL, show a placeholder
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null; // Prevent infinite error loop
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWltYWdlIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ij48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIj48L3BvbHlsaW5lPjwvc3ZnPg==';
                                }}
                              />
                                                          </Box>
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  lineHeight: 1.2,
                                }}
                                noWrap
                              >
                                {item.learningData.object}
                              </Typography>
                              
                              {item.learningData.category && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: 'text.primary',
                                    fontSize: '0.7rem',
                                    bgcolor: '#f0f0f0',
                                    px: 0.5,
                                    py: 0.2,
                                    borderRadius: 1,
                                    display: 'inline-block',
                                    mt: 0.5,
                                    maxWidth: 'fit-content'
                                  }}
                                >
                                  {item.learningData.category}
                                </Typography>
                              )}
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.7rem',
                                  mt: 'auto',
                                  pt: 0.5
                                }}
                              >
                                {formatDate(item.timestamp)}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                         </Box>
                        </Card>
                    </Grid>
                  ))}
                </Grid>
                
                {/* Add Load More button if there are more items */}
                {cachedItems.length > 6 && (
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/scan-history')}
                      startIcon={<HistoryIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: '#6C63FF',
                        color: '#6C63FF',
                        '&:hover': {
                          backgroundColor: 'rgba(108, 99, 255, 0.05)',
                          borderColor: '#5753e0',
                        }
                      }}
                    >
                      View All History
                    </Button>
                  </Box>
                )}
              </motion.div>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Scan; 