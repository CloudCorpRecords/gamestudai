/**
 * Service for interacting with the Replicate API
 * Used for AI-powered 3D model generation
 */

import axios from 'axios';

// Interface for Trellis model input parameters
export interface TrellisModelInput {
  images: string[];
  texture_size?: number;
  mesh_simplify?: number;
  generate_model?: boolean;
  save_gaussian_ply?: boolean;
  ss_sampling_steps?: number;
  seed?: number;
  randomize_seed?: boolean;
  generate_color?: boolean;
  generate_normal?: boolean;
  slat_sampling_steps?: number;
  return_no_background?: boolean;
  ss_guidance_strength?: number;
  slat_guidance_strength?: number;
}

// Interface for Trellis model output
export interface TrellisModelOutput {
  model_file?: string;
  color_video?: string;
  gaussian_ply?: string;
  normal_video?: string;
  combined_video?: string;
  no_background_images?: string[];
}

// Status of a model generation job
export interface ModelGenerationStatus {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: TrellisModelOutput | null;
  error: string | null;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

interface PredictionResponse {
  id: string;
  status: string;
  output: string[] | TrellisModelOutput;
  completed_at?: string;
  error?: string;
  created_at: string;
  started_at?: string;
}

interface ReplicateResponse {
  id: string;
  version: string;
  urls: {
    get: string;
    cancel: string;
  };
  status: string;
  created_at: string;
  completed_at?: string;
  logs?: string;
  output?: string[];
  error?: string;
}

interface ModelGenerationParams {
  prompt: string;
  negative_prompt?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
}

class ReplicateService {
  private readonly API_KEY_STORAGE_KEY = 'apiKey_replicate';
  private readonly API_URL = 'https://api.replicate.com/v1/predictions';
  private readonly DEFAULT_MODEL = 'cjwbw/shap-e:5957069d5c509126a73c7cb68abcddbb985aeefa4d318e7c63ec1352ce6da68c';
  private readonly TRELLIS_MODEL = 'firtoz/trellis:4876f2a8da1c544772dffa32e8889da4a1bab3a1f5c1937bfcfccb99ae347251';

  /**
   * Get the stored API key
   */
  getApiKey(): string | null {
    const apiKey = localStorage.getItem(this.API_KEY_STORAGE_KEY);
    console.log('Retrieved API key from storage:', apiKey ? '******' + apiKey.slice(-4) : 'null');
    return apiKey;
  }

  /**
   * Set the API key
   */
  setApiKey(key: string) {
    console.log('Setting API key in storage');
    localStorage.setItem(this.API_KEY_STORAGE_KEY, key);
  }

  /**
   * Clear the API key
   */
  clearApiKey() {
    console.log('Clearing API key from storage');
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
  }

  /**
   * Check if the API key is configured
   */
  isConfigured(): boolean {
    const hasKey = !!this.getApiKey();
    console.log('API key configured:', hasKey);
    return hasKey;
  }

  // Create headers with authentication
  private getHeaders() {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured');
    }
    
    // Ensure the API key is properly formatted
    const formattedKey = apiKey.trim();
    console.log('Creating headers with API key:', '*'.repeat(formattedKey.length - 4) + formattedKey.slice(-4));
    
    const headers = {
      'Authorization': `Bearer ${formattedKey}`,
      'Content-Type': 'application/json',
    } as Record<string, string>;
    
    return headers;
  }

