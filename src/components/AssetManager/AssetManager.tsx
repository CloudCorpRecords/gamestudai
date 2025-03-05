import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import { ModelLoaderService } from '../../services/ModelLoaderService';
import ModelPreview from '../ModelPreview/ModelPreview';
import ModelBrowser from '../ModelBrowser/ModelBrowser';
import ModelInfo from '../ModelInfo/ModelInfo';
import ModelViewer from '../ModelViewer/ModelViewer';
import './AssetManager.css';

// Asset types supported by the engine
export enum AssetType {
  MODEL = 'model',
  TEXTURE = 'texture',
  AUDIO = 'audio',
  SCRIPT = 'script',
  PREFAB = 'prefab',
  MATERIAL = 'material',
  AI_PROMPT = 'ai_prompt',
}

// Interface for an asset
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  file?: File;
  url?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  aiGenerated?: boolean;
  modelData?: any; // For storing loaded 3D model data
}

// Interface for the props
interface AssetManagerProps {
  onSelectAsset?: (asset: Asset) => void;
}

// Sample initial assets
const initialAssets: Asset[] = [
  {
    id: 'model-cube',
    name: 'Cube',
    type: AssetType.MODEL,
    url: '/assets/models/cube.glb',
    thumbnail: '/assets/thumbnails/cube.png',
    createdAt: new Date(),
  },
  {
    id: 'model-sphere',
    name: 'Sphere',
    type: AssetType.MODEL,
    url: '/assets/models/sphere.glb',
    thumbnail: '/assets/thumbnails/sphere.png',
    createdAt: new Date(),
  },
  {
    id: 'texture-wood',
    name: 'Wood',
    type: AssetType.TEXTURE,
    url: '/assets/textures/wood.jpg',
    thumbnail: '/assets/textures/wood.jpg',
    createdAt: new Date(),
  },
  {
    id: 'texture-metal',
    name: 'Metal',
    type: AssetType.TEXTURE,
    url: '/assets/textures/metal.jpg',
    thumbnail: '/assets/textures/metal.jpg',
    createdAt: new Date(),
  },
  {
    id: 'audio-beep',
    name: 'Beep',
    type: AssetType.AUDIO,
    url: '/assets/audio/beep.mp3',
    createdAt: new Date(),
  },
  {
    id: 'ai-model-tree',
    name: 'AI Tree',
    type: AssetType.MODEL,
    url: '/assets/models/tree.glb',
    thumbnail: '/assets/thumbnails/tree.png',
    aiGenerated: true,
    createdAt: new Date(),
  },
  {
    id: 'ai-prompt-fantasy',
    name: 'Fantasy Theme',
    type: AssetType.AI_PROMPT,
    metadata: {
      prompt: 'A fantasy world with castles and dragons',
      parameters: { style: 'vibrant', complexity: 'high' }
    },
    aiGenerated: true,
    createdAt: new Date(),
  },
];

