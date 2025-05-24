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

// GET /api/quiz?category=Space&age=8
router.get('/', async (req, res) => {
  console.log('🎮 Quiz API called with params:', req.query);
  const { category, age } = req.query;
  
  if (!category || !age) {
    console.log('🎮 Missing parameters');
    return res.status(400).json({ error: 'Missing category or age parameter' });
  }
  
  const ageBand = getAgeBand(Number(age));
  if (!ageBand) {
    console.log('🎮 Invalid age:', age);
    return res.status(400).json({ error: 'Invalid age' });
  }
  
  console.log('🎮 Looking for quiz for category:', category, 'age_band:', ageBand);

  try {
    // Get quiz content for the specified category and age band
    const { data, error } = await supabase
      .from('quiz_content')
      .select('json_blob')
      .eq('category', category)
      .eq('age_band', ageBand)
      .single();
    
    if (error) {
      console.log('🎮 Database error:', error.message);
      
      // If no exact match, try to find any quiz for the age band
      const { data: anyData, error: anyError } = await supabase
        .from('quiz_content')
        .select('json_blob')
        .eq('age_band', ageBand)
        .limit(1)
        .single();
      
      if (anyError) {
        console.log('🎮 No quiz found for age:', ageBand);
        return res.status(404).json({ error: 'No quiz found for this age group' });
      }
      
      if (anyData) {
        console.log('🎮 Returning fallback quiz for age:', ageBand);
        return res.json(anyData.json_blob);
      }
      
      return res.status(404).json({ error: 'No quiz found' });
    }
    
    console.log('🎮 Successfully returning quiz');
    res.json(data.json_blob);
  } catch (err) {
    console.error('🎮 Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 