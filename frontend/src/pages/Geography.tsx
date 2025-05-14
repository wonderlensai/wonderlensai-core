import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const Geography = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
      }}
    >
      <Container maxWidth="md">
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
            Geography
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              mb: 6,
              color: 'text.secondary',
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              fontWeight: 500,
            }}
          >
            Discover the world's geography and learn about different places!
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Geography; 