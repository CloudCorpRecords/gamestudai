import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Stage } from '@react-three/drei';
import { FaUpload, FaSearch, FaSync, FaTrash, FaPlus, FaTag, FaSave, FaPenAlt, FaEye } from 'react-icons/fa';
import ModelIntegration from './ModelIntegration';
import './ModelManager.css';

// Define model type interfaces
interface ModelData {
  id: string;
  name: string;
  type: string;
  tags: string[];
  thumbnail: string;
}

// Mock model data - in a real app you'd fetch this from an API or database
const initialModels: ModelData[] = [
  { id: 'model1', name: 'Fantasy Character', type: 'character', tags: ['fantasy', 'humanoid', 'animated'], thumbnail: 'thumbnails/fantasy_char.png' },
  { id: 'model2', name: 'Sci-Fi Robot', type: 'character', tags: ['sci-fi', 'robot', 'mechanical'], thumbnail: 'thumbnails/scifi_robot.png' },
  { id: 'model3', name: 'Medieval Knight', type: 'character', tags: ['medieval', 'humanoid', 'armored'], thumbnail: 'thumbnails/knight.png' },
  { id: 'model4', name: 'Ancient Tree', type: 'environment', tags: ['nature', 'plant', 'static'], thumbnail: 'thumbnails/ancient_tree.png' },
  { id: 'model5', name: 'Treasure Chest', type: 'prop', tags: ['medieval', 'interactive', 'item'], thumbnail: 'thumbnails/chest.png' },
];

const availableTags: string[] = [
  'fantasy', 'sci-fi', 'medieval', 'modern', 
  'humanoid', 'robot', 'animal', 'monster',
  'animated', 'static', 'armored', 'nature',
  'character', 'environment', 'prop', 'interactive'
];

interface ModelPreviewProps {
  modelId: string;
}

// Model preview component using React Three Fiber
const ModelPreview: React.FC<ModelPreviewProps> = ({ modelId }) => {
  // In a real app, you'd load the actual model based on modelId
  // For this example, we're showing a placeholder cube
  return (
    <Canvas style={{ height: '300px' }} shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[512, 512]} castShadow />
      <group position={[0, -1, 0]}>
        {/* Replace this with your actual model loading logic */}
        {/* e.g.: const { scene } = useGLTF(`/models/${modelId}.glb`) */}
        {/* return <primitive object={scene} /> */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="tomato" />
        </mesh>
      </group>
      <OrbitControls makeDefault autoRotate />
      <Environment preset="sunset" />
    </Canvas>
  );
};

interface ModelItemProps {
  model: ModelData;
  isSelected: boolean;
  onClick: () => void;
}

