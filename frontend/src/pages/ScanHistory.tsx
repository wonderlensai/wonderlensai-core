import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Button,
  CardMedia,
  CardActionArea,
  Divider,
  Fab,
} from '@mui/material';
import { motion } from 'framer-motion';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ScannedItem interface
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

// MonthGroup interface
interface MonthGroup {
  key: string; // 'YYYY-MM'
  label: string; // 'January 2025'
  items: ScannedItem[];
}

// Function to get device ID
function getDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

// Format date helper
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format month for display
const formatMonth = (timestamp: number) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Get YYYY-MM key for grouping
const getMonthKey = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const ScanHistory = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [allItems, setAllItems] = useState<ScannedItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Group items by month
  const monthGroups = useMemo(() => {
    if (!allItems.length) return [];

    const groups: { [key: string]: ScannedItem[] } = {};
    
    allItems.forEach(item => {
      const monthKey = getMonthKey(item.timestamp);
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(item);
    });

    // Convert to array and sort by month (descending)
    return Object.entries(groups)
      .map(([key, items]) => ({
        key,
        label: formatMonth(items[0].timestamp),
        items
      }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [allItems]);

  // Cache key for storing the last fetch timestamp
  const LAST_FETCH_KEY = 'wonderlens_last_history_fetch';
  const HISTORY_CACHE_KEY = 'wonderlens_scan_history_cache';
  
  // Fetch scan history with cache strategy
  useEffect(() => {
    const fetchScanHistory = async () => {
      try {
        setIsLoading(true);
        
        // Check cache first
        const cachedHistory = localStorage.getItem(HISTORY_CACHE_KEY);
        const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
        const now = Date.now();
        
        // Use cache if it's less than 5 minutes old
        if (cachedHistory && lastFetch && now - parseInt(lastFetch) < 5 * 60 * 1000) {
          console.log('[ScanHistory] Using cached history data');
          setAllItems(JSON.parse(cachedHistory));
          setIsLoading(false);
          return;
        }
        
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
          imageData: item.image_url,
          learningData: item.learningData
        }));
        
        // Update state
        setAllItems(transformedItems);
        
        // Cache the results
        localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(transformedItems));
        localStorage.setItem(LAST_FETCH_KEY, now.toString());
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
    navigate('/learning-card', {
      state: {
        imageData: item.imageData,
        learningData: item.learningData,
      },
    });
  };

  // Function to delete a cached item
  const handleDeleteCachedItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
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
      
      // Update state and cache
      const updatedItems = allItems.filter(item => item.id !== id);
      setAllItems(updatedItems);
      
      // Update cache
      localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(updatedItems));
      localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error deleting cached item:', error);
    }
  };

  // Toggle month expansion
  const toggleMonth = (monthKey: string) => {
    if (selectedMonth === monthKey) {
      setSelectedMonth(null);
    } else {
      setSelectedMonth(monthKey);
    }
  };

  // Function to generate PDF
  const generatePDF = async () => {
    if (!selectedMonth) return;
    
    try {
      setIsGeneratingPDF(true);
      
      const selectedMonthItems = monthGroups.find(group => group.key === selectedMonth)?.items || [];
      const monthName = monthGroups.find(group => group.key === selectedMonth)?.label || 'Scans';
      
      // Create a temporary div to render the PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.width = '800px';
      pdfContent.style.padding = '20px';
      pdfContent.style.backgroundColor = 'white';
      document.body.appendChild(pdfContent);
      
      // Add title
      const title = document.createElement('h1');
      title.textContent = `WonderLensAI - ${monthName} Scans`;
      title.style.textAlign = 'center';
      title.style.marginBottom = '30px';
      title.style.color = '#3f51b5';
      title.style.fontFamily = 'Arial, sans-serif';
      pdfContent.appendChild(title);
      
      // Add items
      for (const item of selectedMonthItems) {
        const itemDiv = document.createElement('div');
        itemDiv.style.marginBottom = '40px';
        itemDiv.style.borderBottom = '1px solid #eee';
        itemDiv.style.paddingBottom = '20px';
        
        // Object name
        const objectName = document.createElement('h2');
        objectName.textContent = item.learningData.object;
        objectName.style.marginBottom = '10px';
        objectName.style.color = '#333';
        itemDiv.appendChild(objectName);
        
        // Date
        const date = document.createElement('p');
        date.textContent = formatDate(item.timestamp);
        date.style.fontSize = '14px';
        date.style.color = '#666';
        date.style.marginBottom = '15px';
        itemDiv.appendChild(date);
        
        // Image placeholder
        const img = document.createElement('img');
        img.src = item.imageData;
        img.alt = item.learningData.object;
        img.style.maxWidth = '300px';
        img.style.maxHeight = '200px';
        img.style.objectFit = 'contain';
        img.style.marginBottom = '15px';
        itemDiv.appendChild(img);
        
        // Add up to 3 facts from lenses
        const facts = document.createElement('ul');
        facts.style.paddingLeft = '20px';
        
        const maxFacts = Math.min(3, item.learningData.lenses.length);
        for (let i = 0; i < maxFacts; i++) {
          const lens = item.learningData.lenses[i];
          const fact = document.createElement('li');
          fact.textContent = `${lens.name}: ${lens.text.slice(0, 100)}${lens.text.length > 100 ? '...' : ''}`;
          fact.style.marginBottom = '5px';
          facts.appendChild(fact);
        }
        
        itemDiv.appendChild(facts);
        pdfContent.appendChild(itemDiv);
      }
      
      // Use html2canvas to capture the content
      const canvas = await html2canvas(pdfContent, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
      });
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`WonderLensAI_${monthName.replace(' ', '_')}.pdf`);
      
      // Clean up
      document.body.removeChild(pdfContent);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
        py: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 800, lg: 1000 },
          mx: 'auto',
          px: { xs: 2, sm: 0 },
        }}
      >
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              mr: 2,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Scan History
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
        ) : monthGroups.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <HistoryIcon sx={{ fontSize: 60, color: '#CBD5E0', mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
              No scan history found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Scan some objects to see them here.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/scan')}
              sx={{ mt: 3 }}
            >
              Scan Now
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 10 }}>
            {/* Month cards */}
            {selectedMonth === null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Select Month
                </Typography>
                
                {monthGroups.map((group) => (
                  <Card 
                    key={group.key}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => toggleMonth(group.key)}
                  >
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarMonthIcon sx={{ color: '#6C63FF', mr: 2, fontSize: 28 }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {group.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {group.items.length} {group.items.length === 1 ? 'scan' : 'scans'}
                          </Typography>
                        </Box>
                      </Box>
                      <KeyboardArrowDownIcon sx={{ color: '#6C63FF' }} />
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}

            {/* Display scans for selected month */}
            {selectedMonth !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {monthGroups.find(g => g.key === selectedMonth)?.label}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<KeyboardArrowUpIcon />}
                    onClick={() => setSelectedMonth(null)}
                  >
                    Back to Months
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {monthGroups
                    .find(group => group.key === selectedMonth)
                    ?.items.map((item) => (
                      <Grid item xs={6} sm={4} key={item.id}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                            },
                          }}
                        >
                          <Box sx={{ position: 'relative', width: '100%' }}>
                            {/* Delete button outside of CardActionArea */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                p: 1,
                                zIndex: 2, // Higher z-index to stay above CardActionArea
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
                                alignItems: 'stretch',
                                height: '100%',
                              }}
                            >
                              <Box sx={{ position: 'relative', pt: '75%' /* 4:3 Aspect Ratio */ }}>
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
                                    backgroundColor: '#f0f0f0',
                                  }}
                                  onError={(e) => {
                                    // If image fails to load from URL, show a placeholder
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // Prevent infinite error loop
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWltYWdlIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ij48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIj48L3BvbHlsaW5lPjwvc3ZnPg==';
                                  }}
                                />
                                                            </Box>
                              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {item.learningData.object}
                                </Typography>
                                
                                {item.learningData.category && (
                                  <Chip
                                    size="small"
                                    label={item.learningData.category}
                                    sx={{
                                      bgcolor: 'rgba(108, 99, 255, 0.1)',
                                      color: '#6C63FF',
                                      fontWeight: 500,
                                      fontSize: '0.7rem',
                                      height: 24,
                                      mb: 1,
                                      maxWidth: 'fit-content',
                                    }}
                                  />
                                )}
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                                  {formatDate(item.timestamp)}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                          </Box>
                          </Card>
                      </Grid>
                    ))}
                </Grid>
              </motion.div>
            )}
            
            {/* PDF Download Floating Button */}
            {selectedMonth !== null && (
              <Fab
                color="primary"
                aria-label="download"
                sx={{
                  position: 'fixed',
                  bottom: 80, // Above the bottom navigation
                  right: 20,
                  background: 'linear-gradient(45deg, #6C63FF 30%, #5EC6FF 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5753e0 30%, #47b3e9 90%)',
                  },
                }}
                onClick={generatePDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? <CircularProgress size={24} color="inherit" /> : <FileDownloadIcon />}
              </Fab>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ScanHistory; 