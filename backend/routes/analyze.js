const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const Device = require('../models/Device');
const Scan = require('../models/Scan');
const OpenAIResponse = require('../models/OpenAIResponse');
const { uploadImageToSupabase } = require('../utils/uploadImage');

// Load environment variables
dotenv.config();

// Debug: Check if API key is loaded
console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/analyze-image
router.post('/', async (req, res) => {
  const { image, child_age, child_country, device_info, user_id } = req.body;

  console.log('[OpenAI] Incoming request:', { hasImage: !!image, child_age, child_country, device_info, user_id });
  if (!image) {
    console.log('[OpenAI] Error: No image provided');
    return res.status(400).json({ error: 'No image provided' });
  }

  // Log image size information
  const imageSizeKB = Math.round(image.length / 1024);
  console.log('[Image] Size received from frontend:', imageSizeKB, 'KB');
  console.log('[Image] Raw data length:', image.length, 'bytes');
  console.log('[Image] Base64 prefix:', image.substring(0, 30) + '...'); // Log the start of the base64 string to verify it's compressed
  try {
    // 1. Upload image to Supabase Storage
    let imageUrl = null;
    try {
      imageUrl = await uploadImageToSupabase(image, user_id || 'anonymous');
    } catch (err) {
      console.error('[Supabase Storage] Error uploading image:', err);
      return res.status(500).json({ error: 'Image upload failed', details: err.message });
    }

    // 2. Store or update device information
    let device;
    if (device_info) {
      try {
        device = await Device.findByDeviceUniqueId(device_info.deviceId);
        if (!device) {
          device = await Device.create(device_info, user_id || null);
        }
      } catch (error) {
        console.error('[Database] Error storing device info:', error);
      }
    }

    // 3. Create scan record
    let scan;
    try {
      scan = await Scan.create({
        user_id: user_id || null,
        device_id: device ? device.id : null,
        image_url: imageUrl,
        child_age,
        child_country,
        image_size_kb: imageSizeKB,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Database] Error creating scan:', error);
      return res.status(500).json({ error: 'Scan creation failed', details: error.message });
    }

    // 4. OpenAI analysis
    const prompt = `
You are WonderLens AI, a learning companion for children ages 6-10.

Identify the main object in the image and its category (toy, food, animal, vehicle, etc). Then create educational content through these lenses:

The child is ${child_age} years old from ${child_country}.

LENS MENU:
1. Core Identity - what it is & everyday use *(MANDATORY)*
2. How It Works - simple science/mechanics
3. Where It Comes From - origin countries/habitat *(MANDATORY)*
4. Time Travel Journey - historical evolution *(MANDATORY)*
5. Size Comparisons - relatable size examples *(MANDATORY)*
6. Safety & Care - kid-level usage tips
7. Ecosystem Role - nature connections
8. Cultural Stories - myths/legends/traditions *(MANDATORY)*
9. Language Hop - names in other languages *(MANDATORY)*
10. Amazing Records - fun world records *(MANDATORY)*
11. Career Link - related jobs
12. Environmental Impact - sustainability notes
13. Future Glimpse - innovations ahead
14. Fun Fact - surprising tidbits

SELECTION RULES:
• Always include Core Identity + all other MANDATORY lenses
• If dangerous (tools, electricity, chemicals, etc), include Safety & Care
• If living/natural (animal, plant, water), include Ecosystem Role
• Total output: exactly 8 lenses (Core Identity + 7 others)

SAFETY RULE:
If object is inappropriate (firearms, alcohol, medication, adult content, etc):
Return ONLY: {"object": "unrecognized", "message": "Hmm, that's not something I can explore. Let's try scanning something else!"}

OUTPUT FORMAT:
{
  "object": "<object_name>",
  "category": "<object_category>",
  "lenses": [
    {
      "name": "<lens_name>",
      "text": "<1-2 simple sentences, age-appropriate>"
    }
    // ... (exactly 8 lenses)
  ],
  "countryInfo": {
    "origin": "<primary country of origin>",
    "relevance": "<object's significance in that country>"
  },
  "vocabulary": {
    "primaryTerm": "<main object name>",
    "relatedTerms": ["<2-3 related words>"],
    "simpleDef": "<simple definition for ${child_age}-year-old>"
  }
}

STYLE:
• Write for a ${child_age}-year-old: clear, friendly
• Short sentences; active voice; kid-friendly
• Optional emoji per lens
• No OpenAI references
• Country info: accurate & culturally respectful
• Vocabulary: age-appropriate with one slightly challenging term
`;
    console.log('[OpenAI] Combined WonderLens prompt sent:', prompt);
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: [{ type: 'image_url', image_url: { url: image } }] }
      ],
      max_tokens: 1000,
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

    // 5. Store OpenAI response
    try {
      await OpenAIResponse.create({
        scan_id: scan.id,
        response_json: data,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Database] Error storing OpenAI response:', error);
    }

    res.json(data);
  } catch (err) {
    console.log('[OpenAI] Error in OpenAI API call:', err);
    res.status(500).json({ error: 'OpenAI API error', details: err.message });
  }
});

module.exports = router; 