const { supabase } = require('../config/database');

function base64ToBuffer(base64) {
  // Remove data URL prefix if present
  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const b64 = matches ? matches[2] : base64;
  return Buffer.from(b64, 'base64');
}

async function uploadImageToSupabase(base64Image, userId = 'anonymous') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6);
  const filename = `${userId}_${timestamp}_${random}.jpg`;
  const fileBuffer = base64ToBuffer(base64Image);

  const { data, error } = await supabase.storage
    .from('scan-media')
    .upload(filename, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('scan-media')
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

module.exports = { uploadImageToSupabase }; 