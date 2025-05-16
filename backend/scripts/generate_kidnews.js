require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COUNTRIES = ['in', 'us', 'gb', 'global']; // Add more as needed
const AGE_BANDS = [
  { band: '6-7', min: 6, max: 7, max_words: 25 },
  { band: '8-9', min: 8, max: 9, max_words: 40 },
  { band: '10', min: 10, max: 10, max_words: 55 },
];

const CATEGORIES = [
  'Science Spark',
  'Space & Sky',
  'Animals & Nature',
  'Tech & Inventions',
  'Math & Logic Fun',
  'Culture Pop',
];

function buildPrompt(country, age_band, max_words) {
  return `You are WonderLens NewsBot.\nTask: For CHILD_COUNTRY = "${country}" generate ONE kid-friendly world-update for each category below, tuned to AGE = ${age_band}.\n\nOutput EXACT JSON:\n{\n  "date": "YYYY-MM-DD",\n  "country": "${country}",\n  "age_band": "${age_band}",\n  "stories": [\n    { "category": "Science Spark", "headline": "...", "body": "..." },\n    { "category": "Space & Sky", "headline": "...", "body": "..." },\n    { "category": "Animals & Nature", "headline": "...", "body": "..." },\n    { "category": "Tech & Inventions", "headline": "...", "body": "..." },\n    { "category": "Math & Logic Fun", "headline": "...", "body": "..." },\n    { "category": "Culture Pop", "headline": "...", "body": "..." }\n  ]\n}\n\nStrict rules:\n- No politics, war, or adult themes\n- Keep body <= ${max_words} words\n- Use vocabulary suitable for ${age_band}-year-old\n- One fun emoji allowed`;
}

async function generateAndStoreNews() {
  const today = new Date().toISOString().slice(0, 10);
  for (const country of COUNTRIES) {
    for (const age of AGE_BANDS) {
      const prompt = buildPrompt(country, age.band, age.max_words);
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: prompt },
          ],
          max_tokens: 800,
        });
        const text = response.choices[0].message.content;
        let newsPack;
        try {
          newsPack = JSON.parse(text);
        } catch {
          // fallback: try to extract JSON from text
          const match = text.match(/\{[\s\S]*\}/);
          newsPack = match ? JSON.parse(match[0]) : null;
        }
        if (!newsPack) {
          console.error(`[${country} ${age.band}] Could not parse OpenAI response.`);
          continue;
        }
        // Upsert into Supabase
        const { error } = await supabase.from('daily_kidnews').upsert({
          date: today,
          country,
          age_band: age.band,
          json_blob: newsPack,
        }, { onConflict: ['date', 'country', 'age_band'] });
        if (error) {
          console.error(`[${country} ${age.band}] Supabase error:`, error.message);
        } else {
          console.log(`[${country} ${age.band}] News pack stored.`);
        }
      } catch (err) {
        console.error(`[${country} ${age.band}] OpenAI error:`, err.message);
      }
    }
  }
  // Purge old news
  const { error: purgeError } = await supabase.rpc('delete_old_kidnews', { cutoff: today });
  if (purgeError) {
    // fallback: run delete manually
    await supabase.from('daily_kidnews').delete().lt('date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  }
  console.log('Done.');
}

if (require.main === module) {
  generateAndStoreNews();
} 