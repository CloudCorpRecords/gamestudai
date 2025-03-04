import React, { useState } from 'react';
import { FaLink, FaCode, FaGamepad } from 'react-icons/fa';
import './ModelIntegration.css';

interface ModelIntegrationProps {
  modelId: string;
  modelName: string;
}

const ModelIntegration: React.FC<ModelIntegrationProps> = ({ modelId, modelName }) => {
  const [activeTab, setActiveTab] = useState<'world' | 'script'>('world');
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [behaviors, setBehaviors] = useState<string[]>([]);

  const handleAddToWorld = () => {
    // In a real implementation, this would communicate with your game engine
    console.log('Adding model to world with settings:', {
      modelId,
      position,
      rotation,
      scale,
      behaviors
    });
    
    // Example integration code that would be sent to the game
    const integrationCode = `
// Add model ${modelName} to scene
const model = await loadModel("${modelId}");
model.position.set(${position.x}, ${position.y}, ${position.z});
model.rotation.set(${rotation.x}, ${rotation.y}, ${rotation.z});
model.scale.set(${scale.x}, ${scale.y}, ${scale.z});
scene.add(model);

// Apply behaviors
${behaviors.map(behavior => `applyBehavior(model, "${behavior}");`).join('\n')}
    `;
    
    console.log(integrationCode);
    
    // Display a success message to the user
    alert(`${modelName} has been added to the game world!`);
  };

  const handleAddToScript = () => {
    // This would create a node in the visual scripting system
    console.log('Creating model node in script with settings:', {
      modelId,
      position,
      rotation,
      scale,
      behaviors
    });
    
    // In a real implementation, this would create a node in your visual scripting system
    alert(`${modelName} has been added to the visual script editor!`);
  };

  const availableBehaviors = [
    { id: 'walkable', name: 'Walkable Character' },
    { id: 'interactive', name: 'Interactive Object' },
    { id: 'physics', name: 'Physics Simulation' },
    { id: 'ai', name: 'AI Controlled' },
    { id: 'animated', name: 'Animated' },
    { id: 'collectable', name: 'Collectable Item' }
  ];

  const toggleBehavior = (behaviorId: string) => {
    if (behaviors.includes(behaviorId)) {
      setBehaviors(behaviors.filter(id => id !== behaviorId));
    } else {
      setBehaviors([...behaviors, behaviorId]);
    }
  };

  return (
    <div className="model-integration">
      <div className="integration-tabs">
        <button 
          className={`tab ${activeTab === 'world' ? 'active' : ''}`}
          onClick={() => setActiveTab('world')}
        >
          <FaGamepad /> Add to World
        </button>
        <button 
          className={`tab ${activeTab === 'script' ? 'active' : ''}`}
          onClick={() => setActiveTab('script')}
        >
          <FaCode /> Add to Script
        </button>
      </div>
      
      <div className="integration-content">
        <div className="transform-section">
          <h3>Transform</h3>
          
          <div className="transform-controls">
            <div className="transform-group">
              <label>Position</label>
              <div className="vector-inputs">
                <div className="vector-input">
                  <label>X</label>
                  <input 
                    type="number" 
                    value={position.x}
                    onChange={(e) => setPosition({...position, x: parseFloat(e.target.value)})}
                    step="0.1"
                  />
                </div>
                <div className="vector-input">
                  <label>Y</label>
                  <input 
                    type="number" 
                    value={position.y}
                    onChange={(e) => setPosition({...position, y: parseFloat(e.target.value)})}
                    step="0.1"
                  />
                </div>
                <div className="vector-input">
                  <label>Z</label>
                  <input 
                    type="number" 
                    value={position.z}
                    onChange={(e) => setPosition({...position, z: parseFloat(e.target.value)})}
                    step="0.1"
                  />
                </div>
              </div>
            </div>
            
            <div className="transform-group">
              <label>Rotation (degrees)</label>
              <div className="vector-inputs">
                <div className="vector-input">
                  <label>X</label>
                  <input 
                    type="number" 
                    value={rotation.x}
                    onChange={(e) => setRotation({...rotation, x: parseFloat(e.target.value)})}
                    step="5"
                  />
                </div>
                <div className="vector-input">
                  <label>Y</label>
                  <input 
                    type="number" 
                    value={rotation.y}
                    onChange={(e) => setRotation({...rotation, y: parseFloat(e.target.value)})}
                    step="5"
                  />
                </div>
                <div className="vector-input">
                  <label>Z</label>
                  <input 
                    type="number" 
                    value={rotation.z}
                    onChange={(e) => setRotation({...rotation, z: parseFloat(e.target.value)})}
                    step="5"
                  />
                </div>
              </div>
            </div>
            
            <div className="transform-group">
              <label>Scale</label>
              <div className="vector-inputs">
                <div className="vector-input">
                  <label>X</label>
                  <input 
                    type="number" 
                    value={scale.x}
                    onChange={(e) => setScale({...scale, x: parseFloat(e.target.value)})}
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div className="vector-input">
                  <label>Y</label>
                  <input 
                    type="number" 
                    value={scale.y}
                    onChange={(e) => setScale({...scale, y: parseFloat(e.target.value)})}
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div className="vector-input">
                  <label>Z</label>
                  <input 
                    type="number" 
                    value={scale.z}
                    onChange={(e) => setScale({...scale, z: parseFloat(e.target.value)})}
                    step="0.1"
                    min="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="behaviors-section">
          <h3>Behaviors</h3>
          <div className="behaviors-list">
            {availableBehaviors.map(behavior => (
              <div 
                key={behavior.id}
                className={`behavior-item ${behaviors.includes(behavior.id) ? 'active' : ''}`}
                onClick={() => toggleBehavior(behavior.id)}
              >
                <div className="behavior-checkbox">
                  <input 
                    type="checkbox" 
                    checked={behaviors.includes(behavior.id)}
                    onChange={() => {}} // Handled by the parent div's onClick
                  />
                </div>
                <span className="behavior-name">{behavior.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="integration-actions">
          {activeTab === 'world' ? (
            <button 
              className="add-button world-button"
              onClick={handleAddToWorld}
            >
              <FaGamepad /> Add to Game World
            </button>
          ) : (
            <button 
              className="add-button script-button"
              onClick={handleAddToScript}
            >
              <FaLink /> Create Model Node in Script
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelIntegration; 