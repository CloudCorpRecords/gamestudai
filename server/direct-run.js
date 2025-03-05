import Replicate from 'replicate';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Hard-coded API token (this is what worked in your replicate_major project)
const API_TOKEN = 'REPLACE_WITH_YOUR_API_TOKEN';

// Initialize Replicate client with the token
const replicate = new Replicate({
  auth: API_TOKEN,
  userAgent: 'GameStudAI'
});

// Initialize Express app
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Direct run server is running',
    apiConfigured: true
  });
});

// Run model endpoint
app.post('/api/replicate/run', async (req, res) => {
  try {
    const { version, input } = req.body;
    
    if (!version) {
      return res.status(400).json({ error: 'Model version is required' });
    }
    
    if (!input || !input.images || !input.images.length) {
      return res.status(400).json({ error: 'Input images are required' });
    }
    
    console.log('Running model with version:', version);
    console.log('Input parameters:', JSON.stringify({
      ...input,
      images: input.images.map(img => img.substring(0, 30) + '... [truncated]')
    }, null, 2));
    
    // Run the model directly with the hard-coded token
    console.log('Running...');
    const output = await replicate.run(version, { input });
    console.log('Done!', JSON.stringify(output, null, 2));
    
    // Return the output
    return res.json({ output });
  } catch (error) {
    console.error('Error running model:', error);
    
    // Handle different types of errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: `Replicate API error: ${error.response.data?.detail || error.message}`
      });
    }
    
    return res.status(500).json({
      error: `Server error: ${error.message}`
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Direct run server running on port ${PORT}`);
  console.log(`Using hard-coded API token`);
}); 