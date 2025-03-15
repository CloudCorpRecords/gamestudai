import React, { useState, useEffect } from 'react';
import { RPGEvent } from './types';

interface CutsceneEditorProps {
  event: RPGEvent;
  onSave: (event: RPGEvent) => void;
  onCancel: () => void;
}

const CutsceneEditor: React.FC<CutsceneEditorProps> = ({ event, onSave, onCancel }) => {
  // Local state for the cutscene being edited
  const [editedEvent, setEditedEvent] = useState<RPGEvent>({ ...event });
  
  // Add a new action to the cutscene
  const addAction = (type: string) => {
    const newAction = {
      type,
      params: {}
    };
    
    // Set default params based on action type
    switch (type) {
      case 'message':
        newAction.params = { text: 'Enter your message here...' };
        break;
      case 'moveCharacter':
        newAction.params = { character: 'player', direction: 'right', steps: 1 };
        break;
      case 'wait':
        newAction.params = { duration: 1000 };
        break;
      case 'changeBackground':
        newAction.params = { image: 'default_bg' };
        break;
      case 'showCharacter':
        newAction.params = { character: 'npc', position: 'center' };
        break;
      case 'hideCharacter':
        newAction.params = { character: 'npc' };
        break;
    }
    
    setEditedEvent(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };
  
  // Remove an action from the cutscene
  const removeAction = (index: number) => {
    setEditedEvent(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };
  
  // Update an action's params
  const updateActionParams = (index: number, params: any) => {
    setEditedEvent(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, params: { ...action.params, ...params } } : action
      )
    }));
  };
  
  // Move an action up in the sequence
  const moveActionUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    setEditedEvent(prev => {
      const newActions = [...prev.actions];
      const temp = newActions[index];
      newActions[index] = newActions[index - 1];
      newActions[index - 1] = temp;
      return { ...prev, actions: newActions };
    });
  };
  
  // Move an action down in the sequence
  const moveActionDown = (index: number) => {
    if (index === editedEvent.actions.length - 1) return; // Already at the bottom
    
    setEditedEvent(prev => {
      const newActions = [...prev.actions];
      const temp = newActions[index];
      newActions[index] = newActions[index + 1];
      newActions[index + 1] = temp;
      return { ...prev, actions: newActions };
    });
  };
  
  // Render an action editor based on type
  const renderActionEditor = (action: any, index: number) => {
    switch (action.type) {
      case 'message':
        return (
          <div className="message-action-editor">
            <textarea 
              value={action.params.text}
              onChange={(e) => updateActionParams(index, { text: e.target.value })}
              placeholder="Enter dialog text here..."
              rows={3}
            />
          </div>
        );
        
      case 'moveCharacter':
        return (
          <div className="move-action-editor">
            <div className="action-param">
              <label>Character:</label>
              <select 
                value={action.params.character}
                onChange={(e) => updateActionParams(index, { character: e.target.value })}
              >
                <option value="player">Player</option>
                <option value="npc1">NPC 1</option>
                <option value="npc2">NPC 2</option>
              </select>
            </div>
            
            <div className="action-param">
              <label>Direction:</label>
              <select 
                value={action.params.direction}
                onChange={(e) => updateActionParams(index, { direction: e.target.value })}
              >
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            
            <div className="action-param">
              <label>Steps:</label>
              <input 
                type="number"
                value={action.params.steps}
                onChange={(e) => updateActionParams(index, { steps: parseInt(e.target.value) })}
                min={1}
                max={10}
              />
            </div>
          </div>
        );
        
      case 'wait':
        return (
          <div className="wait-action-editor">
            <div className="action-param">
              <label>Duration (ms):</label>
              <input 
                type="number"
                value={action.params.duration}
                onChange={(e) => updateActionParams(index, { duration: parseInt(e.target.value) })}
                min={100}
                max={10000}
                step={100}
              />
            </div>
          </div>
        );
        
      case 'changeBackground':
        return (
          <div className="background-action-editor">
            <div className="action-param">
              <label>Background:</label>
              <select 
                value={action.params.image}
                onChange={(e) => updateActionParams(index, { image: e.target.value })}
              >
                <option value="default_bg">Default</option>
                <option value="town_bg">Town</option>
                <option value="castle_bg">Castle</option>
                <option value="forest_bg">Forest</option>
                <option value="cave_bg">Cave</option>
              </select>
            </div>
          </div>
        );
        
      case 'showCharacter':
      case 'hideCharacter':
        return (
          <div className="character-action-editor">
            <div className="action-param">
              <label>Character:</label>
              <select 
                value={action.params.character}
                onChange={(e) => updateActionParams(index, { character: e.target.value })}
              >
                <option value="player">Player</option>
                <option value="npc1">NPC 1</option>
                <option value="npc2">NPC 2</option>
              </select>
            </div>
            
            {action.type === 'showCharacter' && (
              <div className="action-param">
                <label>Position:</label>
                <select 
                  value={action.params.position}
                  onChange={(e) => updateActionParams(index, { position: e.target.value })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Unknown action type: {action.type}</div>;
    }
  };
  
  return (
    <div className="cutscene-editor">
      <div className="cutscene-editor-header">
        <h3>Edit Cutscene</h3>
        <button className="close-button" onClick={onCancel}>×</button>
      </div>
      
      <div className="cutscene-editor-content">
        <div className="form-group">
          <label>Cutscene Name:</label>
          <input 
            type="text"
            value={editedEvent.id}
            onChange={(e) => setEditedEvent(prev => ({ ...prev, id: e.target.value }))}
            placeholder="Enter a unique ID for this cutscene"
          />
        </div>
        
        <div className="form-group">
          <label>Trigger:</label>
          <select
            value={editedEvent.trigger}
            onChange={(e) => setEditedEvent(prev => ({ ...prev, trigger: e.target.value as any }))}
          >
            <option value="auto">Auto (Plays immediately)</option>
            <option value="action">Action (Requires interaction)</option>
            <option value="touch">Touch (Triggered by player presence)</option>
          </select>
        </div>
        
        <div className="cutscene-actions">
          <h4>Actions Sequence</h4>
          <p className="help-text">Add actions to create your cutscene. The actions will play in the order shown below.</p>
          
          {editedEvent.actions.length === 0 ? (
            <div className="no-actions">
              No actions yet. Add an action to begin creating your cutscene.
            </div>
          ) : (
            <div className="actions-list">
              {editedEvent.actions.map((action, index) => (
                <div key={index} className="action-item">
                  <div className="action-header">
                    <span className="action-number">{index + 1}</span>
                    <span className="action-type">{action.type}</span>
                    <div className="action-controls">
                      <button 
                        className="move-up-button" 
                        onClick={() => moveActionUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button 
                        className="move-down-button" 
                        onClick={() => moveActionDown(index)}
                        disabled={index === editedEvent.actions.length - 1}
                      >
                        ↓
                      </button>
                      <button 
                        className="remove-action-button" 
                        onClick={() => removeAction(index)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="action-editor">
                    {renderActionEditor(action, index)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="add-action-controls">
            <select id="action-type-select">
              <option value="">Select action type...</option>
              <option value="message">Show Message</option>
              <option value="moveCharacter">Move Character</option>
              <option value="wait">Wait/Pause</option>
              <option value="changeBackground">Change Background</option>
              <option value="showCharacter">Show Character</option>
              <option value="hideCharacter">Hide Character</option>
            </select>
            <button 
              className="add-action-button"
              onClick={() => {
                const select = document.getElementById('action-type-select') as HTMLSelectElement;
                if (select.value) {
                  addAction(select.value);
                  select.value = ''; // Reset selection
                }
              }}
            >
              Add Action
            </button>
          </div>
        </div>
      </div>
      
      <div className="cutscene-editor-footer">
        <button className="cancel-button" onClick={onCancel}>Cancel</button>
        <button 
          className="save-button" 
          onClick={() => onSave(editedEvent)}
          disabled={editedEvent.actions.length === 0}
        >
          Save Cutscene
        </button>
      </div>
    </div>
  );
};

export default CutsceneEditor; 