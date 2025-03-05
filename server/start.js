const { spawn } = require('child_process');
const path = require('path');

// Start the backend server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname),
  stdio: 'inherit'
});

// Start the frontend server
const frontend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});

// Log process exit
backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
});

frontend.on('close', (code) => {
  console.log(`Frontend server exited with code ${code}`);
}); 