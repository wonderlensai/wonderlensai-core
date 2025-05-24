const { supabase } = require('../config/database');

class Scan {
  static async create(scanData) {
    const { data, error } = await supabase
      .from('scans')
      .insert([
        {
          user_id: scanData.user_id,
          device_id: scanData.device_id,
          image_url: scanData.image_url,
          child_age: scanData.child_age,
          child_country: scanData.child_country,
          image_size_kb: scanData.image_size_kb,
          created_at: scanData.created_at
        }
      ])
      .select();
    if (error) throw error;
    return data[0];
  }

  static async findByDeviceId(deviceId, limit = 10) {
    const { data, error } = await supabase
      .from('scans')
      .select(`
        id,
        image_url,
        created_at,
        openai_responses (
          id,
          response_json,
          created_at
        )
      `)
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async findRecentWithLearningData(limit = 20, userAge = null) {
    let query = supabase
      .from('scans')
      .select(`
        id,
        image_url,
        created_at,
        child_age,
        openai_responses!inner (
          id,
          response_json,
          created_at
        )
      `)
      .not('image_url', 'is', null)
      .not('openai_responses.response_json', 'is', null);
    
    // Add age-based filtering if user age is provided
    if (userAge) {
      // Show content from kids within ±2 years of user's age
      const minAge = Math.max(6, userAge - 2);
      const maxAge = Math.min(12, userAge + 2);
      query = query
        .gte('child_age', minAge)
        .lte('child_age', maxAge);
    }
    
    query = query
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async deleteById(scanId, deviceId) {
    // First verify that the scan belongs to the device
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('id')
      .eq('id', scanId)
      .eq('device_id', deviceId)
      .single();

    if (scanError) throw scanError;
    if (!scan) throw new Error('Scan not found or does not belong to this device');

    // Delete related OpenAI responses
    const { error: openaiError } = await supabase
      .from('openai_responses')
      .delete()
      .eq('scan_id', scanId);

    if (openaiError) throw openaiError;

    // Delete the scan
    const { error: deleteError } = await supabase
      .from('scans')
      .delete()
      .eq('id', scanId);

    if (deleteError) throw deleteError;
    
    return true;
  }
}

module.exports = Scan; 