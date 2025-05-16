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
  const { country, age } = req.query;
  if (!country || !age) {
    return res.status(400).json({ error: 'Missing country or age parameter' });
  }
  const ageBand = getAgeBand(Number(age));
  if (!ageBand) {
    return res.status(400).json({ error: 'Invalid age' });
  }
  const today = new Date().toISOString().slice(0, 10);

  // Try country-specific first
  let { data, error } = await supabase
    .from('daily_kidnews')
    .select('json_blob')
    .eq('date', today)
    .eq('country', country)
    .eq('age_band', ageBand)
    .single();

  // Fallback to global if not found
  if (!data && !error) {
    ({ data, error } = await supabase
      .from('daily_kidnews')
      .select('json_blob')
      .eq('date', today)
      .eq('country', 'global')
      .eq('age_band', ageBand)
      .single());
  }

  if (error) {
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: 'No news found for today' });
  }
  res.json(data.json_blob);
});

module.exports = router; 