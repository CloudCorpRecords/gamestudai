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

class ReplicateService {
  private readonly API_KEY_STORAGE_KEY = 'apiKey_replicate';
  private readonly TRELLIS_MODEL = 'firtoz/trellis:4876f2a8da1c544772dffa32e8889da4a1bab3a1f5c1937bfcfccb99ae347251';
  private readonly API_BASE_URL = 'http://localhost:3001/api/replicate';

  /**
   * Get the API key from local storage
   */
  getApiKey(): string | null {
    const apiKey = localStorage.getItem(this.API_KEY_STORAGE_KEY);
    console.log('Retrieved API key from storage:', apiKey ? '******' + apiKey.slice(-4) : 'null');
    return apiKey;
  }

  /**
   * Set the API key in local storage
   */
  setApiKey(key: string) {
    console.log('Setting API key in storage');
    localStorage.setItem(this.API_KEY_STORAGE_KEY, key);
  }

  /**
   * Clear the API key from local storage
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

  /**
   * Upload an image and return its URL
   * Note: In a real app, you would upload to a storage service
   * For this demo, we're using a sample image URL
   */
  async uploadImage(file: File): Promise<string> {
    console.log('Image file selected:', file.name, file.type, file.size);
    
    // For testing purposes, we'll use a sample image URL from the Replicate documentation
    const sampleImageUrl = "https://replicate.delivery/pbxt/MJaYRxQMgIzPsALScNadsZFCXR2h1n97xBzhRinmUQw9aw25/ephemeros_a_dune_sandworm_with_black_background_de398ce7-2276-4634-8f1d-c4ed2423cda4.png";
    
    console.log('Using sample image URL for testing:', sampleImageUrl);
    return sampleImageUrl;
  }

  /**
   * Generate a 3D model using the Trellis model
   */
  async generateModel(input: TrellisModelInput): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured');
    }

    try {
      console.log('Generating 3D model with input:', input);
      
      const apiKey = this.getApiKey();
      
      const response = await axios.post(`${this.API_BASE_URL}/predictions`, {
        version: this.TRELLIS_MODEL,
        input,
        apiKey
      });
      
      console.log('Model generation started with ID:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error generating model:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  }

  /**
   * Check the status of a model generation
   */
  async checkStatus(predictionId: string): Promise<ModelGenerationStatus> {
    try {
      console.log(`Checking status for prediction ${predictionId}`);
      
      const apiKey = this.getApiKey();
      
      const response = await axios.get(`${this.API_BASE_URL}/predictions/${predictionId}`, {
        params: { apiKey }
      });
      
      console.log('Raw prediction status:', response.data);
      
      // Map the prediction status to our internal status
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
      
      // Handle the output based on the status
      let output: TrellisModelOutput | null = null;
      if (response.data.output && typeof response.data.output === 'object') {
        output = response.data.output as TrellisModelOutput;
      }
      
      // Handle the error property
      let errorMessage: string | null = null;
      if (response.data.error) {
        errorMessage = typeof response.data.error === 'string' 
          ? response.data.error 
          : JSON.stringify(response.data.error);
      }
      
      return {
        id: response.data.id,
        status,
        output,
        error: errorMessage,
        created_at: response.data.created_at,
        started_at: response.data.started_at,
        completed_at: response.data.completed_at
      };
    } catch (error) {
      console.error('Error checking model status:', error);
      throw error;
    }
  }

  /**
   * Cancel a model generation
   */
  async cancelGeneration(predictionId: string): Promise<boolean> {
    try {
      console.log(`Canceling prediction ${predictionId}`);
      
      const apiKey = this.getApiKey();
      
      await axios.post(`${this.API_BASE_URL}/predictions/${predictionId}/cancel`, {
        apiKey
      });
      
      console.log(`Prediction ${predictionId} canceled successfully`);
      return true;
    } catch (error) {
      console.error('Error canceling prediction:', error);
      return false;
    }
  }
}

// Export a singleton instance
export default new ReplicateService(); 