// Main AssetManager component
const AssetManager: React.FC<AssetManagerProps> = ({ onSelectAsset }) => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateAIAssetOpen, setIsCreateAIAssetOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supportedFormats, setSupportedFormats] = useState<string[]>([]);
  const [isModelBrowserOpen, setIsModelBrowserOpen] = useState(false);
  const [isModelInfoOpen, setIsModelInfoOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [previewRotation, setPreviewRotation] = useState<[number, number, number]>([0, 0, 0]);
  const previewRef = useRef<HTMLDivElement>(null);
  const modelLoaderService = ModelLoaderService.getInstance();
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchAction, setBatchAction] = useState<string>('');
  
  // Initialize supported formats
  useEffect(() => {
    // Define supported formats
    const formats = [
      'glb', 'gltf', 'fbx', 'obj', 'stl', 'dae', 'ply', 'pbn', '3ds', 'usdz', 'wrl', 'vrml'
    ];
    
    // Set supported formats
    setSupportedFormats(formats);
  }, []);
  
  // Get supported 3D formats
  const getFormattedSupportedFormats = () => {
    const formats = [
      'GLB', 'GLTF', 'FBX', 'OBJ', 'STL', 'DAE', 'PLY', 'PBN', '3DS', 'USDZ', 'WRL', 'VRML'
    ];
    
    return formats.map(format => ({
      extension: format.toLowerCase(),
      description: getFormatDescription(format.toLowerCase())
    }));
  };
  
  // Get format description
  const getFormatDescription = (extension: string): string => {
    const formatMap: Record<string, string> = {
      'glb': 'GLB (Binary glTF)',
      'gltf': 'glTF (GL Transmission Format)',
      'fbx': 'FBX (Filmbox)',
      'obj': 'OBJ (Wavefront)',
      'stl': 'STL (Stereolithography)',
      'dae': 'DAE (Collada)',
      'ply': 'PLY (Polygon File Format)',
      'pbn': 'PBN (Point-Based Normals)',
      '3ds': '3DS (3D Studio)',
      'usdz': 'USDZ (Universal Scene Description)',
      'wrl': 'VRML (Virtual Reality Modeling Language)',
      'vrml': 'VRML (Virtual Reality Modeling Language)'
    };
    
    return formatMap[extension] || extension.toUpperCase();
  };
  
  // Filter assets based on type, format, and search query
  const filteredAssets = assets.filter(asset => 
    (selectedType === 'all' || asset.type === selectedType) &&
    (selectedFormat === 'all' || 
      (asset.file?.name.toLowerCase().endsWith(`.${selectedFormat}`) || 
       asset.metadata?.format?.toLowerCase().includes(selectedFormat.toLowerCase()))) &&
    (searchQuery === '' || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (asset.metadata?.prompt && asset.metadata.prompt.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  // Get unique formats from assets
  const getUniqueFormats = () => {
    const formats = new Set<string>();
    formats.add('all');
    
    assets.forEach(asset => {
      if (asset.type === AssetType.MODEL) {
        const ext = asset.file?.name.split('.').pop()?.toLowerCase();
        if (ext) formats.add(ext);
        
        if (asset.metadata?.format) {
          const format = asset.metadata.format.toLowerCase();
          if (format.includes('glb')) formats.add('glb');
          else if (format.includes('gltf')) formats.add('gltf');
          else if (format.includes('fbx')) formats.add('fbx');
          else if (format.includes('obj')) formats.add('obj');
          else if (format.includes('stl')) formats.add('stl');
          else if (format.includes('dae')) formats.add('dae');
          else if (format.includes('ply')) formats.add('ply');
          else if (format.includes('pbn')) formats.add('pbn');
        }
      }
    });
    
    return Array.from(formats);
  };
  
  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    
    try {
      for (const file of acceptedFiles) {
        try {
          // Determine asset type based on file extension
          const extension = file.name.split('.').pop()?.toLowerCase() || '';
          let type = AssetType.MODEL;
          
          // Check file type
          if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
            type = AssetType.TEXTURE;
          } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
            type = AssetType.AUDIO;
          } else if (['js', 'ts', 'json'].includes(extension)) {
            type = AssetType.SCRIPT;
          } else if (['glb', 'gltf', 'fbx', 'obj', 'stl', 'dae', 'ply', 'pbn', '3ds', 'usdz', 'wrl', 'vrml'].includes(extension)) {
            type = AssetType.MODEL;
          } else {
            // Skip unsupported file types
            console.warn(`Unsupported file type: ${extension}`);
            continue;
          }
          
          // Create asset object
          const asset: Asset = {
            id: uuidv4(),
            name: file.name,
            type,
            file,
            url: URL.createObjectURL(file),
            thumbnail: type === AssetType.TEXTURE ? URL.createObjectURL(file) : undefined,
            metadata: {
              fileSize: file.size,
              format: extension.toUpperCase(),
            },
            createdAt: new Date()
          };
          
          // If it's a 3D model, validate and load it
          if (type === AssetType.MODEL) {
            // Validate model file
            const validationError = validateModelFile(file);
            if (validationError) {
              console.error(validationError);
              continue;
            }
            
            try {
              // Load the model
              const model = await modelLoaderService.loadModel(asset.url || '');
              
              // Generate thumbnail
              const thumbnail = await modelLoaderService.generateThumbnail(model);
              asset.thumbnail = thumbnail;
              
              // Get model metadata
              const metadata = modelLoaderService.getModelMetadata(model);
              asset.metadata = {
                ...asset.metadata,
                format: getFormatDescription(extension),
                vertices: metadata.vertexCount,
                faces: metadata.faceCount,
                materials: metadata.materialCount,
                dimensions: metadata.boundingBox
              };
            } catch (error) {
              console.error('Error loading model:', error);
            }
          }
          
          // Add asset to state
          setAssets(prev => [...prev, asset]);
          
          // Select the newly added asset
          setSelectedAsset(asset);
          
          // Notify parent component if callback provided
          if (onSelectAsset) {
            onSelectAsset(asset);
          }
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSelectAsset]);
  
  // Validate model file
  const validateModelFile = (file: File): string | null => {
    // Check file size (100MB limit)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }
    
    return null;
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'application/octet-stream': ['.fbx', '.obj', '.stl', '.dae', '.ply', '.pbn', '.3ds', '.usdz', '.wrl', '.vrml'],
    }
  });
  
  // Handle asset selection with multi-select support
  const handleSelectAsset = (asset: Asset, isMultiSelect: boolean = false) => {
    setSelectedAsset(asset);
    
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
    
    // Handle multi-select
    if (isMultiSelect) {
      setSelectedAssets(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(asset.id)) {
          newSelection.delete(asset.id);
        } else {
          newSelection.add(asset.id);
        }
        return newSelection;
      });
    } else {
      // Single select - clear other selections
      setSelectedAssets(new Set([asset.id]));
    }
  };
  
  // Handle batch processing
  const handleBatchProcess = (action: string) => {
    if (selectedAssets.size === 0) return;
    
    setIsBatchProcessing(true);
    setBatchAction(action);
    
    try {
      switch (action) {
        case 'delete':
          // Delete selected assets
          setAssets(prev => prev.filter(asset => !selectedAssets.has(asset.id)));
          setSelectedAsset(null);
          setSelectedAssets(new Set());
          break;
          
        case 'export':
          // Export selected assets
          const selectedAssetsList = assets.filter(asset => selectedAssets.has(asset.id));
          const exportData = {
            assets: selectedAssetsList.map(asset => ({
              id: asset.id,
              name: asset.name,
              type: asset.type,
              metadata: asset.metadata,
              url: asset.url
            }))
          };
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          saveAs(blob, 'assets-export.json');
          break;
          
        case 'optimize':
          // Optimize selected models (placeholder for actual optimization)
          console.log('Optimizing models:', selectedAssets);
          // In a real implementation, you would process each model
          break;
          
        default:
          console.warn('Unknown batch action:', action);
      }
    } finally {
      setIsBatchProcessing(false);
      setBatchAction('');
    }
  };
  
  // Delete an asset
  const handleDeleteAsset = (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Revoke object URLs to prevent memory leaks
    const assetToDelete = assets.find(asset => asset.id === assetId);
    if (assetToDelete?.url) {
      URL.revokeObjectURL(assetToDelete.url);
    }
    if (assetToDelete?.thumbnail && assetToDelete.type !== AssetType.TEXTURE) {
      URL.revokeObjectURL(assetToDelete.thumbnail);
    }
    
    setAssets(assets.filter(asset => asset.id !== assetId));
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(null);
    }
  };
  
  // Handle AI asset creation (simplified mock version)
  const handleCreateAIAsset = () => {
    if (!aiPrompt) return;
    
    // In a real app, this would call an AI service to generate the asset
    const newAsset: Asset = {
      id: `ai-prompt-${Date.now()}`,
      name: `AI: ${aiPrompt.slice(0, 20)}${aiPrompt.length > 20 ? '...' : ''}`,
      type: AssetType.AI_PROMPT,
      metadata: {
        prompt: aiPrompt,
        parameters: { style: 'default', complexity: 'medium' }
      },
      aiGenerated: true,
      createdAt: new Date(),
    };
    
    setAssets(prev => [newAsset, ...prev]);
    setAiPrompt('');
    setIsCreateAIAssetOpen(false);
    
    // Show success message
    alert('AI asset created! In a full implementation, this would generate a real asset.');
  };
  
  // Export assets as a JSON file
  const handleExportAssets = () => {
    const exportData = {
      assets: assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        metadata: asset.metadata,
        aiGenerated: asset.aiGenerated,
        createdAt: asset.createdAt.toISOString(),
      })),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    saveAs(blob, 'gamestudai-assets.json');
  };
  
  // Handle importing a model from the model browser
  const handleImportModel = (asset: Asset) => {
    setAssets(prev => [asset, ...prev]);
    setSelectedAsset(asset);
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };
  
  // Helper function to get the file extension from an asset
  const getFileExtension = (asset: Asset): string => {
    if (asset.file) {
      return asset.file.name.split('.').pop()?.toLowerCase() || '';
    }
    
    if (asset.url) {
      return asset.url.split('.').pop()?.toLowerCase() || '';
    }
    
    return '';
  };
  
  // Helper function to get a format icon
  const getFormatIcon = (asset: Asset): string => {
    const ext = getFileExtension(asset);
    
    if (ext === 'glb' || ext === 'gltf') return '📦';
    if (ext === 'fbx') return '🔄';
    if (ext === 'obj') return '🧊';
    if (ext === 'stl') return '🖨️';
    if (ext === 'dae') return '🌐';
    if (ext === 'ply' || ext === 'pbn') return '📊';
    if (ext === '3ds') return '🏗️';
    if (ext === 'usdz') return '📱';
    if (ext === 'wrl' || ext === 'vrml') return '🌍';
    
    return '';
  };
  
  // Function to handle model preview rotation
  const handlePreviewRotation = (axis: 'x' | 'y' | 'z', value: number) => {
    setPreviewRotation(prev => {
      const newRotation = [...prev] as [number, number, number];
      if (axis === 'x') newRotation[0] = value;
      if (axis === 'y') newRotation[1] = value;
      if (axis === 'z') newRotation[2] = value;
      return newRotation;
    });
  };

  // Reset preview rotation when selecting a new asset
  useEffect(() => {
    setPreviewRotation([0, 0, 0]);
  }, [selectedAsset?.id]);
  
  return (
    <div className="asset-manager">
      <div className="asset-manager-header">
        <h2>Asset Manager</h2>
        <div className="asset-controls">
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value as AssetType | 'all')}
            className="asset-type-filter"
          >
            <option value="all">All Assets</option>
            <option value={AssetType.MODEL}>3D Models</option>
            <option value={AssetType.TEXTURE}>Textures</option>
            <option value={AssetType.AUDIO}>Audio</option>
            <option value={AssetType.SCRIPT}>Scripts</option>
            <option value={AssetType.PREFAB}>Prefabs</option>
            <option value={AssetType.MATERIAL}>Materials</option>
            <option value={AssetType.AI_PROMPT}>AI Prompts</option>
          </select>
          
          {selectedType === AssetType.MODEL && (
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="format-filter"
            >
              <option value="all">All Formats</option>
              {supportedFormats.map(format => (
                <option key={format} value={format}>{format.toUpperCase()}</option>
              ))}
            </select>
          )}
          
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="asset-search"
          />
        </div>
      </div>
      
      <div className="asset-manager-content">
        <div className="asset-grid">
          {filteredAssets.map(asset => (
            <div 
              key={asset.id}
              className={`asset-item ${selectedAsset?.id === asset.id ? 'selected' : ''} ${
                selectedAssets.has(asset.id) ? 'multi-selected' : ''
              } ${asset.aiGenerated ? 'ai-generated' : ''} ${
                asset.metadata?.loadError ? 'load-error' : ''
              }`}
              onClick={() => handleSelectAsset(asset)}
              onContextMenu={(e) => {
                e.preventDefault();
                // Show context menu
              }}
              onKeyDown={(e) => {
                if (e.key === 'Control' || e.key === 'Meta') {
                  handleSelectAsset(asset, true);
                }
              }}
            >
              {asset.thumbnail ? (
                <div className="asset-thumbnail">
                  <img src={asset.thumbnail} alt={asset.name} />
                  {asset.type === AssetType.MODEL && (
                    <div className="format-icon" title={`${getFileExtension(asset).toUpperCase()} format`}>
                      {getFormatIcon(asset)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="asset-icon">
                  {asset.type === AssetType.MODEL && <div className="icon model-icon">{getFormatIcon(asset)}</div>}
                  {asset.type === AssetType.TEXTURE && <div className="icon texture-icon">🖼️</div>}
                  {asset.type === AssetType.AUDIO && <div className="icon audio-icon">🔊</div>}
                  {asset.type === AssetType.SCRIPT && <div className="icon script-icon">📜</div>}
                  {asset.type === AssetType.PREFAB && <div className="icon prefab-icon">🧩</div>}
                  {asset.type === AssetType.MATERIAL && <div className="icon material-icon">🎨</div>}
                  {asset.type === AssetType.AI_PROMPT && <div className="icon ai-prompt-icon">🤖</div>}
                </div>
              )}
              <div className="asset-info">
                <div className="asset-name">{asset.name}</div>
                <div className="asset-type">
                  {asset.type}
                  {asset.type === AssetType.MODEL && getFileExtension(asset) && (
                    <span className="asset-format">.{getFileExtension(asset)}</span>
                  )}
                </div>
                {asset.metadata?.loadError && (
                  <div className="asset-error" title={asset.metadata.loadError}>Load Error</div>
                )}
              </div>
              <button 
                className="delete-asset" 
                onClick={(e) => handleDeleteAsset(asset.id, e)}
              >
                ✕
              </button>
              {asset.aiGenerated && <div className="ai-badge">AI</div>}
              {asset.metadata?.modelInfo && <div className="model-badge">3D</div>}
              <div className="asset-selection-indicator">
                <input 
                  type="checkbox" 
                  checked={selectedAssets.has(asset.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectAsset(asset, true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="asset-actions">
          <div 
            {...getRootProps()} 
            className={`dropzone ${isDragActive ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
          >
            <input {...getInputProps()} />
            {isLoading ? (
              <p>Loading assets...</p>
            ) : isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p>Drag & drop assets here, or click to select files</p>
                <p className="supported-formats">
                  Supported 3D formats: {supportedFormats.map((format, index) => (
                    <span key={format} className="format-badge">
                      {format.toUpperCase()}
                      {index < supportedFormats.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  <button 
                    className="info-button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModelInfoOpen(true);
                    }}
                    title="Learn more about 3D model formats"
                  >
                    ℹ️
                  </button>
                </p>
                <p className="format-tip">
                  <strong>Tip:</strong> For best results, use GLB files as they are self-contained and don't require external resources.
                </p>
              </div>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              className="browse-models-btn"
              onClick={() => setIsModelBrowserOpen(true)}
            >
              🔍 Browse 3D Models
            </button>
            
            <button 
              className="create-ai-asset-btn"
              onClick={() => setIsCreateAIAssetOpen(!isCreateAIAssetOpen)}
            >
              🤖 Generate with AI
            </button>
            
            <button 
              className="export-assets-btn"
              onClick={handleExportAssets}
            >
              📤 Export Assets
            </button>
          </div>
        </div>
        
        {isCreateAIAssetOpen && (
          <div className="ai-asset-creator">
            <h3>Generate Asset with AI</h3>
            <textarea
              placeholder="Describe the asset you want to create..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="ai-asset-actions">
              <button onClick={() => setIsCreateAIAssetOpen(false)}>Cancel</button>
              <button 
                className="create-btn"
                onClick={handleCreateAIAsset}
                disabled={!aiPrompt}
              >
                Generate
              </button>
            </div>
          </div>
        )}
        
        {/* Batch processing controls */}
        {selectedAssets.size > 1 && (
          <div className="batch-controls">
            <div className="batch-info">
              {selectedAssets.size} assets selected
            </div>
            <div className="batch-actions">
              <button 
                className="batch-action-btn delete"
                onClick={() => handleBatchProcess('delete')}
                disabled={isBatchProcessing}
              >
                Delete Selected
              </button>
              <button 
                className="batch-action-btn export"
                onClick={() => handleBatchProcess('export')}
                disabled={isBatchProcessing}
              >
                Export Selected
              </button>
              {/* Only show optimize button if all selected assets are models */}
              {Array.from(selectedAssets).every(id => 
                assets.find(a => a.id === id)?.type === AssetType.MODEL
              ) && (
                <button 
                  className="batch-action-btn optimize"
                  onClick={() => handleBatchProcess('optimize')}
                  disabled={isBatchProcessing}
                >
                  Optimize Models
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {selectedAsset && (
        <div className="asset-details">
          <h3>Asset Details</h3>
          
          {selectedAsset.type === AssetType.MODEL && selectedAsset.url && (
            <div className="model-preview-container">
              <div className="model-preview" ref={previewRef}>
                <ModelViewer 
                  modelUrl={selectedAsset.url} 
                  rotation={previewRotation}
                  width={300}
                  height={300}
                />
              </div>
              <div className="model-controls">
                <div className="rotation-controls">
                  <label>
                    X Rotation:
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={previewRotation[0]} 
                      onChange={(e) => handlePreviewRotation('x', parseInt(e.target.value))}
                    />
                  </label>
                  <label>
                    Y Rotation:
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={previewRotation[1]} 
                      onChange={(e) => handlePreviewRotation('y', parseInt(e.target.value))}
                    />
                  </label>
                  <label>
                    Z Rotation:
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={previewRotation[2]} 
                      onChange={(e) => handlePreviewRotation('z', parseInt(e.target.value))}
                    />
                  </label>
                </div>
                <button 
                  className="reset-view-btn"
                  onClick={() => setPreviewRotation([0, 0, 0])}
                >
                  Reset View
                </button>
              </div>
            </div>
          )}
          
          <div className="asset-properties">
            <div className="property">
              <span className="property-label">Name:</span>
              <span>{selectedAsset.name}</span>
            </div>
            <div className="property">
              <span className="property-label">Type:</span>
              <span>{selectedAsset.type}</span>
            </div>
            {selectedAsset.type === AssetType.MODEL && selectedAsset.metadata && (
              <>
                <div className="property">
                  <span className="property-label">Format:</span>
                  <span>{selectedAsset.metadata.format || getFileExtension(selectedAsset).toUpperCase()}</span>
                </div>
                {selectedAsset.metadata.vertices && (
                  <div className="property">
                    <span className="property-label">Vertices:</span>
                    <span>{selectedAsset.metadata.vertices.toLocaleString()}</span>
                  </div>
                )}
                {selectedAsset.metadata.faces && (
                  <div className="property">
                    <span className="property-label">Faces:</span>
                    <span>{selectedAsset.metadata.faces.toLocaleString()}</span>
                  </div>
                )}
                {selectedAsset.metadata.materials && (
                  <div className="property">
                    <span className="property-label">Materials:</span>
                    <span>{selectedAsset.metadata.materials}</span>
                  </div>
                )}
                {selectedAsset.metadata.dimensions && (
                  <div className="property">
                    <span className="property-label">Dimensions:</span>
                    <span>
                      {selectedAsset.metadata.dimensions.width.toFixed(2)} x {selectedAsset.metadata.dimensions.height.toFixed(2)} x {selectedAsset.metadata.dimensions.depth.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedAsset.metadata.fileSize && (
                  <div className="property">
                    <span className="property-label">File Size:</span>
                    <span>{(selectedAsset.metadata.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                )}
              </>
            )}
            {selectedAsset.aiGenerated && selectedAsset.metadata?.prompt && (
              <div className="property prompt">
                <span className="property-label">AI Prompt:</span>
                <span>{selectedAsset.metadata.prompt}</span>
              </div>
            )}
            <div className="property">
              <span className="property-label">Created:</span>
              <span>{selectedAsset.createdAt.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="asset-actions detail-actions">
            {selectedAsset.type === AssetType.MODEL && (
              <button 
                className="edit-model-btn"
                onClick={() => {
                  // Handle edit model action
                  console.log('Edit model:', selectedAsset);
                }}
              >
                Edit Model
              </button>
            )}
            <button 
              className="duplicate-asset-btn"
              onClick={() => {
                // Handle duplicate asset action
                console.log('Duplicate asset:', selectedAsset);
              }}
            >
              Duplicate
            </button>
            <button 
              className="download-asset-btn"
              onClick={() => {
                // Handle download asset action
                if (selectedAsset.url) {
                  const link = document.createElement('a');
                  link.href = selectedAsset.url;
                  link.download = selectedAsset.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              Download
            </button>
          </div>
        </div>
      )}
      
      {isModelBrowserOpen && (
        <ModelBrowser 
          onImportModel={handleImportModel}
          onClose={() => setIsModelBrowserOpen(false)}
        />
      )}
      
      {isModelInfoOpen && (
        <ModelInfo onClose={() => setIsModelInfoOpen(false)} />
      )}
    </div>
  );
};

export default AssetManager; 