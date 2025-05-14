const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const analyzeRouter = require('./routes/analyze');

// Load environment variables
dotenv.config();

const app = express();

// CORS middleware at the very top, simplest config
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://wonderlensai-core.vercel.app',
    'https://www.wonderlens.app',
    'https://wonderlens.app'
  ]
}));

// Explicit OPTIONS handler for all routes
app.options('*', cors({
  origin: [
    'http://localhost:5173',
    'https://wonderlensai-core.vercel.app',
    'https://www.wonderlens.app',
    'https://wonderlens.app'
  ]
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount the analyze router
app.use('/api/analyze-image', analyzeRouter);

const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for http://localhost:5173, https://wonderlensai-core.vercel.app, https://www.wonderlens.app, and https://wonderlens.app');
}); 