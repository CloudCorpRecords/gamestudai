import React, { useState, useEffect, useRef } from 'react';
import { replicateService } from '../../services/ReplicateService';
import './AIModelGenerator.css';

// Default parameters for model generation
const DEFAULT_PARAMS = {
  guidance_scale: 7.5,
  num_inference_steps: 50,
  seed: Math.floor(Math.random() * 1000000),
};

const AIModelGenerator: React.FC = () => {
  // State for image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State for model generation parameters
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [guidanceScale, setGuidanceScale] = useState(DEFAULT_PARAMS.guidance_scale);
  const [steps, setSteps] = useState(DEFAULT_PARAMS.num_inference_steps);
  const [seed, setSeed] = useState(DEFAULT_PARAMS.seed);
  
  // State for API configuration and generation status
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generationOutput, setGenerationOutput] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Polling interval reference
  const pollingIntervalRef = useRef<number | null>(null);

  // Check if API is configured on mount
  useEffect(() => {
    setIsApiConfigured(replicateService.isConfigured());
    
    // Clean up polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle parameter changes
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value);
  const handleNegativePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setNegativePrompt(e.target.value);
  const handleGuidanceScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => setGuidanceScale(parseFloat(e.target.value));
  const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => setSteps(parseInt(e.target.value, 10));
  
  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeed(parseInt(e.target.value, 10));
  };
  
  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  // Reset all parameters
  const resetParameters = () => {
    setPrompt('');
    setNegativePrompt('');
    setGuidanceScale(DEFAULT_PARAMS.guidance_scale);
    setSteps(DEFAULT_PARAMS.num_inference_steps);
    setSeed(Math.floor(Math.random() * 1000000));
  };

  // Start model generation
  const startGeneration = async () => {
    if (!isApiConfigured) {
      setError('API key not configured. Please set your Replicate API key in Settings.');
      return;
    }
    
    if (!prompt.trim()) {
      setError('Please enter a prompt describing the 3D model you want to generate.');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setGenerationStatus('starting');
    setGenerationOutput(null);
    
    try {
      const response = await replicateService.createPrediction({
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim(),
        guidance_scale: guidanceScale,
        num_inference_steps: steps,
        seed: seed,
      });
      
      setGenerationId(response.id);
      setGenerationStatus(response.status);
      
      // Start polling for status updates
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
      }
      
      pollingIntervalRef.current = window.setInterval(async () => {
        if (!response.id) return;
        
        try {
          const status = await replicateService.getPrediction(response.id);
          setGenerationStatus(status.status);
          
          if (status.output) {
            setGenerationOutput(status.output);
          }
          
          if (status.error) {
            setError(status.error);
            setIsGenerating(false);
            if (pollingIntervalRef.current) {
              window.clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
          
          if (status.status === 'succeeded' || status.status === 'failed' || status.status === 'canceled') {
            setIsGenerating(false);
            if (pollingIntervalRef.current) {
              window.clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        } catch (err) {
          console.error('Error polling for status:', err);
          setError('Failed to check generation status');
          setIsGenerating(false);
          if (pollingIntervalRef.current) {
            window.clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }, 2000);
      
    } catch (err) {
      console.error('Error starting generation:', err);
      setError('Failed to start model generation');
      setIsGenerating(false);
    }
  };

  // Cancel generation
  const cancelGeneration = async () => {
    if (generationId && isGenerating) {
      try {
        await replicateService.cancelPrediction(generationId);
        setGenerationStatus('canceled');
        setIsGenerating(false);
        
        if (pollingIntervalRef.current) {
          window.clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } catch (err) {
        console.error('Error canceling generation:', err);
        setError('Failed to cancel generation');
      }
    }
  };

  // Render generation status
  const renderGenerationStatus = () => {
    if (!generationStatus) return null;
    
    let statusMessage = '';
    let statusClass = '';
    
    switch (generationStatus) {
      case 'starting':
        statusMessage = 'Starting model generation...';
        statusClass = 'status-starting';
        break;
      case 'processing':
        statusMessage = 'Generating 3D model...';
        statusClass = 'status-processing';
        break;
      case 'succeeded':
        statusMessage = 'Model generation completed successfully!';
        statusClass = 'status-success';
        break;
      case 'failed':
        statusMessage = 'Model generation failed.';
        statusClass = 'status-error';
        break;
      case 'canceled':
        statusMessage = 'Model generation was canceled.';
        statusClass = 'status-canceled';
        break;
      default:
        statusMessage = `Status: ${generationStatus}`;
        statusClass = 'status-processing';
    }
    
    return (
      <div className={`generation-status ${statusClass}`}>
        <h3>{statusMessage}</h3>
        
        {generationStatus === 'processing' && (
          <div className="progress-bar">
            <div className="progress-bar-inner"></div>
          </div>
        )}
        
        {generationOutput && generationOutput.length > 0 && (
          <div className="generation-output">
            <h4>Generated Model:</h4>
            <div className="model-preview">
              {generationOutput.map((url, index) => (
                <div key={index} className="model-result">
                  <img src={url} alt={`Generated model view ${index + 1}`} />
                  <a href={url} target="_blank" rel="noopener noreferrer" className="download-link">
                    View Full Size
                  </a>
                </div>
              ))}
            </div>
            <p className="output-note">
              To use this model in your game, download the images and import them into the Asset Manager.
            </p>
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  };

  return (
    <div className="ai-model-generator">
      <div className="generator-header">
        <h2>AI 3D Model Generator</h2>
        <p>Generate 3D models from text descriptions using AI</p>
      </div>
      
      {!isApiConfigured && (
        <div className="api-warning">
          <p>
            <strong>API Key Required:</strong> To use the AI Model Generator, you need to configure your Replicate API key in the Settings.
          </p>
        </div>
      )}
      
      <div className="generator-content">
        <div className="model-params-section">
          <h3>Model Parameters</h3>
          
          <div className="param-group">
            <label htmlFor="prompt">Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Describe the 3D model you want to generate..."
              disabled={isGenerating}
              rows={4}
            />
          </div>
          
          <div className="param-group">
            <label htmlFor="negative-prompt">Negative Prompt (Optional)</label>
            <textarea
              id="negative-prompt"
              value={negativePrompt}
              onChange={handleNegativePromptChange}
              placeholder="Describe what you don't want in the model..."
              disabled={isGenerating}
              rows={2}
            />
          </div>
          
          <div className="param-group">
            <label htmlFor="guidance-scale">
              Guidance Scale: {guidanceScale}
            </label>
            <input
              id="guidance-scale"
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={guidanceScale}
              onChange={handleGuidanceScaleChange}
              disabled={isGenerating}
            />
            <span className="param-hint">Higher values make the model follow the prompt more closely</span>
          </div>
          
          <div className="param-group">
            <label htmlFor="steps">
              Inference Steps: {steps}
            </label>
            <input
              id="steps"
              type="range"
              min="20"
              max="100"
              step="1"
              value={steps}
              onChange={handleStepsChange}
              disabled={isGenerating}
            />
            <span className="param-hint">Higher values may produce better quality but take longer</span>
          </div>
          
          <div className="param-group">
            <label htmlFor="seed">Seed</label>
            <div className="seed-input">
              <input
                id="seed"
                type="number"
                value={seed}
                onChange={handleSeedChange}
                disabled={isGenerating}
              />
              <button 
                onClick={generateRandomSeed}
                disabled={isGenerating}
                className="random-seed-button"
              >
                Random
              </button>
            </div>
            <span className="param-hint">Same seed produces similar results with the same prompt</span>
          </div>
          
          <div className="action-buttons">
            <button
              className="generate-button"
              onClick={startGeneration}
              disabled={isGenerating || !isApiConfigured || !prompt.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate 3D Model'}
            </button>
            
            {isGenerating && (
              <button
                className="cancel-button"
                onClick={cancelGeneration}
              >
                Cancel Generation
              </button>
            )}
            
            <button
              className="reset-button"
              onClick={resetParameters}
              disabled={isGenerating}
            >
              Reset Parameters
            </button>
          </div>
        </div>
        
        <div className="generation-results-section">
          {renderGenerationStatus()}
        </div>
      </div>
    </div>
  );
};

export default AIModelGenerator; 