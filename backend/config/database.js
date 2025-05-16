const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to inspect table structure
async function inspectTable(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);
  
  if (error) {
    console.error(`Error inspecting table ${tableName}:`, error);
    return null;
  }
  
  if (data && data.length > 0) {
    console.log(`Table ${tableName} structure:`, Object.keys(data[0]));
    return Object.keys(data[0]);
  }
  return null;
}

module.exports = { supabase, inspectTable }; 