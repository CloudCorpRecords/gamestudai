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
    // For this implementation, we're using the API key from the server's .env file
    // So we'll just return a dummy value to indicate it's configured
    return "configured_on_server";
  }

  /**
   * Set the API key in local storage
   */
  setApiKey(key: string) {
    console.log('API key is configured on the server, no need to set it here');
    // We're not actually storing the key in localStorage anymore
    // It's configured in the server's .env file
  }

  /**
   * Clear the API key from local storage
   */
  clearApiKey() {
    console.log('API key is configured on the server, no need to clear it here');
  }

  /**
   * Check if the API key is configured
   */
  isConfigured(): boolean {
    // We'll assume it's configured on the server
    return true;
  }

  /**
   * Upload an image and return its URL
   * For this implementation, we'll convert the image to a data URL
   */
  async uploadImage(file: File): Promise<string> {
    console.log('Image file selected:', file.name, file.type, file.size);
    
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          console.log('Image converted to data URL, length:', dataUrl.length);
          resolve(dataUrl);
        };
        
        reader.onerror = () => {
          console.error('Error reading file:', reader.error);
          reject(new Error('Failed to read image file'));
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error in uploadImage:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate a 3D model using the Trellis model
   */
  async generateModel(input: TrellisModelInput): Promise<string> {
    try {
      console.log('Generating 3D model with input:', JSON.stringify({
        ...input,
        images: input.images.map(img => img.substring(0, 30) + '... [truncated]')
      }, null, 2));
      
      // Make the API request to our backend server
      const response = await axios.post(`${this.API_BASE_URL}/run`, {
        version: this.TRELLIS_MODEL,
        input
      });
      
      console.log('Model generation response received');
      
      // The backend returns the complete output directly
      const output = response.data.output;
      
      // Store the output in localStorage for later use
      localStorage.setItem('lastModelOutput', JSON.stringify(output));
      
      // Return a dummy ID since we're not using the polling approach anymore
      return 'direct-generation-completed';
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
   * Note: Since we're using the direct approach, this just returns the stored output
   */
  async checkStatus(predictionId: string): Promise<ModelGenerationStatus> {
    try {
      console.log(`Checking status for prediction ${predictionId}`);
      
      // Get the output from localStorage
      const outputStr = localStorage.getItem('lastModelOutput');
      const output = outputStr ? JSON.parse(outputStr) : null;
      
      console.log('Retrieved model output:', output ? 'Output found' : 'No output found');
      
      // Create a status object
      return {
        id: predictionId,
        status: output ? 'succeeded' : 'failed',
        output: output as TrellisModelOutput,
        error: output ? null : 'No output found',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking model status:', error);
      throw error;
    }
  }

  /**
   * Cancel a model generation
   * Note: Not applicable with the direct approach
   */
  async cancelGeneration(predictionId: string): Promise<boolean> {
    console.log(`Canceling prediction ${predictionId} - not applicable with direct generation`);
    return true;
  }
}

// Export a singleton instance
export default new ReplicateService(); 