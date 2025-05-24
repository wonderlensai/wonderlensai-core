import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

interface CommunityScansResponse {
  id: string;
  image_url: string;
  timestamp: number;
  learningData: any;
}

interface LearningCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  learningData: any;
  imageUrl: string;
}

const LearningCardModal: React.FC<LearningCardModalProps> = ({ 
  isOpen, 
  onClose, 
  learningData, 
  imageUrl 
}) => {
  if (!learningData || !learningData.lenses) return null;

  const coreIdentity = learningData.lenses.find((lens: any) => lens.name === 'Core Identity');
  
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 10000
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
          outline: 'none'
        }}
      >
        {/* Close button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '16px'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Image */}
        <div style={{
          width: '100%',
          height: '200px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <img 
            src={imageUrl} 
            alt="Scanned object"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Learning content */}
        {coreIdentity && (
          <>
            <Typography
              variant="h6"
              style={{
                fontWeight: '700',
                color: '#2D3748',
                marginBottom: '12px',
                fontSize: '20px'
              }}
            >
              {coreIdentity.title || 'Learning Discovery'}
            </Typography>
            
            <Typography
              style={{
                fontSize: '16px',
                color: '#4A5568',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}
            >
              {coreIdentity.text || 'Amazing discovery by another young learner!'}
            </Typography>

            {/* Fun facts */}
            {learningData.lenses.map((lens: any, index: number) => (
              lens.name !== 'Core Identity' && (
                <div
                  key={index}
                  style={{
                    background: '#F7FAFC',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <Typography
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2D3748',
                      marginBottom: '4px'
                    }}
                  >
                    {lens.name}
                  </Typography>
                  <Typography
                    style={{
                      fontSize: '14px',
                      color: '#4A5568',
                      lineHeight: '1.5'
                    }}
                  >
                    {lens.text}
                  </Typography>
                </div>
              )
            ))}
          </>
        )}
      </motion.div>
    </Modal>
  );
};