  /**
   * Create a new model generation prediction
   */
  async createPrediction(params: ModelGenerationParams): Promise<ReplicateResponse> {
    if (!this.isConfigured()) {
      throw new Error('Replicate API key is not configured');
    }

    try {
      const response = await axios.post(
        this.API_URL,
        {
          version: this.DEFAULT_MODEL,
          input: {
            prompt: params.prompt,
            negative_prompt: params.negative_prompt || '',
            guidance_scale: params.guidance_scale || 7.5,
            num_inference_steps: params.num_inference_steps || 50,
            seed: params.seed || Math.floor(Math.random() * 1000000),
          },
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating prediction:', error);
      throw error;
    }
  }

  /**
   * Get the status of a prediction
   */
  async getPrediction(id: string): Promise<ReplicateResponse> {
    if (!this.isConfigured()) {
      throw new Error('Replicate API key is not configured');
    }

    try {
      const response = await axios.get(
        `${this.API_URL}/${id}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting prediction:', error);
      throw error;
    }
  }

  /**
   * Cancel a running prediction
   */
  async cancelPrediction(id: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Replicate API key is not configured');
    }

    try {
      await axios.post(
        `${this.API_URL}/${id}/cancel`,
        {},
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('Error canceling prediction:', error);
      throw error;
    }
  }

  /**
   * Upload an image to a temporary storage and return the URL
   */
  async uploadImage(file: File): Promise<string> {
    // In a production app, you would upload the image to a storage service
    // and return the URL. For this demo, we'll use a sample image URL
    // that is known to work with the Replicate API.
    console.log('Image file selected:', file.name, file.type, file.size);
    
    // For testing purposes, we'll use a sample image URL from the Replicate documentation
    // In a real app, you would upload the image to a storage service like S3 or Cloudinary
    const sampleImageUrl = "https://replicate.delivery/pbxt/MJaYRxQMgIzPsALScNadsZFCXR2h1n97xBzhRinmUQw9aw25/ephemeros_a_dune_sandworm_with_black_background_de398ce7-2276-4634-8f1d-c4ed2423cda4.png";
    
    console.log('Using sample image URL for testing:', sampleImageUrl);
    return sampleImageUrl;
  }

  // Generate a 3D model using Trellis model
  async generateModel(input: TrellisModelInput): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured');
    }

    try {
      const headers = this.getHeaders();
      // Add the Prefer header to match the curl example
      headers['Prefer'] = 'wait';
      
      console.log('Making API request to:', this.API_URL);
      console.log('With headers:', JSON.stringify(headers, null, 2));
      console.log('With payload:', JSON.stringify({
        version: this.TRELLIS_MODEL,
        input
      }, null, 2));
      
      const response = await axios.post(
        this.API_URL,
        {
          version: this.TRELLIS_MODEL,
          input
        },
        { headers }
      );
      
      console.log('Model generation response:', response.data);
      return response.data.id;
    } catch (error) {
      console.error('Error starting model generation:', error);
      
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:');
        console.error('Status:', error.response?.status);
        console.error('Status text:', error.response?.statusText);
        console.error('Response data:', error.response?.data);
        console.error('Request config:', error.config);
        
        if (error.response) {
          throw new Error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          throw new Error('No response received from API server');
        } else {
          throw new Error(`Error setting up request: ${error.message}`);
        }
      }
      
      throw error;
    }
  }

  // Check the status of a model generation job
  async checkStatus(predictionId: string): Promise<ModelGenerationStatus> {
    try {
      console.log(`Checking status for prediction ${predictionId}`);
      const response = await axios.get(
        `${this.API_URL}/${predictionId}`,
        { headers: this.getHeaders() }
      );
      
      console.log('Raw status response:', response.data);
      
      // Map the API status to our internal status
      let status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
      switch (response.data.status) {
        case 'starting':
        case 'processing':
          status = response.data.status;
          break;
        case 'succeeded':
          status = 'succeeded';
          break;
        case 'failed':
          status = 'failed';
          break;
        case 'canceled':
          status = 'canceled';
          break;
        default:
          status = 'processing';
      }
      
      return {
        id: response.data.id,
        status,
        output: response.data.output || null,
        error: response.data.error || null,
        created_at: response.data.created_at,
        started_at: response.data.started_at,
        completed_at: response.data.completed_at
      };
    } catch (error) {
      console.error('Error checking model status:', error);
      throw error;
    }
  }

  // Cancel a model generation job
  async cancelGeneration(predictionId: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.API_URL}/${predictionId}/cancel`,
        {},
        { headers: this.getHeaders() }
      );
      return true;
    } catch (error) {
      console.error('Error canceling model generation:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const replicateService = new ReplicateService(); 