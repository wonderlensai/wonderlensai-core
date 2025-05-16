import { Box, Container } from '@mui/material';

const History = () => {
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
        {/* Removed top motion.div with page title and subtitle */}
      </Container>
    </Box>
  );
};

export default History; 