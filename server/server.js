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
  userAgent: 'GameStudAI'
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  const isConfigured = !!process.env.REPLICATE_API_TOKEN;
  res.json({
    status: 'ok',
    message: 'Server is running',
    apiConfigured: isConfigured
  });
});

// Run model endpoint
app.post('/api/replicate/run', async (req, res) => {
  try {
    // Check if API token is configured
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({
        error: 'Replicate API token not configured. Please set REPLICATE_API_TOKEN in .env file.'
      });
    }

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
    
    // Run the model
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Replicate API token configured: ${!!process.env.REPLICATE_API_TOKEN}`);
}); 