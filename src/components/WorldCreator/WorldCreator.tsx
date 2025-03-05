import React, { useState } from 'react';
import TerrainEditor from './TerrainEditor';
import ObjectPlacement from './ObjectPlacement';
import GameAssembler from './GameAssembler';
import './WorldCreator.css';

// World creator modes
enum WorldCreatorMode {
  TERRAIN = 'terrain',
  OBJECT = 'object',
  ENVIRONMENT = 'environment',
  GAME_ASSEMBLER = 'game_assembler'
}

// Interface for saved world data
interface WorldData {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastModified: Date;
  thumbnail?: string;
  aiGenerated: boolean;
}

const WorldCreator: React.FC = () => {
  const [activeMode, setActiveMode] = useState<WorldCreatorMode>(WorldCreatorMode.TERRAIN);
  const [currentWorld, setCurrentWorld] = useState<WorldData>({
    id: `world_${Date.now()}`,
    name: 'New World',
    createdAt: new Date(),
    lastModified: new Date(),
    aiGenerated: false
  });
  const [showCreateWorldDialog, setShowCreateWorldDialog] = useState<boolean>(false);
  const [worldName, setWorldName] = useState<string>('');
  const [worldDescription, setWorldDescription] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingWorld, setIsGeneratingWorld] = useState<boolean>(false);
  
  // Handle mode change
  const handleModeChange = (mode: WorldCreatorMode) => {
    setActiveMode(mode);
  };
  
  // Save the current world
  const handleSaveWorld = () => {
    setCurrentWorld({
      ...currentWorld,
      lastModified: new Date()
    });
    
    // In a real app, would save to a database or file
    alert('World saved successfully!');
  };
  
  // Create a new world
  const handleCreateWorld = () => {
    if (!worldName) return;
    
    setCurrentWorld({
      id: `world_${Date.now()}`,
      name: worldName,
      description: worldDescription,
      createdAt: new Date(),
      lastModified: new Date(),
      aiGenerated: false
    });
    
    setShowCreateWorldDialog(false);
    setWorldName('');
    setWorldDescription('');
  };
  
  // Generate world with AI
  const handleGenerateWorldWithAI = () => {
    if (!aiPrompt) return;
    
    setIsGeneratingWorld(true);
    
    // Simulate AI generation with a timeout
    setTimeout(() => {
      setCurrentWorld({
        id: `world_${Date.now()}`,
        name: `AI World: ${aiPrompt.substring(0, 20)}${aiPrompt.length > 20 ? '...' : ''}`,
        description: aiPrompt,
        createdAt: new Date(),
        lastModified: new Date(),
        aiGenerated: true
      });
      
      setShowCreateWorldDialog(false);
      setAiPrompt('');
      setIsGeneratingWorld(false);
    }, 2000);
  };
  
  // Render the active component based on the selected mode
  const renderActiveComponent = () => {
    switch (activeMode) {
      case WorldCreatorMode.TERRAIN:
        return <TerrainEditor />;
      case WorldCreatorMode.OBJECT:
        return <ObjectPlacement />;
      case WorldCreatorMode.ENVIRONMENT:
        return (
          <div className="environment-placeholder">
            <h2>Environment Editor</h2>
            <p>This section will allow users to customize sky, lighting, weather, and atmospheric effects.</p>
            <p>Coming soon...</p>
          </div>
        );
      case WorldCreatorMode.GAME_ASSEMBLER:
        return <GameAssembler />;
      default:
        return <TerrainEditor />;
    }
  };
  
  return (
    <div className="world-creator">
      <div className="world-creator-header">
        <div className="world-info">
          <h2>{currentWorld.name}</h2>
          {currentWorld.aiGenerated && <span className="ai-badge">AI Generated</span>}
          <span className="last-modified">
            Last modified: {currentWorld.lastModified.toLocaleString()}
          </span>
        </div>
        
        <div className="world-actions">
          <button 
            className="new-world-btn"
            onClick={() => setShowCreateWorldDialog(true)}
          >
            New World
          </button>
          
          <button 
            className="save-world-btn"
            onClick={handleSaveWorld}
          >
            Save World
          </button>
        </div>
      </div>
      
      <div className="world-creator-tabs">
        <button 
          className={`tab ${activeMode === WorldCreatorMode.TERRAIN ? 'active' : ''}`}
          onClick={() => handleModeChange(WorldCreatorMode.TERRAIN)}
        >
          Terrain
        </button>
        
        <button 
          className={`tab ${activeMode === WorldCreatorMode.OBJECT ? 'active' : ''}`}
          onClick={() => handleModeChange(WorldCreatorMode.OBJECT)}
        >
          Objects
        </button>
        
        <button 
          className={`tab ${activeMode === WorldCreatorMode.ENVIRONMENT ? 'active' : ''}`}
          onClick={() => handleModeChange(WorldCreatorMode.ENVIRONMENT)}
        >
          Environment
        </button>
        
        <button 
          className={`tab ${activeMode === WorldCreatorMode.GAME_ASSEMBLER ? 'active' : ''}`}
          onClick={() => handleModeChange(WorldCreatorMode.GAME_ASSEMBLER)}
        >
          Game Assembler
        </button>
      </div>
      
      <div className="world-creator-content">
        {renderActiveComponent()}
      </div>
      
      {showCreateWorldDialog && (
        <div className="dialog-overlay">
          <div className="create-world-dialog">
            <h3>Create New World</h3>
            
            <div className="dialog-tabs">
              <button 
                className={aiPrompt ? '' : 'active'}
                onClick={() => setAiPrompt('')}
              >
                Manual Setup
              </button>
              <button 
                className={aiPrompt ? 'active' : ''}
                onClick={() => setAiPrompt('A fantasy world with mountains and forests')}
              >
                AI Generate
              </button>
            </div>
            
            {!aiPrompt ? (
              <div className="manual-setup">
                <div className="form-group">
                  <label>World Name</label>
                  <input 
                    type="text" 
                    value={worldName} 
                    onChange={(e) => setWorldName(e.target.value)}
                    placeholder="Enter world name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea 
                    value={worldDescription} 
                    onChange={(e) => setWorldDescription(e.target.value)}
                    placeholder="Enter world description"
                  />
                </div>
                
                <div className="dialog-actions">
                  <button onClick={() => setShowCreateWorldDialog(false)}>Cancel</button>
                  <button 
                    className="create-btn"
                    onClick={handleCreateWorld}
                    disabled={!worldName}
                  >
                    Create World
                  </button>
                </div>
              </div>
            ) : (
              <div className="ai-setup">
                <div className="form-group">
                  <label>Describe the world you want to create</label>
                  <textarea 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A fantasy world with mountains, forests, and a castle on a hill overlooking a village"
                  />
                </div>
                
                <div className="ai-prompt-suggestions">
                  <h4>Suggestions:</h4>
                  <div className="suggestions">
                    <button onClick={() => setAiPrompt("A fantasy world with mountains, forests, and a castle")}>Fantasy World</button>
                    <button onClick={() => setAiPrompt("A sci-fi planet with alien landscape and futuristic buildings")}>Sci-Fi Planet</button>
                    <button onClick={() => setAiPrompt("A tropical island paradise with beaches, palm trees, and a volcano")}>Tropical Island</button>
                    <button onClick={() => setAiPrompt("A post-apocalyptic wasteland with ruins and abandoned structures")}>Post-Apocalyptic</button>
                  </div>
                </div>
                
                <div className="dialog-actions">
                  <button onClick={() => setShowCreateWorldDialog(false)}>Cancel</button>
                  <button 
                    className="generate-btn"
                    onClick={handleGenerateWorldWithAI}
                    disabled={!aiPrompt || isGeneratingWorld}
                  >
                    {isGeneratingWorld ? 'Generating...' : 'Generate World with AI'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldCreator; 