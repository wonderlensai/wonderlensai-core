const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// Helper to map age to age_band
function getAgeBand(age) {
  if (age >= 6 && age <= 7) return '6-7';
  if (age >= 8 && age <= 9) return '8-9';
  if (age === 10) return '10';
  return null;
}

// GET /api/kidnews?country=in&age=8
router.get('/', async (req, res) => {
  console.log('📰 Kid News API called with params:', req.query);
  const { country, age } = req.query;
  if (!country || !age) {
    console.log('📰 Missing parameters');
    return res.status(400).json({ error: 'Missing country or age parameter' });
  }
  const ageBand = getAgeBand(Number(age));
  if (!ageBand) {
    console.log('📰 Invalid age:', age);
    return res.status(400).json({ error: 'Invalid age' });
  }
  
  const today = new Date().toISOString().slice(0, 10);
  console.log('📰 Looking for news for date:', today, 'country:', country, 'age_band:', ageBand);

  // Try with flexible date matching - get latest available
  console.log('📰 Attempting to find latest news regardless of date');
  let { data: latestData, error: latestError } = await supabase
    .from('daily_kidnews')
    .select('json_blob, date')
    .eq('country', country)
    .eq('age_band', ageBand)
    .order('date', { ascending: false })
    .limit(1);

  if (latestData && latestData.length > 0) {
    console.log('📰 Found latest news for:', country, ageBand, 'date:', latestData[0].date);
    return res.json(latestData[0].json_blob);
  }

  console.log('📰 No country-specific news found, trying today specifically');
  // Try country-specific with today's date as fallback
  let { data, error } = await supabase
    .from('daily_kidnews')
    .select('json_blob')
    .eq('date', today)
    .eq('country', country)
    .eq('age_band', ageBand)
    .single();
  
  console.log('📰 Today specific query result:', { found: !!data, error: error?.message });

  // Fallback to global if not found
  if (!data && !error) {
    console.log('📰 Trying global news for today');
    ({ data, error } = await supabase
      .from('daily_kidnews')
      .select('json_blob')
      .eq('date', today)
      .eq('country', 'global')
      .eq('age_band', ageBand)
      .single());
    
    console.log('📰 Global today query result:', { found: !!data, error: error?.message });
  }

  // Last resort: try any global news (most recent)
  if (!data && !error) {
    console.log('📰 Last resort: any global news');
    ({ data, error } = await supabase
      .from('daily_kidnews')
      .select('json_blob')
      .eq('country', 'global')
      .eq('age_band', ageBand)
      .order('date', { ascending: false })
      .limit(1)
      .single());
    
    console.log('📰 Any global news result:', { found: !!data, error: error?.message });
  }

  if (error) {
    console.log('📰 Final database error:', error.message);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
  
  if (!data) {
    console.log('📰 No news found at all');
    return res.status(404).json({ error: 'No news found for today' });
  }
  
  console.log('📰 Successfully returning news');
  res.json(data.json_blob);
});

module.exports = router; 