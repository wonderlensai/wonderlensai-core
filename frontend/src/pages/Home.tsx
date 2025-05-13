import { Box, Container, Typography, Grid, Card, CardActionArea, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import HistoryIcon from '@mui/icons-material/History';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import PublicIcon from '@mui/icons-material/Public';
import ShareIcon from '@mui/icons-material/Share';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const modules = [
  {
    title: 'History',
    icon: <HistoryIcon sx={{ fontSize: 60 }} />,
    color: '#FF6B6B',
    description: 'Discover the past through pictures!',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
  },
  {
    title: 'Science',
    icon: <ScienceIcon sx={{ fontSize: 60 }} />,
    color: '#4ECDC4',
    description: 'Explore the wonders of science!',
    gradient: 'linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%)',
  },
  {
    title: 'Math',
    icon: <CalculateIcon sx={{ fontSize: 60 }} />,
    color: '#FFD93D',
    description: 'Learn math through real-world objects!',
    gradient: 'linear-gradient(135deg, #FFD93D 0%, #FFE66D 100%)',
  },
  {
    title: 'Geography',
    icon: <PublicIcon sx={{ fontSize: 60 }} />,
    color: '#95E1D3',
    description: 'Travel the world through images!',
    gradient: 'linear-gradient(135deg, #95E1D3 0%, #B5F1E3 100%)',
  },
  {
    title: 'Shared Learning',
    icon: <ShareIcon sx={{ fontSize: 60 }} />,
    color: '#9B59B6',
    description: 'See what others are learning!',
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #B39DDB 100%)',
  },
];

const MotionCard = motion(Card);

const ModuleCard = styled(MotionCard)(({ theme }) => ({
  minWidth: 120,
  maxWidth: 150,
  minHeight: 170,
  maxHeight: 200,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: 'rgba(255,255,255,0.9)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
}));

const Home = () => {
  const navigate = useNavigate();

  const handleModuleClick = (module: string) => {
    if (module === 'Shared Learning') {
      navigate('/shared');
    } else {
      navigate(`/scan/${module.toLowerCase()}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {modules.map((module, index) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{
              duration: 2,
              delay: index * 0.2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: module.gradient,
              filter: 'blur(40px)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Typography
            variant="h1"
            component="h1"
            align="center"
            sx={{
              mb: 2,
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: '-1px',
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Wonderlens AI
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              mb: 6,
              color: 'text.secondary',
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              fontWeight: 500,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Scan and learn from the world around you!
          </Typography>
        </motion.div>

        <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ flexGrow: 1 }}>
          {modules.map((module, index) => (
            <Grid key={module.title} item xs={6} sm={4} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <ModuleCard
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <CardActionArea
                  sx={{ height: '100%', p: 2 }}
                  onClick={() => handleModuleClick(module.title)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <IconContainer>
                      <Box sx={{ color: module.color }}>{module.icon}</Box>
                    </IconContainer>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        mb: 1,
                        color: module.color,
                        fontWeight: 700,
                        textAlign: 'center',
                        fontSize: '1.1rem',
                      }}
                    >
                      {module.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {module.description}
                    </Typography>
                  </Box>
                </CardActionArea>
              </ModuleCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 