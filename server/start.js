import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the backend server
const backend = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Start the frontend server
const frontend = spawn('npm', ['start'], {
  cwd: join(__dirname, '..'),
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