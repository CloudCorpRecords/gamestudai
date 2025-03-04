import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
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
  
  // Filter assets based on type and search query
  const filteredAssets = assets.filter(asset => 
    (selectedType === 'all' || asset.type === selectedType) &&
    (asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (asset.metadata?.prompt && asset.metadata.prompt.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  // Handle file uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAssets = acceptedFiles.map(file => {
      // Determine asset type based on file extension
      let type = AssetType.MODEL;
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
        type = AssetType.TEXTURE;
      } else if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
        type = AssetType.AUDIO;
      } else if (['js', 'ts', 'json'].includes(ext || '')) {
        type = AssetType.SCRIPT;
      }
      
      return {
        id: `${type}-${Date.now()}-${file.name}`,
        name: file.name,
        type,
        file,
        url: URL.createObjectURL(file),
        thumbnail: type === AssetType.TEXTURE ? URL.createObjectURL(file) : undefined,
        createdAt: new Date(),
      } as Asset;
    });
    
    setAssets(prev => [...prev, ...newAssets]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  
  // Handle asset selection
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };
  
  // Delete an asset
  const handleDeleteAsset = (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
              className={`asset-item ${selectedAsset?.id === asset.id ? 'selected' : ''} ${asset.aiGenerated ? 'ai-generated' : ''}`}
              onClick={() => handleSelectAsset(asset)}
            >
              {asset.thumbnail ? (
                <div className="asset-thumbnail">
                  <img src={asset.thumbnail} alt={asset.name} />
                </div>
              ) : (
                <div className="asset-icon">
                  {asset.type === AssetType.MODEL && <div className="icon model-icon">📦</div>}
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
                <div className="asset-type">{asset.type}</div>
              </div>
              <button 
                className="delete-asset" 
                onClick={(e) => handleDeleteAsset(asset.id, e)}
              >
                ✕
              </button>
              {asset.aiGenerated && <div className="ai-badge">AI</div>}
            </div>
          ))}
        </div>
        
        <div className="asset-actions">
          <div 
            {...getRootProps()} 
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <p>Drag & drop assets here, or click to select files</p>
          </div>
          
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
      </div>
      
      {selectedAsset && (
        <div className="asset-details">
          <h3>{selectedAsset.name}</h3>
          <div className="asset-properties">
            <div className="property">
              <span className="property-label">Type:</span>
              <span>{selectedAsset.type}</span>
            </div>
            <div className="property">
              <span className="property-label">Created:</span>
              <span>{selectedAsset.createdAt.toLocaleDateString()}</span>
            </div>
            {selectedAsset.aiGenerated && (
              <div className="property">
                <span className="property-label">AI Generated:</span>
                <span>Yes</span>
              </div>
            )}
            {selectedAsset.metadata?.prompt && (
              <div className="property prompt">
                <span className="property-label">Prompt:</span>
                <span>{selectedAsset.metadata.prompt}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager; 