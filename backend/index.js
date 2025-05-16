const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const analyzeRouter = require('./routes/analyze');
const kidnewsRouter = require('./routes/kidnews');
const { createClient } = require('@supabase/supabase-js');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Yes' : 'No');

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

// Initialize Supabase client for backend (service role key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
// You can now use 'supabase' in your backend for DB operations

// Mount the analyze router
app.use('/api/analyze-image', analyzeRouter);

// Mount the kidnews router
app.use('/api/kidnews', kidnewsRouter);

const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for http://localhost:5173, https://wonderlensai-core.vercel.app, https://www.wonderlens.app, and https://wonderlens.app');
}); 