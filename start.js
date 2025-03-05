const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if server directory exists
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.error('Server directory not found. Please make sure the server directory exists.');
  process.exit(1);
}

// Check if .env file exists in server directory
const envFile = path.join(serverDir, '.env');
if (!fs.existsSync(envFile)) {
  console.warn('\x1b[33m%s\x1b[0m', 'Warning: .env file not found in server directory.');
  console.warn('\x1b[33m%s\x1b[0m', 'Creating a default .env file with PORT=3001. Please update with your REPLICATE_API_TOKEN.');
  
  // Create a default .env file
  fs.writeFileSync(envFile, 'PORT=3001\nREPLICATE_API_TOKEN=your_replicate_api_token_here\n');
}

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting GameStudAI application...');

// Start backend server with the token
const backend = spawn('npm', ['run', 'start:with-token'], { cwd: serverDir, shell: true });

backend.stdout.on('data', (data) => {
  console.log('\x1b[32m[Backend]\x1b[0m', data.toString().trim());
});

backend.stderr.on('data', (data) => {
  console.error('\x1b[31m[Backend Error]\x1b[0m', data.toString().trim());
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], { cwd: __dirname, shell: true });

frontend.stdout.on('data', (data) => {
  console.log('\x1b[34m[Frontend]\x1b[0m', data.toString().trim());
});

frontend.stderr.on('data', (data) => {
  console.error('\x1b[31m[Frontend Error]\x1b[0m', data.toString().trim());
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\x1b[36m%s\x1b[0m', '🛑 Shutting down GameStudAI application...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Log any errors
backend.on('error', (error) => {
  console.error('\x1b[31m%s\x1b[0m', 'Failed to start backend server:', error);
});

frontend.on('error', (error) => {
  console.error('\x1b[31m%s\x1b[0m', 'Failed to start frontend:', error);
});

// Log when processes exit
backend.on('close', (code) => {
  if (code !== 0) {
    console.log('\x1b[31m%s\x1b[0m', `Backend server exited with code ${code}`);
  }
});

frontend.on('close', (code) => {
  if (code !== 0) {
    console.log('\x1b[31m%s\x1b[0m', `Frontend exited with code ${code}`);
  }
}); 