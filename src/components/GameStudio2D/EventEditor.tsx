import React, { useState, useEffect } from 'react';
import { RPGEvent } from './types';
import ScriptSelector from './ScriptSelector';
import scriptIntegration from './ScriptIntegration';
import './GameStudio2D.css';

interface EventEditorProps {
  event: RPGEvent | null;
  onSave: (event: RPGEvent) => void;
  onCancel: () => void;
  onDelete?: (eventId: string) => void;
}

const EventEditor: React.FC<EventEditorProps> = ({ 
  event, 
  onSave, 
  onCancel,
  onDelete 
}) => {
  const [editedEvent, setEditedEvent] = useState<RPGEvent | null>(event);
  const [showScriptSelector, setShowScriptSelector] = useState<boolean>(false);
  const [isNewEvent, setIsNewEvent] = useState<boolean>(false);

  // Initialize a new event if none is provided
  useEffect(() => {
    if (!event) {
      const newEvent: RPGEvent = {
        id: `event_${Date.now()}`,
        trigger: 'action',
        actions: [
          {
            type: 'message',
            params: { text: 'New event' }
          }
        ]
      };
      setEditedEvent(newEvent);
      setIsNewEvent(true);
    } else {
      setEditedEvent(event);
      setIsNewEvent(false);
    }
  }, [event]);

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    if (editedEvent) {
      setEditedEvent({
        ...editedEvent,
        [field]: value
      });
    }
  };

  // Handle action changes
  const handleActionChange = (index: number, field: string, value: any) => {
    if (editedEvent) {
      const updatedActions = [...editedEvent.actions];
      updatedActions[index] = {
        ...updatedActions[index],
        [field]: value
      };
      
      setEditedEvent({
        ...editedEvent,
        actions: updatedActions
      });
    }
  };

  // Handle action parameter changes
  const handleParamChange = (actionIndex: number, paramName: string, value: any) => {
    if (editedEvent) {
      const updatedActions = [...editedEvent.actions];
      updatedActions[actionIndex] = {
        ...updatedActions[actionIndex],
        params: {
          ...updatedActions[actionIndex].params,
          [paramName]: value
        }
      };
      
      setEditedEvent({
        ...editedEvent,
        actions: updatedActions
      });
    }
  };

  // Add a new action
  const addAction = () => {
    if (editedEvent) {
      setEditedEvent({
        ...editedEvent,
        actions: [
          ...editedEvent.actions,
          {
            type: 'message',
            params: { text: 'New action' }
          }
        ]
      });
    }
  };

  // Remove an action
  const removeAction = (index: number) => {
    if (editedEvent && editedEvent.actions.length > 1) {
      const updatedActions = [...editedEvent.actions];
      updatedActions.splice(index, 1);
      
      setEditedEvent({
        ...editedEvent,
        actions: updatedActions
      });
    }
  };

  // Handle script selection
  const handleScriptSelect = (scriptId: string) => {
    try {
      if (editedEvent) {
        // Create a new event with the selected script
        const scriptEvent = scriptIntegration.createScriptEvent(scriptId, editedEvent.trigger);
        
        // Merge with existing event
        setEditedEvent({
          ...editedEvent,
          visualScript: scriptEvent.visualScript
        });
      }
      
      setShowScriptSelector(false);
    } catch (error) {
      console.error('Failed to select script:', error);
      // Show error message
    }
  };

  // Remove visual script
  const removeVisualScript = () => {
    if (editedEvent && editedEvent.visualScript) {
      setEditedEvent({
        ...editedEvent,
        visualScript: undefined
      });
    }
  };

  // Save the event
  const handleSave = () => {
    if (editedEvent) {
      onSave(editedEvent);
    }
  };

  // Delete the event
  const handleDelete = () => {
    if (editedEvent && onDelete) {
      onDelete(editedEvent.id);
    }
  };

  if (!editedEvent) return null;

  return (
    <div className="event-editor">
      <div className="event-editor-header">
        <h3>{isNewEvent ? 'Create New Event' : 'Edit Event'}</h3>
        <button className="close-button" onClick={onCancel}>×</button>
      </div>

      <div className="event-editor-content">
        <div className="form-group">
          <label>Trigger Type:</label>
          <select
            value={editedEvent.trigger}
            onChange={(e) => handleChange('trigger', e.target.value)}
          >
            <option value="action">Action (Player Interaction)</option>
            <option value="touch">Touch (Player Collision)</option>
            <option value="auto">Auto (Automatic)</option>
          </select>
        </div>

        {/* Visual Script Section */}
        <div className="visual-script-section">
          <h4>Visual Script</h4>
          
          {editedEvent.visualScript ? (
            <div className="attached-script">
              <div className="script-info">
                <span className="script-name">{editedEvent.visualScript.name}</span>
                <div className="script-actions">
                  <button 
                    className="edit-script-button"
                    onClick={() => window.open(`/visual-scripting?script=${editedEvent.visualScript?.scriptId}`, '_blank')}
                  >
                    Edit
                  </button>
                  <button 
                    className="remove-script-button"
                    onClick={removeVisualScript}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              className="attach-script-button"
              onClick={() => setShowScriptSelector(true)}
            >
              Attach Visual Script
            </button>
          )}
        </div>

        <h4>Actions</h4>
        <div className="actions-list">
          {editedEvent.actions.map((action, index) => (
            <div key={index} className="action-item">
              <div className="action-header">
                <select
                  value={action.type}
                  onChange={(e) => handleActionChange(index, 'type', e.target.value)}
                >
                  <option value="message">Show Message</option>
                  <option value="giveItem">Give Item</option>
                  <option value="removeItem">Remove Item</option>
                  <option value="teleport">Teleport</option>
                  <option value="battle">Start Battle</option>
                  <option value="shop">Open Shop</option>
                  <option value="setVariable">Set Variable</option>
                  <option value="setSwitch">Set Switch</option>
                </select>
                
                <button 
                  className="remove-action-button"
                  onClick={() => removeAction(index)}
                  disabled={editedEvent.actions.length <= 1}
                >
                  ×
                </button>
              </div>

              <div className="action-params">
                {action.type === 'message' && (
                  <textarea
                    value={action.params.text || ''}
                    onChange={(e) => handleParamChange(index, 'text', e.target.value)}
                    placeholder="Enter message text..."
                    rows={3}
                  />
                )}

                {action.type === 'giveItem' && (
                  <input
                    type="text"
                    value={action.params.item || ''}
                    onChange={(e) => handleParamChange(index, 'item', e.target.value)}
                    placeholder="Item name"
                  />
                )}

                {action.type === 'removeItem' && (
                  <input
                    type="text"
                    value={action.params.item || ''}
                    onChange={(e) => handleParamChange(index, 'item', e.target.value)}
                    placeholder="Item name"
                  />
                )}

                {action.type === 'teleport' && (
                  <div className="teleport-params">
                    <input
                      type="text"
                      value={action.params.mapId || ''}
                      onChange={(e) => handleParamChange(index, 'mapId', e.target.value)}
                      placeholder="Map ID"
                    />
                    <input
                      type="number"
                      value={action.params.x || 0}
                      onChange={(e) => handleParamChange(index, 'x', parseInt(e.target.value))}
                      placeholder="X position"
                    />
                    <input
                      type="number"
                      value={action.params.y || 0}
                      onChange={(e) => handleParamChange(index, 'y', parseInt(e.target.value))}
                      placeholder="Y position"
                    />
                  </div>
                )}

                {action.type === 'setVariable' && (
                  <div className="variable-params">
                    <input
                      type="text"
                      value={action.params.variableId || ''}
                      onChange={(e) => handleParamChange(index, 'variableId', e.target.value)}
                      placeholder="Variable ID"
                    />
                    <input
                      type="text"
                      value={action.params.value || ''}
                      onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                      placeholder="Value"
                    />
                  </div>
                )}

                {action.type === 'setSwitch' && (
                  <div className="switch-params">
                    <input
                      type="text"
                      value={action.params.switchId || ''}
                      onChange={(e) => handleParamChange(index, 'switchId', e.target.value)}
                      placeholder="Switch ID"
                    />
                    <select
                      value={action.params.value ? 'true' : 'false'}
                      onChange={(e) => handleParamChange(index, 'value', e.target.value === 'true')}
                    >
                      <option value="true">ON</option>
                      <option value="false">OFF</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="add-action-button" onClick={addAction}>
          Add Action
        </button>
      </div>

      <div className="event-editor-footer">
        {!isNewEvent && onDelete && (
          <button className="delete-button" onClick={handleDelete}>
            Delete Event
          </button>
        )}
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="save-button" onClick={handleSave}>
          Save Event
        </button>
      </div>

      {showScriptSelector && (
        <div className="script-selector-overlay">
          <ScriptSelector
            onScriptSelect={handleScriptSelect}
            onCancel={() => setShowScriptSelector(false)}
            currentScriptId={editedEvent.visualScript?.scriptId}
          />
        </div>
      )}
    </div>
  );
};

export default EventEditor; 