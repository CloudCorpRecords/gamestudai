const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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
app.post('/api/replicate/predictions', async (req, res) => {
  try {
    console.log('Received model generation request:', JSON.stringify(req.body, null, 2));
    
    const { version, input, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    console.log('Making request to Replicate API with version:', version);
    
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version,
        input
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Replicate API response:', response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Replicate API:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || 'Error from Replicate API',
        status: error.response.status
      });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/api/replicate/predictions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    console.log(`Checking status for prediction ${id}`);
    
    const response = await axios.get(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Prediction status response:', response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error checking prediction status:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || 'Error from Replicate API',
        status: error.response.status
      });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/replicate/predictions/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    console.log(`Canceling prediction ${id}`);
    
    const response = await axios.post(
      `https://api.replicate.com/v1/predictions/${id}/cancel`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Prediction cancel response:', response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error canceling prediction:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || 'Error from Replicate API',
        status: error.response.status
      });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server: http://localhost:${PORT}/api/test`);
}); 