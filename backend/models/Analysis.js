const { supabase } = require('../config/database');

class Analysis {
  static async create(analysisData) {
    const { data, error } = await supabase
      .from('analyses')
      .insert([{
        device_id: analysisData.deviceId,
        child_age: analysisData.childAge,
        child_country: analysisData.childCountry,
        object_name: analysisData.object,
        lenses: analysisData.lenses,
        image_size_kb: analysisData.imageSizeKB,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return data[0];
  }

  static async findByDeviceId(deviceId, limit = 10) {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

module.exports = Analysis; 