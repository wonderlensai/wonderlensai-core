const { supabase } = require('../config/database');

class Device {
  static async create(deviceInfo, userId = null) {
    const { data, error } = await supabase
      .from('devices')
      .insert([
        {
          user_id: userId,
          device_info: deviceInfo,
          device_type: deviceInfo.deviceType,
          os_version: deviceInfo.osVersion,
          app_version: deviceInfo.appVersion,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    if (error) throw error;
    return data[0];
  }

  static async findByDeviceUniqueId(deviceId) {
    // deviceId is a property inside the device_info JSONB
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .filter('device_info->>deviceId', 'eq', deviceId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
  }
}

module.exports = Device; 