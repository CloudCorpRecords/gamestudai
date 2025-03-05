import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Function to start the server
function startServer() {
  console.log('Starting server...');
  const server = spawn('node', ['server.js'], { 
    stdio: 'inherit',
    shell: true
  });

  // Handle server exit
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    rl.close();
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.kill();
    rl.close();
    process.exit(0);
  });
}

// Check if .env file exists
if (fs.existsSync(envPath)) {
  // Read the current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if API token is already set
  if (envContent.includes('REPLICATE_API_TOKEN=') && 
      !envContent.includes('REPLICATE_API_TOKEN=your_replicate_api_token_here')) {
    console.log('API token already set in .env file');
    startServer();
  } else {
    // Prompt for API token
    rl.question('Please enter your Replicate API token: ', (token) => {
      // Replace the API token line or add it if it doesn't exist
      if (envContent.includes('REPLICATE_API_TOKEN=')) {
        envContent = envContent.replace(
          /REPLICATE_API_TOKEN=.*/,
          `REPLICATE_API_TOKEN=${token}`
        );
      } else {
        envContent += `\nREPLICATE_API_TOKEN=${token}\n`;
      }
      
      // Write the updated content back to the .env file
      fs.writeFileSync(envPath, envContent);
      
      console.log('Updated .env file with API token');
      startServer();
    });
  }
} else {
  // Prompt for API token
  rl.question('Please enter your Replicate API token: ', (token) => {
    // Create a new .env file
    fs.writeFileSync(envPath, `PORT=3001\nREPLICATE_API_TOKEN=${token}\n`);
    console.log('Created .env file with API token');
    startServer();
  });
} 