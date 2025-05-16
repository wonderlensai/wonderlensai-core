const { supabase } = require('../config/database');

class OpenAIResponse {
  static async create(responseData) {
    const { data, error } = await supabase
      .from('openai_responses')
      .insert([
        {
          scan_id: responseData.scan_id,
          response_json: responseData.response_json,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    if (error) throw error;
    return data[0];
  }
}

module.exports = OpenAIResponse; 