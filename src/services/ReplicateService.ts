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

  /**
   * Upload an image to a temporary storage and return the URL
   */
  async uploadImage(file: File): Promise<string> {
    // In a real implementation, this would upload to a storage service
    // For now, we'll create a data URL as a placeholder
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // In a real implementation, this would be a URL to the uploaded image
          // For demo purposes, we'll just return a placeholder URL
          resolve('https://replicate.delivery/placeholder/image.jpg');
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Generate a 3D model using Trellis model
  async generateModel(input: TrellisModelInput): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured');
    }

    try {
      const response = await axios.post(
        this.API_URL,
        {
          version: this.TRELLIS_MODEL,
          input
        },
        { headers: this.getHeaders() }
      );
      
      return response.data.id;
    } catch (error) {
      console.error('Error starting model generation:', error);
      throw error;
    }
  }

  // Check the status of a model generation job
  async checkStatus(predictionId: string): Promise<ModelGenerationStatus> {
    try {
      const response = await axios.get(
        `${this.API_URL}/${predictionId}`,
        { headers: this.getHeaders() }
      );
      
      return {
        id: response.data.id,
        status: response.data.status,
        output: response.data.output,
        error: response.data.error,
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