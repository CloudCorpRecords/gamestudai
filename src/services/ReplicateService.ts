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
  output: string[];
  completed_at?: string;
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

  /**
   * Get the stored API key
   */
  getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  /**
   * Set the API key
   */
  setApiKey(key: string) {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, key);
  }

  /**
   * Clear the API key
   */
  clearApiKey() {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
  }

  /**
   * Check if the API key is configured
   */
  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  // Create headers with authentication
  private getHeaders() {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured');
    }
    return {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    };
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

  // Generate a 3D model using text-to-3D model
  async generateModel(prompt: string): Promise<PredictionResponse> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured');
    }

    try {
      const response = await axios.post(
        this.API_URL,
        {
          version: "4876f2a8da1c544772dffa32e8889da4a1bab3a1f5c1937bfcfccb99ae347251",
          input: { prompt }
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating model:', error);
      throw error;
    }
  }

  // Check the status of a prediction
  async checkStatus(predictionId: string): Promise<PredictionResponse> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured');
    }

    try {
      const response = await axios.get(
        `${this.API_URL}/${predictionId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking status:', error);
      throw error;
    }
  }

  // Cancel a prediction
  async cancelGeneration(predictionId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured');
    }

    try {
      await axios.post(
        `${this.API_URL}/${predictionId}/cancel`,
        {},
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('Error canceling generation:', error);
      throw error;
    }
  }

  // Helper to upload an image file and get a URL
  async uploadImage(file: File): Promise<string> {
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Use a proxy server or direct upload to get a URL
      // This is a simplified example - in a real app, you might need a server-side component
      // or use a service like Cloudinary, AWS S3, etc.
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/your-cloud-name/upload',
        formData,
        {
          params: {
            upload_preset: 'your-upload-preset'
          }
        }
      );
      
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const replicateService = new ReplicateService(); 