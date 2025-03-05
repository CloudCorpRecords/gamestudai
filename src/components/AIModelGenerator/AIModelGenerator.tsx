import React, { useState, useEffect, useRef } from 'react';
import './AIModelGenerator.css';
import replicateService, { TrellisModelInput, ModelGenerationStatus } from '../../services/ReplicateService';

// Default model generation parameters
const DEFAULT_PARAMS: Partial<TrellisModelInput> = {
  texture_size: 2048,
  mesh_simplify: 0.9,
  generate_model: true,
  save_gaussian_ply: true,
  ss_sampling_steps: 38,
  randomize_seed: true,
  generate_color: true
};

const AIModelGenerator: React.FC = () => {
  // State for image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // State for model generation
  const [modelParams, setModelParams] = useState<Partial<TrellisModelInput>>({...DEFAULT_PARAMS});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<ModelGenerationStatus | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // State for API configuration
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  
  // Polling interval reference
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Check if API is configured on mount
  useEffect(() => {
    const checkApiConfig = () => {
      const isConfigured = replicateService.isConfigured();
      console.log('API configured on mount:', isConfigured);
      setIsApiConfigured(isConfigured);
    };
    
    checkApiConfig();
  }, []);
  
  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
      }
    };
  }, []);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Image size should be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      setUploadError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle parameter change
  const handleParamChange = (key: keyof TrellisModelInput, value: any) => {
    setModelParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle checkbox parameter change
  const handleCheckboxChange = (key: keyof TrellisModelInput) => {
    setModelParams(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle model generation
  const handleGenerateModel = async () => {
    console.log('Generate model button clicked');
    
    // Check if API is configured
    const apiConfigured = replicateService.isConfigured();
    console.log('API configured:', apiConfigured);
    
    if (!selectedImage) {
      setGenerationError('Please select an image first');
      return;
    }
    
    if (!apiConfigured) {
      console.error('API key not configured');
      setGenerationError('Please configure your Replicate API key in Settings');
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStatus(null);
    
    try {
      console.log('Starting model generation process...');
      console.log('Selected image:', selectedImage);
      console.log('Model parameters:', modelParams);
      
      // Upload image
      setUploadStatus('uploading');
      console.log('Uploading image...');
      const imageUrl = await replicateService.uploadImage(selectedImage);
      console.log('Image uploaded successfully:', imageUrl);
      setUploadStatus('success');
      
      // Start model generation
      const input: TrellisModelInput = {
        ...modelParams,
        images: [imageUrl]
      } as TrellisModelInput;
      
      console.log('Sending model generation request with input:', input);
      const id = await replicateService.generateModel(input);
      console.log('Model generation started with ID:', id);
      setGenerationId(id);
      
      // Start polling for status
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
      }
      
      let isMounted = true;
      
      // Clean up function to prevent memory leaks
      const cleanup = () => {
        isMounted = false;
        if (statusPollingRef.current) {
          clearInterval(statusPollingRef.current);
          statusPollingRef.current = null;
        }
      };
      
      statusPollingRef.current = setInterval(async () => {
        try {
          console.log('Checking status for generation ID:', id);
          const status = await replicateService.checkStatus(id);
          console.log('Current generation status:', status);
          
          // Only update state if component is still mounted
          if (isMounted) {
            setGenerationStatus(status);
            
            // Stop polling when generation is complete
            if (['succeeded', 'failed', 'canceled'].includes(status.status)) {
              console.log('Generation process completed with status:', status.status);
              cleanup();
              setIsGenerating(false);
            }
          }
        } catch (error) {
          console.error('Error checking generation status:', error);
          if (isMounted) {
            cleanup();
            setIsGenerating(false);
            setGenerationError('Failed to check generation status');
          }
        }
      }, 2000); // Poll every 2 seconds
      
      // Clean up on unmount
      return cleanup;
      
    } catch (error) {
      console.error('Error generating model:', error);
      if (error instanceof Error) {
        setGenerationError(`Failed to generate model: ${error.message}`);
      } else {
        setGenerationError('Failed to generate model: Unknown error');
      }
      setIsGenerating(false);
      setUploadStatus('error');
    }
  };

  // Handle canceling model generation
  const handleCancelGeneration = async () => {
    if (generationId && statusPollingRef.current) {
      try {
        await replicateService.cancelGeneration(generationId);
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
        setIsGenerating(false);
        setGenerationStatus(prev => prev ? {...prev, status: 'canceled'} : null);
      } catch (error) {
        console.error('Error canceling generation:', error);
        setGenerationError('Failed to cancel generation');
      }
    }
  };
  
  // Handle importing the generated model
  const handleImportModel = () => {
    if (generationStatus?.output?.model_file) {
      // TODO: Implement model import functionality
      console.log('Importing model from URL:', generationStatus.output.model_file);
      alert('Model import functionality will be implemented in a future update');
    }
  };
  
  // Reset the form
  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadStatus('idle');
    setUploadError(null);
    setModelParams({...DEFAULT_PARAMS});
    setGenerationId(null);
    setGenerationStatus(null);
    setGenerationError(null);
    
    // Clear file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Render generation status
  const renderGenerationStatus = () => {
    if (!generationStatus) return null;
    
    const { status, output } = generationStatus;
    
    switch (status) {
      case 'starting':
        return (
          <div className="status-card starting">
            <div className="status-icon">🔄</div>
            <div className="status-info">
              <h4>Starting Generation</h4>
              <p>Preparing to generate your 3D model...</p>
            </div>
          </div>
        );
        
      case 'processing':
        return (
          <div className="status-card processing">
            <div className="status-icon">⚙️</div>
            <div className="status-info">
              <h4>Processing</h4>
              <p>Generating your 3D model. This may take several minutes...</p>
              <div className="progress-bar">
                <div className="progress-indicator"></div>
              </div>
            </div>
            <button 
              className="cancel-button" 
              onClick={handleCancelGeneration}
            >
              Cancel
            </button>
          </div>
        );
        
      case 'succeeded':
        return (
          <div className="status-card success">
            <div className="status-icon">✅</div>
            <div className="status-info">
              <h4>Generation Complete</h4>
              <p>Your 3D model has been successfully generated!</p>
              
              <div className="model-outputs">
                {output?.model_file && (
                  <div className="output-item">
                    <span>3D Model (GLB):</span>
                    <a 
                      href={output.model_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="output-link"
                    >
                      Download
                    </a>
                    <button 
                      className="import-button"
                      onClick={handleImportModel}
                    >
                      Import to Scene
                    </button>
                  </div>
                )}
                
                {output?.color_video && (
                  <div className="output-item">
                    <span>Preview Video:</span>
                    <a 
                      href={output.color_video} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="output-link"
                    >
                      View
                    </a>
                  </div>
                )}
                
                {output?.gaussian_ply && (
                  <div className="output-item">
                    <span>Point Cloud (PLY):</span>
                    <a 
                      href={output.gaussian_ply} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="output-link"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'failed':
        return (
          <div className="status-card error">
            <div className="status-icon">❌</div>
            <div className="status-info">
              <h4>Generation Failed</h4>
              <p>{generationStatus.error || 'An error occurred during model generation.'}</p>
            </div>
          </div>
        );
        
      case 'canceled':
        return (
          <div className="status-card canceled">
            <div className="status-icon">🛑</div>
            <div className="status-info">
              <h4>Generation Canceled</h4>
              <p>The model generation was canceled.</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render API warning with direct link to settings
  const renderApiWarning = () => {
    return (
      <div className="api-warning">
        <h3>API Key Required</h3>
        <p>
          To use the AI Model Generator, you need to configure your Replicate API key.
          <br />
          <a 
            href="#" 
            className="settings-link"
            onClick={(e) => {
              e.preventDefault();
              // Navigate to settings tab
              const event = new CustomEvent('navigate', { 
                detail: { tab: 'SETTINGS' } 
              });
              window.dispatchEvent(event);
            }}
          >
            Go to Settings
          </a>
        </p>
      </div>
    );
  };

  return (
    <div className="ai-model-generator">
      <div className="generator-header">
        <h2>AI 3D Model Generator</h2>
        <p>Generate 3D models from images using AI</p>
      </div>
      
      {!isApiConfigured && renderApiWarning()}
      
      <div className="generator-content">
        <div className="image-upload-section">
          <h3>1. Upload Image</h3>
          <p>Select an image to generate a 3D model from. For best results, use an image with a clear subject and a simple background.</p>
          
          <div className="upload-area">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isGenerating}
            />
            <label htmlFor="image-upload" className={`upload-label ${isGenerating ? 'disabled' : ''}`}>
              {imagePreview ? 'Change Image' : 'Select Image'}
            </label>
            
            {uploadError && (
              <div className="upload-error">
                {uploadError}
              </div>
            )}
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Selected" />
              </div>
            )}
          </div>
        </div>
        
        <div className="model-params-section">
          <h3>2. Configure Parameters</h3>
          <p>Adjust the parameters to control the quality and characteristics of the generated model.</p>
          
          <div className="params-grid">
            <div className="param-group">
              <label htmlFor="texture-size">Texture Size</label>
              <select
                id="texture-size"
                value={modelParams.texture_size || 1024}
                onChange={(e) => handleParamChange('texture_size', parseInt(e.target.value))}
                disabled={isGenerating}
              >
                <option value={512}>512px (Low)</option>
                <option value={1024}>1024px (Medium)</option>
                <option value={2048}>2048px (High)</option>
              </select>
            </div>
            
            <div className="param-group">
              <label htmlFor="mesh-simplify">Mesh Simplification</label>
              <select
                id="mesh-simplify"
                value={modelParams.mesh_simplify || 0.95}
                onChange={(e) => handleParamChange('mesh_simplify', parseFloat(e.target.value))}
                disabled={isGenerating}
              >
                <option value={0.9}>0.9 (More Detail)</option>
                <option value={0.95}>0.95 (Balanced)</option>
                <option value={0.98}>0.98 (More Optimized)</option>
              </select>
            </div>
            
            <div className="param-group">
              <label htmlFor="sampling-steps">Sampling Steps</label>
              <input
                type="range"
                id="sampling-steps"
                min={12}
                max={50}
                value={modelParams.ss_sampling_steps || 38}
                onChange={(e) => handleParamChange('ss_sampling_steps', parseInt(e.target.value))}
                disabled={isGenerating}
              />
              <span className="range-value">{modelParams.ss_sampling_steps || 38}</span>
            </div>
            
            <div className="param-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={!!modelParams.generate_model}
                  onChange={() => handleCheckboxChange('generate_model')}
                  disabled={isGenerating}
                />
                Generate 3D Model (GLB)
              </label>
            </div>
            
            <div className="param-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={!!modelParams.save_gaussian_ply}
                  onChange={() => handleCheckboxChange('save_gaussian_ply')}
                  disabled={isGenerating}
                />
                Save Point Cloud (PLY)
              </label>
            </div>
            
            <div className="param-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={!!modelParams.generate_color}
                  onChange={() => handleCheckboxChange('generate_color')}
                  disabled={isGenerating}
                />
                Generate Preview Video
              </label>
            </div>
          </div>
        </div>
        
        <div className="generation-actions">
          <button
            className="generate-button"
            onClick={handleGenerateModel}
            disabled={!selectedImage || isGenerating || !isApiConfigured}
          >
            {isGenerating ? 'Generating...' : 'Generate 3D Model'}
          </button>
          
          <button
            className="reset-button"
            onClick={handleReset}
            disabled={isGenerating}
          >
            Reset
          </button>
        </div>
        
        {generationError && (
          <div className="generation-error">
            {generationError}
          </div>
        )}
        
        <div className="generation-status">
          {renderGenerationStatus()}
        </div>
        
        <div className="generator-info">
          <h4>About AI Model Generation</h4>
          <ul>
            <li>Model generation typically takes 3-5 minutes depending on complexity.</li>
            <li>This feature uses the Trellis AI model via Replicate's API.</li>
            <li>You will be charged by Replicate based on your usage.</li>
            <li>For best results, use images with a clear subject and simple background.</li>
            <li>Generated models may require additional cleanup in a 3D modeling program.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIModelGenerator; 