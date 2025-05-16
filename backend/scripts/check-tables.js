const { supabase, inspectTable } = require('../config/database');

async function checkTables() {
  console.log('Checking devices table structure...');
  const devicesFields = await inspectTable('devices');
  
  console.log('\nChecking analyses table structure...');
  const analysesFields = await inspectTable('analyses');
  
  console.log('\nTable structures:');
  console.log('Devices:', devicesFields);
  console.log('Analyses:', analysesFields);
}

checkTables().catch(console.error); 