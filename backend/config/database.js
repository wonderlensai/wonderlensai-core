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

// Helper function to format storage URLs properly
function getPublicUrl(path) {
  if (!path) return null;
  
  // If already a complete URL, return as is
  if (path.startsWith('http')) return path;
  
  // If it's a base64 string, return as is
  if (path.startsWith('data:')) return path;
  
  // Otherwise, construct a proper Supabase storage URL
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${path}`;
}

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

module.exports = { supabase, inspectTable, getPublicUrl }; 