const Learn: React.FC = () => {
  const [communityScans, setCommunityScans] = useState<CommunityScansResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<CommunityScansResponse | null>(null);
  const { age } = useUser();
  const navigate = useNavigate();

  // Fetch community scans
  const fetchCommunityScans = async () => {
    try {
      setLoading(true);
      setError(null);
      const ageParam = age ? `&age=${age}` : '';
      
      // Helper function to determine if we're running in development
      const isDevelopment = () => {
        return import.meta.env.DEV || 
               window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
      };
      
      // Get the correct API endpoint based on environment
      const getApiUrl = (endpoint: string) => {
        // In development without explicit VITE_API_URL, use localhost
        if (isDevelopment() && !import.meta.env.VITE_API_URL) {
          return `http://localhost:7001${endpoint}`;
        }
        
        // For production environment or when VITE_API_URL is set
        if (import.meta.env.PROD) {
          // Try multiple potential API URLs in order of preference
          // 1. Use VITE_API_URL from env if available
          if (import.meta.env.VITE_API_URL) {
            return `${import.meta.env.VITE_API_URL}${endpoint}`;
          }
          
          // 2. Use Render backend URL (where the API is hosted)
          const renderUrl = 'https://wonderlensai-core.onrender.com';
          return `${renderUrl}${endpoint}`;
        }
        
        // Otherwise use the configured API_BASE_URL (may be empty string if API is on same domain)
        const apiBaseUrl = import.meta.env.VITE_API_URL || '';
        return `${apiBaseUrl}${endpoint}`;
      };
      
      const fullUrl = getApiUrl(`/api/scans/community?limit=100${ageParam}`);
      console.log('Environment:', isDevelopment() ? 'development' : 'production');
      console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('Fetching community scans from:', fullUrl);
      
      const response = await fetch(fullUrl);
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Received non-JSON response. Content-Type:', contentType);
        console.error('Response status:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response body:', text.substring(0, 500) + '...');
        
        if (response.status === 404) {
          setError('API endpoint not found. The backend might not be deployed or the route doesn\'t exist.');
        } else if (response.status >= 500) {
          setError('Backend server error. Please try again later.');
        } else {
          setError(`Unexpected response from server (${response.status}). Check console for details.`);
        }
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched', data.length, 'community scans');
        setCommunityScans(data);
      } else {
        console.error('API response error:', response.status, response.statusText);
        setError(`Failed to load discoveries (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching community scans:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Cannot connect to backend. Check if the API server is running.');
      } else {
        setError('Unable to connect to the server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityScans();
  }, [age]);

  const handleImageClick = (scan: CommunityScansResponse) => {
    setSelectedScan(scan);
  };

  const handleCloseModal = () => {
    setSelectedScan(null);
  };

  // Distribute images across 4 rows
  const getRowImages = (rowIndex: number) => {
    const imagesPerRow = Math.ceil(communityScans.length / 4);
    const startIndex = rowIndex * imagesPerRow;
    const endIndex = startIndex + imagesPerRow;
    return communityScans.slice(startIndex, endIndex);
  };

  // Create infinite scroll by duplicating images
  const createInfiniteRow = (images: CommunityScansResponse[]) => {
    return [...images, ...images, ...images]; // Triple for smooth infinite scroll
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FDF2F8 50%, #FAF5FF 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #E2E8F0',
          borderTop: '4px solid #F97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FDF2F8 50%, #FAF5FF 100%)',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>😔</div>
          <Typography variant="h6" style={{ fontWeight: '600', color: '#E53E3E', marginBottom: '8px' }}>
            Oops! Something went wrong
          </Typography>
          <Typography style={{ fontSize: '16px', color: '#718096', marginBottom: '20px', maxWidth: '300px' }}>
            {error}
          </Typography>
          <button
            onClick={fetchCommunityScans}
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (communityScans.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FDF2F8 50%, #FAF5FF 100%)',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <Typography variant="h6" style={{ fontWeight: '600', color: '#4A5568', marginBottom: '8px' }}>
            No discoveries yet!
          </Typography>
          <Typography style={{ fontSize: '16px', color: '#718096', maxWidth: '300px' }}>
            Be the first to scan something and share your learning journey with other kids!
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF7ED 0%, #FDF2F8 50%, #FAF5FF 100%)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #FED7AA',
        padding: '12px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ fontSize: '28px' }}>☀️</div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            What Kids Are Learning
          </h1>
        </div>
        <p style={{
          color: '#6B7280',
          fontSize: '13px',
          margin: 0
        }}>
          Discover amazing things other young explorers have found!
        </p>
      </div>

      {/* 4-Row Moving Carousel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)', // Total available space minus header and nav
        paddingBottom: '80px'
      }}>
        {[0, 1, 2, 3].map((rowIndex) => {
          const rowImages = createInfiniteRow(getRowImages(rowIndex));
          const isRightToLeft = rowIndex % 2 === 1;
          
          return (
            <div
              key={rowIndex}
              style={{
                height: 'calc((100vh - 220px) / 4)', // Divide available space by 4 rows
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                borderBottom: rowIndex < 3 ? '1px solid rgba(255, 255, 255, 0.3)' : 'none', // Thin line between rows
                padding: '4px 0' // Small padding for the thin lines
              }}
            >
              <motion.div
                animate={{
                  x: isRightToLeft ? ['0%', '-33.33%'] : ['-33.33%', '0%']
                }}
                transition={{
                  duration: 20 + rowIndex * 5, // Different speeds for each row
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  display: 'flex',
                  width: 'max-content',
                  height: '100%'
                }}
              >
                {rowImages.map((scan, index) => {
                  // Calculate image size to fit the row height while maintaining aspect ratio
                  const rowHeight = `calc((100vh - 220px) / 4 - 8px)`; // Row height minus padding
                  
                  return (
                    <motion.div
                      key={`${scan.id}-${index}`}
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleImageClick(scan)}
                      style={{
                        width: rowHeight, // Square images based on row height
                        height: rowHeight,
                        flexShrink: 0,
                        cursor: 'pointer',
                        borderRadius: '12px', // Rounded edges
                        overflow: 'hidden',
                        marginRight: '1px', // Thin line between images
                        border: '0.5px solid rgba(255, 255, 255, 0.2)', // Very thin border
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <img
                        src={scan.image_url}
                        alt="Discovery"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Perfect Circle Floating Camera Button */}
      <div style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        zIndex: 1000
      }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/scan')}
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
            cursor: 'pointer'
          }}
        >
          <FaCamera style={{ width: '20px', height: '20px', color: '#ffffff' }} />
        </motion.div>
      </div>

      {/* Learning Card Modal */}
      <AnimatePresence>
        {selectedScan && (
          <LearningCardModal
            isOpen={!!selectedScan}
            onClose={handleCloseModal}
            learningData={selectedScan.learningData}
            imageUrl={selectedScan.image_url}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Learn; 