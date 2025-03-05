import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Replicate from 'replicate';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.post('/api/replicate/run', async (req, res) => {
  try {
    console.log('Received model generation request:', JSON.stringify(req.body, null, 2));
    
    const { version, input } = req.body;
    
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'REPLICATE_API_TOKEN environment variable is not set' });
    }
    
    console.log('Running Replicate model with version:', version);
    console.log('Input:', JSON.stringify(input, null, 2));
    
    const output = await replicate.run(version, { input });
    
    console.log('Replicate model output:', JSON.stringify(output, null, 2));
    
    res.json({ output });
  } catch (error) {
    console.error('Error running Replicate model:', error.message);
    
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.response?.data || error.stack
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    replicateConfigured: !!process.env.REPLICATE_API_TOKEN
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server: http://localhost:${PORT}/api/test`);
  console.log(`Replicate API token configured: ${!!process.env.REPLICATE_API_TOKEN}`);
}); 