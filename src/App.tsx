import React, { useState } from 'react';
import Editor from './components/Editor';
import VisualScriptEditor from './components/VisualScripting/VisualScriptEditor';
import AssetManager from './components/AssetManager/AssetManager';
import WorldCreator from './components/WorldCreator';
import ModelManager from './components/ModelManager';
import AIModelGenerator from './components/AIModelGenerator/AIModelGenerator';
import Settings from './components/Settings/Settings';
import './styles/App.css';

// App component tabs
enum AppTab {
  EDITOR = 'editor',
  VISUAL_SCRIPTING = 'visual_scripting',
  ASSET_MANAGER = 'asset_manager',
  WORLD_CREATOR = 'world_creator',
  MODEL_MANAGER = 'model_manager',
  AI_MODEL_GENERATOR = 'ai_model_generator',
  SETTINGS = 'settings'
}

const App: React.FC = () => {
  const [projectName, setProjectName] = useState<string>("New Project");
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.EDITOR);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  
  // Handle project name change
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };
  
  // Create a new project
  const handleNewProject = () => {
    if (window.confirm("Create a new project? Unsaved changes will be lost.")) {
      setProjectName("New Project");
      // Reset other state as needed
    }
  };
  
  // Toggle AI assistant
  const handleToggleAI = () => {
    setShowAIAssistant(!showAIAssistant);
  };
  
  // Handle AI prompt submit
  const handleAIPromptSubmit = () => {
    if (!aiPrompt) return;
    
    // In a real app, would send the prompt to an AI service
    console.log(`AI Prompt: ${aiPrompt}`);
    // For demo, just clear the prompt
    setAiPrompt("");
  };
  
  // Render the active component based on the selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case AppTab.EDITOR:
        return <Editor />;
      case AppTab.VISUAL_SCRIPTING:
        return <VisualScriptEditor />;
      case AppTab.ASSET_MANAGER:
        return <AssetManager />;
      case AppTab.WORLD_CREATOR:
        return <WorldCreator />;
      case AppTab.MODEL_MANAGER:
        return <ModelManager />;
      case AppTab.AI_MODEL_GENERATOR:
        return <AIModelGenerator />;
      case AppTab.SETTINGS:
        return <Settings />;
      default:
        return <Editor />;
    }
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">GameStuAI Engine</div>
        
        <div className="project-name">
          <input 
            type="text" 
            value={projectName} 
            onChange={handleProjectNameChange} 
            onBlur={() => {
              if (projectName.trim() === "") setProjectName("New Project");
            }}
          />
        </div>
        
        <div className="header-tabs">
          <button 
            className={`tab ${activeTab === AppTab.EDITOR ? 'active' : ''}`}
            onClick={() => setActiveTab(AppTab.EDITOR)}
          >
            3D Editor
          </button>
          
          <button 
            className={`tab ${activeTab === AppTab.VISUAL_SCRIPTING ? 'active' : ''}`}
            onClick={() => setActiveTab(AppTab.VISUAL_SCRIPTING)}
          >
            Visual Scripting
          </button>
          
          <button 
            className={`tab ${activeTab === AppTab.ASSET_MANAGER ? 'active' : ''}`}
            onClick={() => setActiveTab(AppTab.ASSET_MANAGER)}
          >
            Assets
          </button>
          
          <button 
            className={`tab ${activeTab === AppTab.WORLD_CREATOR ? 'active' : ''}`}
            onClick={() => setActiveTab(AppTab.WORLD_CREATOR)}
          >
            World Creator
          </button>
          
          <button 
            className={`tab ${activeTab === AppTab.MODEL_MANAGER ? 'active' : ''}`}
            onClick={() => setActiveTab(AppTab.MODEL_MANAGER)}
          >
            Character Models
          </button>
          
          <button 
            className={`tab ${activeTab === AppTab.AI_MODEL_GENERATOR ? 'active' : ''}`}
            onClick={() => setActiveTab(AppTab.AI_MODEL_GENERATOR)}
          >
            AI Models
          </button>
        </div>
        
        <div className="top-menu">
          <div className="dropdown">
            <button className="dropdown-button">File</button>
            <div className="dropdown-content">
              <button onClick={handleNewProject}>New Project</button>
              <button>Open Project</button>
              <button>Save Project</button>
              <button>Export Game</button>
            </div>
          </div>
          
          <div className="dropdown">
            <button className="dropdown-button">Edit</button>
            <div className="dropdown-content">
              <button>Undo</button>
              <button>Redo</button>
              <button>Cut</button>
              <button>Copy</button>
              <button>Paste</button>
            </div>
          </div>
          
          <div className="dropdown">
            <button className="dropdown-button">View</button>
            <div className="dropdown-content">
              <button>Zoom In</button>
              <button>Zoom Out</button>
              <button>Reset View</button>
            </div>
          </div>
          
          <button 
            className={`ai-button ${showAIAssistant ? 'active' : ''}`}
            onClick={handleToggleAI}
          >
            AI Assistant
          </button>
          
          <button 
            className={`settings-button ${activeTab === AppTab.SETTINGS ? 'active' : ''}`}
            onClick={() => setActiveTab(AppTab.SETTINGS)}
          >
            Settings
          </button>
        </div>
      </header>
      
      <div className="main-content">
        <div className="content-container">
          {renderTabContent()}
        </div>
        
        {showAIAssistant && (
          <div className="ai-assistant-panel">
            <h3>AI Assistant</h3>
            
            <div className="ai-prompt-container">
              <input 
                type="text" 
                placeholder="Ask anything about your game or get suggestions..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAIPromptSubmit();
                }}
              />
              
              <button 
                className="ai-prompt-button"
                onClick={handleAIPromptSubmit}
                disabled={!aiPrompt}
              >
                Ask
              </button>
            </div>
            
            <div className="ai-suggestions">
              <p>Try asking:</p>
              <button onClick={() => setAiPrompt("Generate a 3D model of a fantasy character")}>
                Generate a 3D model of a fantasy character
              </button>
              <button onClick={() => setAiPrompt("Create a character animation script")}>
                Create a character animation script
              </button>
              <button onClick={() => setAiPrompt("How do I customize a character model?")}>
                How do I customize a character model?
              </button>
            </div>
          </div>
        )}
      </div>
      
      <footer className="app-footer">
        <div className="status-bar">Ready</div>
        <div className="version">v0.1.0</div>
      </footer>
    </div>
  );
};

export default App; 