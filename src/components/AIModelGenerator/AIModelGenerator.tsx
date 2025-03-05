import React, { useState, useEffect, useRef } from 'react';
import './AIModelGenerator.css';
import ReplicateService, { TrellisModelInput, ModelGenerationStatus } from '../../services/ReplicateService';

const AIModelGenerator: React.FC = () => {
  // State for image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State for model generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<ModelGenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for model parameters
  const [modelParams, setModelParams] = useState<TrellisModelInput>({
    images: [],
    texture_size: 1024,
    mesh_simplify: 0.5,
    generate_model: true,
    save_gaussian_ply: true,
    ss_sampling_steps: 25,
    seed: 42,
    randomize_seed: true,
    generate_color: true,
    generate_normal: true,
    slat_sampling_steps: 25,
    return_no_background: false,
    ss_guidance_strength: 7.5,
    slat_guidance_strength: 7.5
  });
  
  // Ref for polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset generation state
      setGenerationId(null);
      setGenerationStatus(null);
      setError(null);
    }
  };
  
  // Handle parameter change
  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle different input types
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setModelParams(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseFloat(value);
      setModelParams(prev => ({ ...prev, [name]: numValue }));
    } else {
      setModelParams(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Generate the 3D model
  const generateModel = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    
    if (!ReplicateService.isConfigured()) {
      setError('Please configure your API key in the Settings tab first');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Upload the image
      const imageUrl = await ReplicateService.uploadImage(selectedImage);
      console.log('Image uploaded, URL:', imageUrl);
      
      // Prepare input with the image URL
      const input: TrellisModelInput = {
        ...modelParams,
        images: [imageUrl]
      };
      
      // Generate the model
      const id = await ReplicateService.generateModel(input);
      console.log('Model generation started, ID:', id);
      
      setGenerationId(id);
      
      // Check status immediately
      const status = await ReplicateService.checkStatus(id);
      setGenerationStatus(status);
      
      // If we're using the direct approach, we don't need polling
      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating model:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsGenerating(false);
    }
  };
  
  // Cancel the model generation
  const cancelGeneration = async () => {
    if (generationId) {
      try {
        await ReplicateService.cancelGeneration(generationId);
        setIsGenerating(false);
        
        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } catch (err) {
        console.error('Error canceling generation:', err);
      }
    }
  };
  
  // Render the model output
  const renderModelOutput = () => {
    if (!generationStatus || !generationStatus.output) return null;
    
    const output = generationStatus.output;
    
    return (
      <div className="model-output">
        <h3>Generated 3D Model</h3>
        
        {output.model_file && (
          <div className="output-item">
            <h4>3D Model</h4>
            <a href={output.model_file} target="_blank" rel="noopener noreferrer" className="download-link">
              Download 3D Model
            </a>
          </div>
        )}
        
        {output.combined_video && (
          <div className="output-item">
            <h4>Combined Video</h4>
            <video controls src={output.combined_video} className="output-video" />
          </div>
        )}
        
        {output.color_video && (
          <div className="output-item">
            <h4>Color Video</h4>
            <video controls src={output.color_video} className="output-video" />
          </div>
        )}
        
        {output.normal_video && (
          <div className="output-item">
            <h4>Normal Video</h4>
            <video controls src={output.normal_video} className="output-video" />
          </div>
        )}
        
        {output.gaussian_ply && (
          <div className="output-item">
            <h4>Gaussian PLY</h4>
            <a href={output.gaussian_ply} target="_blank" rel="noopener noreferrer" className="download-link">
              Download Gaussian PLY
            </a>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="ai-model-generator">
      <div className="generator-header">
        <h2>AI 3D Model Generator</h2>
        <p>Upload an image to generate a 3D model using the Trellis AI model</p>
      </div>
      
      <div className="generator-content">
        <div className="image-upload-section">
          <h3>1. Upload Image</h3>
          <div className="upload-area">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isGenerating}
            />
            <label htmlFor="image-upload" className={`upload-button ${isGenerating ? 'disabled' : ''}`}>
              Select Image
            </label>
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
        </div>
        
        <div className="model-params-section">
          <h3>2. Configure Parameters</h3>
          <div className="params-grid">
            <div className="param-group">
              <label htmlFor="texture_size">Texture Size:</label>
              <select
                id="texture_size"
                name="texture_size"
                value={modelParams.texture_size}
                onChange={handleParamChange}
                disabled={isGenerating}
              >
                <option value={512}>512</option>
                <option value={1024}>1024</option>
                <option value={2048}>2048</option>
              </select>
            </div>
            
            <div className="param-group">
              <label htmlFor="mesh_simplify">Mesh Simplify:</label>
              <input
                type="range"
                id="mesh_simplify"
                name="mesh_simplify"
                min="0.1"
                max="1.0"
                step="0.1"
                value={modelParams.mesh_simplify}
                onChange={handleParamChange}
                disabled={isGenerating}
              />
              <span className="param-value">{modelParams.mesh_simplify}</span>
            </div>
            
            <div className="param-group">
              <label htmlFor="ss_sampling_steps">Sampling Steps:</label>
              <input
                type="number"
                id="ss_sampling_steps"
                name="ss_sampling_steps"
                min="10"
                max="100"
                value={modelParams.ss_sampling_steps}
                onChange={handleParamChange}
                disabled={isGenerating}
              />
            </div>
            
            <div className="param-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="generate_model"
                  checked={modelParams.generate_model}
                  onChange={handleParamChange}
                  disabled={isGenerating}
                />
                Generate Model
              </label>
            </div>
            
            <div className="param-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="save_gaussian_ply"
                  checked={modelParams.save_gaussian_ply}
                  onChange={handleParamChange}
                  disabled={isGenerating}
                />
                Save Gaussian PLY
              </label>
            </div>
            
            <div className="param-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="randomize_seed"
                  checked={modelParams.randomize_seed}
                  onChange={handleParamChange}
                  disabled={isGenerating}
                />
                Randomize Seed
              </label>
            </div>
          </div>
        </div>
        
        <div className="generator-actions">
          <button
            className="generate-button"
            onClick={generateModel}
            disabled={!selectedImage || isGenerating || !ReplicateService.isConfigured()}
          >
            {isGenerating ? 'Generating...' : 'Generate 3D Model'}
          </button>
          
          {isGenerating && (
            <button className="cancel-button" onClick={cancelGeneration}>
              Cancel
            </button>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {generationStatus && (
          <div className="status-card">
            <h3>Generation Status</h3>
            <p>Status: <span className={`status-${generationStatus.status}`}>{generationStatus.status}</span></p>
            {generationStatus.error && <p className="error">Error: {generationStatus.error}</p>}
          </div>
        )}
        
        {renderModelOutput()}
      </div>
      
      <div className="generator-info">
        <h3>About This Tool</h3>
        <p>This tool uses the Trellis AI model to generate 3D models from images. The process may take several minutes to complete.</p>
        <h4>Tips:</h4>
        <ul>
          <li>Use images with clear subjects and simple backgrounds for best results</li>
          <li>Higher texture sizes produce better quality but take longer to generate</li>
          <li>Adjust mesh simplify to control the complexity of the 3D model</li>
        </ul>
      </div>
    </div>
  );
};

export default AIModelGenerator; 