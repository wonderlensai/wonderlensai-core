const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug: Check if API key is loaded
console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/analyze-image
router.post('/', async (req, res) => {
  const { image, subject, prompt: customPrompt } = req.body;
  
  // Log image size information
  const imageSizeKB = Math.round(image.length / 1024);
  console.log('[Image] Size received from frontend:', imageSizeKB, 'KB');
  console.log('[Image] Raw data length:', image.length, 'bytes');
  console.log('[Image] Base64 prefix:', image.substring(0, 30) + '...'); // Log the start of the base64 string to verify it's compressed
  
  console.log('[OpenAI] Incoming request:', { hasImage: !!image, subject, hasCustomPrompt: !!customPrompt });
  if (!image) {
    console.log('[OpenAI] Error: No image provided');
    return res.status(400).json({ error: 'No image provided' });
  }
  try {
    const prompt = customPrompt ||
      `You are an educational assistant designed to help children ages 6 to 9 learn about the world by scanning objects. You receive an object (natural or man-made) and a selected learning module (History, Science, Math, or Geography). Your task is to generate a clear, informative, and engaging response tailored to the selected module.\n\nUse language that a child can understand, while making the content educational enough that parents will also find it valuable.\n\nKeep the tone curious, calm, and respectful of a child's intelligence — avoid being overly funny or silly.\n\n---\n\nInput:\nObject: {object_name}\nSelected Module: {module_name}\nChild Age: {child_age}\n\n---\n\nReturn the output in this structured format:\n\n1. **Object Introduction**  \nBriefly describe what this object is and what it is used for (or known for) in daily life or nature.\n\n2. **Core Concept (Based on Module)**  \nProvide 2–3 sentences explaining the object from the perspective of the selected module:\n- **History**: Talk about its origin, how it was used in the past, or how it evolved.\n- **Science**: Explain how it works, what it's made of, or the scientific principle behind it.\n- **Math**: Provide simple math logic related to the object (measurements, patterns, estimation, etc.).\n- **Geography**: Explain where it's found, grown, used, or made in the world.\n\n3. **Interesting Fact**  \nShare a surprising, insightful, or age-appropriate fun fact related to the object and module.\n\n4. **Related Knowledge**  \nShare two short facts about other objects, ideas, or systems that are related to the scanned object. These should be simple, informative, and help the child understand how the concept connects to the world.\n\n5. **Real-World Connection**  \nExplain how this object or concept appears in the child's everyday life. Use simple, relatable examples that they might observe at home, school, or outside.\n\n6. **Extend Learning: 3 Questions + Answers**  \nAsk three natural follow-up questions that a curious child might have after scanning this object. Write each question and answer it clearly in 1–2 short sentences. Answers should be factual, age-appropriate, and easy to understand.\n\n---\n\nKeep all explanations aligned with the selected module. If the object doesn't naturally fit the module, do your best to provide a creative but relevant interpretation.\n\nAvoid made-up stories, jokes, or fantasy unless the creative prompt specifically calls for imagination.\n\nReturn your answer as a JSON object with these keys:\n{\n  "objectIntroduction": "...",\n  "coreConcept": "...",\n  "interestingFact": "...",\n  "relatedKnowledge": ["...", "..."],\n  "realWorldConnection": "...",\n  "extendLearning": [{"question": "...", "answer": "..."}, {"question": "...", "answer": "..."}, {"question": "...", "answer": "..."}]\n}\nDo not include any Markdown, explanations, or extra text—just the JSON object.`;
    console.log('[OpenAI] Prompt sent:', prompt);
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: [{ type: 'image_url', image_url: { url: image } }] }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
    });
    
    // Log the size of the image being sent to OpenAI
    const openAIImageSizeKB = Math.round(image.length / 1024);
    console.log('[OpenAI] Image size being sent to OpenAI:', openAIImageSizeKB, 'KB');
    console.log('[OpenAI] Image data length for OpenAI:', image.length, 'bytes');
    
    if (response.usage) {
      console.log(`[OpenAI] Token usage: prompt_tokens=${response.usage.prompt_tokens}, completion_tokens=${response.usage.completion_tokens}, total_tokens=${response.usage.total_tokens}`);
    } else {
      console.log('[OpenAI] No token usage info returned.');
    }
    const text = response.choices[0].message.content;
    console.log('[OpenAI] Raw response:', text);
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : { error: 'Could not parse response' };
    }
    console.log('[OpenAI] Parsed data sent to frontend:', data);
    res.json(data);
  } catch (err) {
    console.log('[OpenAI] Error in OpenAI API call:', err);
    res.status(500).json({ error: 'OpenAI API error', details: err.message });
  }
});

module.exports = router; 