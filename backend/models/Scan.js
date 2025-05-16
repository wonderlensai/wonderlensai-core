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
          created_at: new Date().toISOString()
        }
      ])
      .select();
    if (error) throw error;
    return data[0];
  }
}

module.exports = Scan; 