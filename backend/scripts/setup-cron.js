#!/usr/bin/env node

/**
 * setup-cron.js
 * 
 * This script helps set up a cron job to run the generate_kidnews.js script daily.
 * It provides instructions for setting up cron on various platforms.
 * 
 * Usage:
 * 1. Make this file executable: chmod +x setup-cron.js
 * 2. Run it: ./setup-cron.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const readline = require('readline');

// Get the absolute path to the generate_kidnews.js script
const scriptDir = __dirname;
const generateKidNewsPath = path.join(scriptDir, 'generate_kidnews.js');

// Check if the script exists
if (!fs.existsSync(generateKidNewsPath)) {
  console.error('Error: generate_kidnews.js not found in the expected location.');
  process.exit(1);
}

// Determine the operating system
const platform = os.platform();

console.log('=============================================');
console.log('WonderLens Daily News Cron Setup');
console.log('=============================================');
console.log('\nThis tool will help you set up a daily cron job to refresh WonderLens news content.\n');

// Create the node command to run the script
const nodeExecPath = process.execPath; // Path to the current Node.js executable
const command = `${nodeExecPath} ${generateKidNewsPath}`;

// Log different setup instructions based on the platform
if (platform === 'darwin' || platform === 'linux') {
  // macOS or Linux
  console.log('For macOS/Linux systems:');
  console.log('------------------------');
  console.log('1. Open your crontab:');
  console.log('   $ crontab -e');
  console.log('\n2. Add the following line to run the script daily at 4 AM:');
  console.log(`   0 4 * * * cd ${path.dirname(scriptDir)} && ${command} >> ${scriptDir}/cron.log 2>&1`);
  console.log('\n3. Save and exit the editor.');
  
  // Try to add to crontab automatically if on macOS/Linux
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nWould you like to try adding this to your crontab automatically? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      try {
        // Get existing crontab
        const existingCrontab = execSync('crontab -l').toString().trim();
        const cronLine = `0 4 * * * cd ${path.dirname(scriptDir)} && ${command} >> ${scriptDir}/cron.log 2>&1`;
        
        // Check if entry already exists
        if (existingCrontab.includes(cronLine)) {
          console.log('Cron job already exists. No changes made.');
        } else {
          // Write to temporary file
          const tempFile = path.join(os.tmpdir(), 'wonderlens-crontab');
          fs.writeFileSync(tempFile, `${existingCrontab}\n${cronLine}\n`);
          
          // Install new crontab
          execSync(`crontab ${tempFile}`);
          fs.unlinkSync(tempFile);
          console.log('Cron job added successfully!');
        }
      } catch (error) {
        console.log('Could not add cron job automatically. Please follow the manual instructions above.');
        console.error(error.message);
      }
    }
    
    printManualTestingInstructions();
    rl.close();
  });
} else if (platform === 'win32') {
  // Windows
  console.log('For Windows systems:');
  console.log('-------------------');
  console.log('1. Create a batch file named "wonderlens-daily.bat" with the following content:');
  console.log(`   @echo off\n   cd ${path.dirname(scriptDir)}\n   ${command} >> ${scriptDir}\\cron.log 2>&1`);
  console.log('\n2. Open Task Scheduler:');
  console.log('   - Start > Search "Task Scheduler"');
  console.log('   - Click on "Create Basic Task"');
  console.log('   - Name it "WonderLens Daily News Update"');
  console.log('   - Set trigger: Daily at 4:00 AM');
  console.log('   - Action: Start a program');
  console.log('   - Browse to your batch file location');
  console.log('   - Finish the wizard');
  
  printManualTestingInstructions();
} else {
  // Other platforms
  console.log(`For your platform (${platform}):`);
  console.log('Please set up a scheduled task to run the following command daily:');
  console.log(`cd ${path.dirname(scriptDir)} && ${command}`);
  
  printManualTestingInstructions();
}

function printManualTestingInstructions() {
  console.log('\n=============================================');
  console.log('Manual Testing:');
  console.log('=============================================');
  console.log('To test the script manually, run:');
  console.log(`node ${generateKidNewsPath}`);
  console.log('\nThis will generate today\'s news content immediately.');
  console.log('=============================================');
} 