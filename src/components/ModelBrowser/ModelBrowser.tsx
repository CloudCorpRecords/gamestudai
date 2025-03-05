import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '../AssetManager/AssetManager';
import { ModelRepositoryService, RepositoryModel } from '../../services/ModelRepositoryService';
import { ModelLoaderService } from '../../services/ModelLoaderService';
import './ModelBrowser.css';

interface ModelBrowserProps {
  onImportModel: (asset: Asset) => void;
  onClose: () => void;
}

const ModelBrowser: React.FC<ModelBrowserProps> = ({ onImportModel, onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RepositoryModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<RepositoryModel | null>(null);
  const [importingModel, setImportingModel] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [comparedModels, setComparedModels] = useState<RepositoryModel[]>([]);
  
  // Initialize services
  const modelRepositoryService = ModelRepositoryService.getInstance();
  const modelLoaderService = ModelLoaderService.getInstance();
  
  // Search for models when the query changes
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      }
    }, 500);
    
    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);
  
  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) return;
    
    setIsLoading(true);
    setSearchResults([]);
    setSelectedModel(null);
    
    try {
      const results = await modelRepositoryService.searchModels(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching models:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle model selection
  const handleSelectModel = (model: RepositoryModel) => {
    setSelectedModel(model);
  };
  
  // Handle model import
  const handleImportModel = async (model: RepositoryModel) => {
    if (importingModel) return;
    
    setImportingModel(model.id);
    
    try {
      // Import the model
      const importResult = await modelRepositoryService.importModel(model.id);
      
      if (!importResult.success) {
        throw new Error(importResult.message || 'Failed to import model');
      }
      
      // Create a URL for the model
      const modelUrl = model.url;
      
      // Load the model to generate thumbnail and metadata
      const loadedModel = await modelLoaderService.loadModel(modelUrl);
      const thumbnail = await modelLoaderService.generateThumbnail(loadedModel);
      const metadata = modelLoaderService.getModelMetadata(loadedModel);
      
      // Create an asset
      const asset: Asset = {
        id: model.id,
        name: model.name,
        type: AssetType.MODEL,
        url: modelUrl,
        thumbnail,
        metadata: {
          format: model.format || getModelFormat(model),
          vertices: metadata.vertexCount,
          faces: metadata.faceCount,
          materials: metadata.materialCount,
          dimensions: metadata.boundingBox,
          source: model.source,
          author: model.author,
          license: model.license
        },
        createdAt: new Date()
      };
      
      // Pass the asset to the parent component
      onImportModel(asset);
      
      // Close the browser
      onClose();
    } catch (error) {
      console.error('Error importing model:', error);
      alert(`Failed to import model: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setImportingModel(null);
    }
  };
  
  // Filter results by format
  const filteredResults = searchResults.filter(model => {
    if (formatFilter === 'all') return true;
    
    // Check if the model name or tags contain the format
    const nameContainsFormat = model.name.toLowerCase().includes(formatFilter.toLowerCase());
    const tagsContainFormat = model.tags?.some(tag => tag.toLowerCase() === formatFilter.toLowerCase());
    
    return nameContainsFormat || tagsContainFormat;
  });
  
  // Get unique formats from search results
  const getUniqueFormats = () => {
    const formats = new Set<string>(['all']);
    
    searchResults.forEach(model => {
      // Extract format from model name (e.g., "Model (GLB)" -> "glb")
      const formatMatch = model.name.match(/\(([^)]+)\)/);
      if (formatMatch && formatMatch[1]) {
        formats.add(formatMatch[1].toLowerCase());
      }
      
      // Extract formats from tags
      model.tags?.forEach(tag => {
        if (['glb', 'gltf', 'fbx', 'obj', 'stl', 'dae', 'ply', 'pbn', '3ds', 'usdz', 'wrl', 'vrml'].includes(tag.toLowerCase())) {
          formats.add(tag.toLowerCase());
        }
      });
    });
    
    return Array.from(formats);
  };
  
  // Helper function to get format from model
  const getModelFormat = (model: RepositoryModel): string => {
    // Extract format from model name (e.g., "Model (GLB)" -> "GLB")
    const formatMatch = model.name.match(/\(([^)]+)\)/);
    if (formatMatch && formatMatch[1]) {
      return formatMatch[1];
    }
    
    // Look for format in tags
    const formatTag = model.tags?.find(tag => 
      ['glb', 'gltf', 'fbx', 'obj', 'stl', 'dae', 'ply', 'pbn', '3ds', 'usdz', 'wrl', 'vrml'].includes(tag.toLowerCase())
    );
    
    if (formatTag) {
      return formatTag.toUpperCase();
    }
    
    return 'Unknown';
  };
  
  // Toggle model comparison
  const toggleCompareMode = () => {
    setCompareMode(prev => !prev);
    if (compareMode) {
      // Exit compare mode
      setComparedModels([]);
    }
  };
  
  // Add/remove model from comparison
  const toggleModelComparison = (model: RepositoryModel, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection
    
    setComparedModels(prev => {
      const isAlreadyCompared = prev.some(m => m.id === model.id);
      
      if (isAlreadyCompared) {
        // Remove from comparison
        return prev.filter(m => m.id !== model.id);
      } else {
        // Add to comparison (limit to 3 models)
        if (prev.length >= 3) {
          alert('You can compare up to 3 models at a time.');
          return prev;
        }
        return [...prev, model];
      }
    });
  };
  
  // Check if a model is in comparison
  const isModelCompared = (model: RepositoryModel): boolean => {
    return comparedModels.some(m => m.id === model.id);
  };
  
  return (
    <div className="model-browser">
      <div className="model-browser-header">
        <h2>Browse 3D Models</h2>
        <div className="browser-controls">
          <button 
            className={`compare-toggle ${compareMode ? 'active' : ''}`}
            onClick={toggleCompareMode}
          >
            {compareMode ? 'Exit Compare' : 'Compare Models'}
          </button>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for 3D models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        
        {searchResults.length > 0 && (
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="format-filter"
          >
            <option value="all">All Formats</option>
            {getUniqueFormats().filter(f => f !== 'all').map(format => (
              <option key={format} value={format}>{format.toUpperCase()}</option>
            ))}
          </select>
        )}
        
        <button 
          className="search-button"
          onClick={handleSearch}
          disabled={searchQuery.trim().length < 3 || isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div className="model-results">
        {isLoading ? (
          <div className="loading-message">Searching for models...</div>
        ) : searchResults.length === 0 ? (
          <div className="empty-message">
            {searchQuery.trim().length > 0 
              ? 'No models found. Try a different search term.' 
              : 'Enter a search term to find 3D models.'}
          </div>
        ) : (
          <>
            {/* Model comparison view */}
            {compareMode && comparedModels.length > 0 && (
              <div className="model-comparison">
                <h3>Model Comparison</h3>
                <div className="comparison-grid">
                  {comparedModels.map(model => (
                    <div key={model.id} className="comparison-item">
                      <div className="comparison-thumbnail">
                        <img src={model.thumbnail} alt={model.name} />
                        <div className="model-source">{model.source}</div>
                        <div className="model-format">{getModelFormat(model)}</div>
                      </div>
                      <div className="comparison-info">
                        <h4>{model.name}</h4>
                        {model.author && <div className="model-author">by {model.author}</div>}
                        
                        <div className="comparison-specs">
                          {model.vertexCount && (
                            <div className="spec-item">
                              <span className="spec-label">Vertices:</span>
                              <span className="spec-value">{model.vertexCount.toLocaleString()}</span>
                            </div>
                          )}
                          {model.faceCount && (
                            <div className="spec-item">
                              <span className="spec-label">Faces:</span>
                              <span className="spec-value">{model.faceCount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="spec-item">
                            <span className="spec-label">License:</span>
                            <span className="spec-value">{model.license || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        <button 
                          className="import-button"
                          onClick={() => handleImportModel(model)}
                          disabled={importingModel === model.id}
                        >
                          {importingModel === model.id ? 'Importing...' : 'Import Model'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular model grid */}
            {(!compareMode || comparedModels.length === 0) ? (
              <div className="model-grid">
                {filteredResults.map(model => (
                  <div 
                    key={model.id}
                    className={`model-item ${selectedModel?.id === model.id ? 'selected' : ''}`}
                    onClick={() => handleSelectModel(model)}
                  >
                    <div className="model-thumbnail">
                      <img src={model.thumbnail} alt={model.name} />
                      <div className="model-source">{model.source}</div>
                      <div className="model-format">{getModelFormat(model)}</div>
                      
                      {/* Add comparison toggle button */}
                      {compareMode && (
                        <button 
                          className={`compare-toggle-btn ${isModelCompared(model) ? 'active' : ''}`}
                          onClick={(e) => toggleModelComparison(model, e)}
                        >
                          {isModelCompared(model) ? '✓' : '+'}
                        </button>
                      )}
                    </div>
                    <div className="model-info">
                      <div className="model-name">{model.name}</div>
                      {model.author && <div className="model-author">by {model.author}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
      
      {selectedModel && (
        <div className="model-details">
          <h3>{selectedModel.name}</h3>
          
          {selectedModel.description && (
            <p className="model-description">{selectedModel.description}</p>
          )}
          
          <div className="model-metadata">
            {selectedModel.author && (
              <div className="metadata-item">
                <span className="metadata-label">Author:</span>
                <span>{selectedModel.author}</span>
              </div>
            )}
            
            {selectedModel.license && (
              <div className="metadata-item">
                <span className="metadata-label">License:</span>
                <span>{selectedModel.license}</span>
              </div>
            )}
            
            <div className="metadata-item">
              <span className="metadata-label">Source:</span>
              <span>{selectedModel.source}</span>
            </div>
          </div>
          
          {selectedModel.tags && selectedModel.tags.length > 0 && (
            <div className="model-tags">
              {selectedModel.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
          
          <button
            className="import-button"
            onClick={() => handleImportModel(selectedModel)}
            disabled={!!importingModel}
          >
            {importingModel === selectedModel.id ? 'Importing...' : 'Import Model'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ModelBrowser; 