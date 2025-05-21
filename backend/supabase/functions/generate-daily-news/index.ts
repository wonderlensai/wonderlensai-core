// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Supabase Edge Function to generate daily kids news
// This replaces the previous Docker-based approach with a native Supabase scheduled function

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { OpenAI } from 'https://esm.sh/openai@4.28.0'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI client
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const openai = new OpenAI({ apiKey: openaiApiKey });

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

function buildPrompt(country: string, age_band: string, max_words: number) {
  return `You are WonderLens NewsBot.\nTask: For CHILD_COUNTRY = "${country}" generate ONE kid-friendly world-update for each category below, tuned to AGE = ${age_band}.\n\nOutput EXACT JSON:\n{\n  "date": "YYYY-MM-DD",\n  "country": "${country}",\n  "age_band": "${age_band}",\n  "stories": [\n    { "category": "Science Spark", "headline": "...", "body": "..." },\n    { "category": "Space & Sky", "headline": "...", "body": "..." },\n    { "category": "Animals & Nature", "headline": "...", "body": "..." },\n    { "category": "Tech & Inventions", "headline": "...", "body": "..." },\n    { "category": "Math & Logic Fun", "headline": "...", "body": "..." },\n    { "category": "Culture Pop", "headline": "...", "body": "..." }\n  ]\n}\n\nStrict rules:\n- No politics, war, or adult themes\n- Keep body <= ${max_words} words\n- Use vocabulary suitable for ${age_band}-year-old\n- One fun emoji allowed`;
}

async function generateAndStoreNews() {
  console.log("Starting daily news generation");
  const today = new Date().toISOString().slice(0, 10);
  console.log(`Generating news for date: ${today}`);
  
  for (const country of COUNTRIES) {
    for (const age of AGE_BANDS) {
      console.log(`Processing: country=${country}, age_band=${age.band}`);
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
        }, { onConflict: 'date,country,age_band' });
        if (error) {
          console.error(`[${country} ${age.band}] Supabase error:`, error.message);
        } else {
          console.log(`[${country} ${age.band}] News pack stored successfully.`);
        }
      } catch (err) {
        console.error(`[${country} ${age.band}] OpenAI error:`, err);
      }
    }
  }
  
  // Purge old news (older than 14 days)
  try {
    console.log("Purging old news entries");
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const cutoffDate = fourteenDaysAgo.toISOString().slice(0, 10);
    
    const { error } = await supabase
      .from('daily_kidnews')
      .delete()
      .lt('date', cutoffDate);
      
    if (error) {
      console.error("Error purging old news:", error.message);
    } else {
      console.log(`Successfully purged news older than ${cutoffDate}`);
    }
  } catch (err) {
    console.error("Failed to purge old news:", err);
  }
  
  console.log("Daily news generation completed");
}

// This serves both scheduled invocations and manual invocations via HTTP
Deno.serve(async (req) => {
  try {
    // For manual invocation, check for authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      await generateAndStoreNews();
      return new Response(
        JSON.stringify({ success: true, message: "Daily news generation completed" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Extract the JWT token
    const token = authHeader.substring(7);
    
    // In a real app, you would validate the JWT token here
    // For simplicity, we'll just check if it's present
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    await generateAndStoreNews();
    return new Response(
      JSON.stringify({ success: true, message: "Daily news generation completed" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-daily-news' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
