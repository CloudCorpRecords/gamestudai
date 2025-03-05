const { spawn } = require('child_process');
const path = require('path');

// Path to server directory
const serverDir = path.join(__dirname, 'server');

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting GameStudAI with direct Replicate integration...');

// Start backend server with direct approach
const backend = spawn('npm', ['run', 'direct'], { cwd: serverDir, shell: true });

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