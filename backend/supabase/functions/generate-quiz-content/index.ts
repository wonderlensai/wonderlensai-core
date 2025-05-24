// Supabase Edge Function to generate quiz content
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { OpenAI } from 'https://esm.sh/openai@4.28.0'

// Initialize clients
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const openai = new OpenAI({ apiKey: openaiApiKey });

// Quiz categories and age bands
const CATEGORIES = [
  'Space & Astronomy',
  'Animals & Wildlife',
  'Science Experiments',
  'History & Civilizations',
  'Technology & Computers',
  'Math Puzzles',
  'Geography & Places',
  'Art & Music'
];

const AGE_BANDS = [
  { band: '6-7', min: 6, max: 7, question_count: 5 },
  { band: '8-9', min: 8, max: 9, question_count: 8 },
  { band: '10', min: 10, max: 10, question_count: 10 },
];

function buildQuizPrompt(category: string, age_band: string, question_count: number) {
  return `You are WonderLens QuizMaster.
Task: Create ${question_count} engaging multiple-choice questions for CHILD_AGE = "${age_band}" about ${category}.

Output EXACT JSON:
{
  "category": "${category}",
  "age_band": "${age_band}",
  "questions": [
    {
      "question": "Clear, interesting question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Brief, child-friendly explanation of the answer"
    }
  ]
}

Rules:
- Questions should be engaging, fun, and educational
- Keep language appropriate for ${age_band}-year-olds
- Include interesting facts in explanations
- Ensure correct_answer is exactly one of the options
- Make wrong options plausible but clearly incorrect
- Avoid politically sensitive topics`;
}

async function generateAndStoreQuizzes() {
  console.log("Starting quiz generation");
  
  for (const category of CATEGORIES) {
    for (const age of AGE_BANDS) {
      console.log(`Processing: category=${category}, age_band=${age.band}`);
      const prompt = buildQuizPrompt(category, age.band, age.question_count);
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.7, // Slightly higher temperature for variety
        });
        
        const text = response.choices[0].message.content;
        let quizPack;
        
        try {
          quizPack = JSON.parse(text);
        } catch {
          // fallback: try to extract JSON from text
          const match = text.match(/\{[\s\S]*\}/);
          quizPack = match ? JSON.parse(match[0]) : null;
        }
        
        if (!quizPack) {
          console.error(`[${category} ${age.band}] Could not parse OpenAI response.`);
          continue;
        }
        
        // Upsert into Supabase
        const { error } = await supabase.from('quiz_content').upsert({
          category,
          age_band: age.band,
          json_blob: quizPack,
        }, { onConflict: 'category,age_band' });
        
        if (error) {
          console.error(`[${category} ${age.band}] Supabase error:`, error.message);
        } else {
          console.log(`[${category} ${age.band}] Quiz pack stored successfully.`);
        }
      } catch (err) {
        console.error(`[${category} ${age.band}] OpenAI error:`, err);
      }
    }
  }
  
  console.log("Quiz generation completed");
}

// This serves both scheduled invocations and manual invocations via HTTP
Deno.serve(async (req) => {
  try {
    // For manual invocation, check for authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      await generateAndStoreQuizzes();
      return new Response(
        JSON.stringify({ success: true, message: "Quiz generation completed" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Extract the JWT token
    const token = authHeader.substring(7);
    
    // In a real app, you would validate the JWT token here
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    await generateAndStoreQuizzes();
    return new Response(
      JSON.stringify({ success: true, message: "Quiz generation completed" }),
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