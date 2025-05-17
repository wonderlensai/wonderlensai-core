import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Button,
  CircularProgress
} from '@mui/material';
import LearningGraph from '../components/LearningGraph';
import graphData from '../data/learningGraph.json';

const SharedLearning = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [viewType, setViewType] = useState<'graph' | 'list'>('graph');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewToggle = () => {
    setViewType(viewType === 'graph' ? 'list' : 'graph');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Learning Network
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Explore what others are learning and discover new connections!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                '& .MuiTab-root': { 
                  fontWeight: 600,
                  borderRadius: '12px 12px 0 0',
                  minWidth: 100
                }
              }}
            >
              <Tab label="All Topics" />
              <Tab label="History" />
              <Tab label="Science" />
              <Tab label="Math" />
              <Tab label="Geography" />
            </Tabs>
            
            <Button 
              variant="outlined" 
              onClick={handleViewToggle}
              sx={{ borderRadius: 20, textTransform: 'none' }}
            >
              {viewType === 'graph' ? 'Show as List' : 'Show as Graph'}
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 500,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Box sx={{ 
            height: { xs: 400, sm: 500, md: 600 },
            width: '100%',
            position: 'relative' 
          }}>
            {viewType === 'graph' ? (
              <LearningGraph 
                data={graphData} 
                height={window.innerHeight * 0.6} 
                width={window.innerWidth > 1200 ? 1200 : window.innerWidth * 0.9}
              />
            ) : (
              <Box sx={{ 
                p: 3, 
                bgcolor: 'white', 
                borderRadius: 4, 
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' 
              }}>
                <Typography variant="h6" gutterBottom>
                  Popular Learning Topics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This feature will show a list view of learning topics and connected users.
                </Typography>
                {/* To be implemented */}
              </Box>
            )}
          </Box>
        )}

        <Typography
          variant="body1"
          align="center"
          sx={{ mt: 3, color: 'text.secondary' }}
        >
          Zoom, pan, and click on any node to explore connections between topics and users.
        </Typography>
      </Container>
    </Box>
  );
};

export default SharedLearning; 