// Individual model item component
const ModelItem: React.FC<ModelItemProps> = ({ model, isSelected, onClick }) => {
  return (
    <div 
      className={`model-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="model-thumbnail">
        {/* In a real app, use actual thumbnails */}
        <div className="thumbnail-placeholder">
          <span>{model.name.charAt(0)}</span>
        </div>
      </div>
      <div className="model-info">
        <h4>{model.name}</h4>
        <div className="model-tags">
          {model.tags.slice(0, 2).map(tag => (
            <span key={tag} className="model-tag">{tag}</span>
          ))}
          {model.tags.length > 2 && (
            <span className="model-tag-more">+{model.tags.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ModelManager: React.FC = () => {
  const [models, setModels] = useState<ModelData[]>(initialModels);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectedModel = selectedModelId ? models.find(model => model.id === selectedModelId) : null;
  
  const filteredModels = models.filter(model => {
    // Filter by search query
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => model.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  const handleUploadClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real app, you'd upload the file to a server or process it
      console.log('File selected:', files[0].name);
      
      // Add a placeholder for the new model
      const newModel: ModelData = {
        id: `model${models.length + 1}`,
        name: files[0].name.split('.')[0],
        type: 'character',
        tags: ['new'],
        thumbnail: 'thumbnails/placeholder.png'
      };
      
      setModels([...models, newModel]);
      setSelectedModelId(newModel.id);
      setActiveTab('library');
    }
  };
  
  const handleTagFilter = (tag: string): void => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };
  
  const handleDeleteModel = (): void => {
    if (selectedModelId) {
      setModels(models.filter(model => model.id !== selectedModelId));
      setSelectedModelId(null);
    }
  };
  
  const handleSaveModel = (): void => {
    // In a real app, this would save changes to the server
    console.log('Saving model changes');
    setIsEditing(false);
  };
  
  return (
    <div className="model-manager">
      <div className="model-manager-header">
        <h2>3D Character Model Manager</h2>
        <div className="header-actions">
          <button 
            className={`tab-button ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            Library
          </button>
          <button 
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
          <button className="upload-button" onClick={handleUploadClick}>
            <FaUpload /> Upload Model
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".glb,.gltf,.fbx,.obj"
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      <div className="model-manager-content">
        {activeTab === 'library' ? (
          <>
            <div className="model-library">
              <div className="library-header">
                <div className="search-bar">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search models..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="tag-filters">
                  {availableTags.slice(0, 8).map(tag => (
                    <button 
                      key={tag}
                      className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => handleTagFilter(tag)}
                    >
                      <FaTag /> {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="models-grid">
                {filteredModels.map(model => (
                  <ModelItem 
                    key={model.id}
                    model={model}
                    isSelected={model.id === selectedModelId}
                    onClick={() => setSelectedModelId(model.id)}
                  />
                ))}
                
                {filteredModels.length === 0 && (
                  <div className="no-models">
                    <p>No models match your search criteria</p>
                    <button className="add-model-button" onClick={handleUploadClick}>
                      <FaPlus /> Add New Model
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {selectedModel && (
              <div className="preview-panel">
                <div className="preview-header">
                  <h3>{isEditing ? 'Editing: ' : ''}{selectedModel.name}</h3>
                  <div className="preview-actions">
                    {isEditing ? (
                      <>
                        <button className="action-button save" onClick={handleSaveModel}>
                          <FaSave /> Save
                        </button>
                        <button className="action-button cancel" onClick={() => setIsEditing(false)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="action-button edit" onClick={() => setIsEditing(true)}>
                          <FaPenAlt /> Edit
                        </button>
                        <button className="action-button delete" onClick={handleDeleteModel}>
                          <FaTrash /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="preview-content">
                  <div className="model-preview">
                    <ModelPreview modelId={selectedModel.id} />
                  </div>
                  
                  {isEditing ? (
                    <div className="model-editor">
                      <div className="form-group">
                        <label>Model Name</label>
                        <input 
                          type="text" 
                          value={selectedModel.name}
                          onChange={() => {}} // In a real app, update the model
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Model Type</label>
                        <select 
                          value={selectedModel.type}
                          onChange={() => {}} // In a real app, update the model
                        >
                          <option value="character">Character</option>
                          <option value="prop">Prop</option>
                          <option value="environment">Environment</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Tags</label>
                        <div className="tag-editor">
                          {availableTags.map(tag => (
                            <button 
                              key={tag}
                              className={`tag-option ${selectedModel.tags.includes(tag) ? 'active' : ''}`}
                              onClick={() => {}} // In a real app, toggle tag
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ModelIntegration modelId={selectedModel.id} modelName={selectedModel.name} />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="upload-area">
            <div className="upload-dropzone" onClick={handleUploadClick}>
              <FaUpload className="upload-icon" />
              <h3>Drag and drop your 3D model here</h3>
              <p>Supports GLB, GLTF, FBX, and OBJ files</p>
              <button className="browse-button">Browse Files</button>
            </div>
            
            <div className="upload-instructions">
              <h3>How to prepare your 3D models:</h3>
              <ul>
                <li>Models should be optimized for real-time rendering</li>
                <li>Keep polygon count under 50k for best performance</li>
                <li>Textures should be in PNG or JPG format, maximum 2048x2048</li>
                <li>Use PBR materials for best visual results</li>
                <li>Character models should be rigged with a standard skeleton</li>
                <li>For animated models, include basic animation sequences</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelManager; 