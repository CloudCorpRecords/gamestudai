import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API token from the replicate_major project
const API_TOKEN = 'REPLACE_WITH_YOUR_API_TOKEN';

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  // Read the current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the API token line or add it if it doesn't exist
  if (envContent.includes('REPLICATE_API_TOKEN=')) {
    envContent = envContent.replace(
      /REPLICATE_API_TOKEN=.*/,
      `REPLICATE_API_TOKEN=${API_TOKEN}`
    );
  } else {
    envContent += `\nREPLICATE_API_TOKEN=${API_TOKEN}\n`;
  }
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('Updated .env file with API token');
} else {
  // Create a new .env file
  fs.writeFileSync(envPath, `PORT=3001\nREPLICATE_API_TOKEN=${API_TOKEN}\n`);
  console.log('Created .env file with API token');
}

// Start the server
console.log('Starting server...');
const server = spawn('node', ['server.js'], { 
  stdio: 'inherit',
  shell: true
});

// Handle server exit
server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit(0);
}); 