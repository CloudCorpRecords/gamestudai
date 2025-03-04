import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  NodeType, 
  NodeCategory, 
  PropertyType, 
  PortType 
} from './NodeTypes';
import './ScriptNode.css';

// Interface for node data
interface NodeData {
  type: string;
  label: string;
  description?: string;
  category: NodeCategory;
  inputs?: Array<{
    id: string;
    label: string;
    type: PortType;
    required?: boolean;
    description?: string;
  }>;
  outputs?: Array<{
    id: string;
    label: string;
    type: PortType;
    description?: string;
  }>;
  properties?: Array<{
    id: string;
    label: string;
    type: PropertyType;
    defaultValue: any;
    options?: string[] | { label: string; value: string | number | boolean }[];
    min?: number;
    max?: number;
    step?: number;
    description?: string;
    advanced?: boolean;
    hidden?: boolean;
    placeholder?: string;
  }>;
  values: Record<string, any>;
  isAdvanced?: boolean;
  tags?: string[];
}

// Helper component for rendering node properties
const PropertyInput: React.FC<{
  property: any;
  value: any;
  onChange: (id: string, value: any) => void;
  showAdvanced: boolean;
}> = ({ property, value, onChange, showAdvanced }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let newValue: any = e.target.value;
    
    // Convert to appropriate type
    if (property.type === PropertyType.NUMBER || property.type === PropertyType.INTEGER || property.type === PropertyType.SLIDER) {
      newValue = parseFloat(newValue);
      if (property.min !== undefined) newValue = Math.max(property.min, newValue);
      if (property.max !== undefined) newValue = Math.min(property.max, newValue);
      if (property.type === PropertyType.INTEGER) newValue = Math.round(newValue);
    } else if (property.type === PropertyType.BOOLEAN) {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    onChange(property.id, newValue);
  };

  // If the property is marked as hidden, don't render it
  if (property.hidden) return null;

  // If the property is marked as advanced and we're not showing advanced properties, don't render it
  if (property.advanced && !showAdvanced) return null;

  switch (property.type) {
    case PropertyType.BOOLEAN:
      return (
        <div className="property-row">
          <label htmlFor={property.id} title={property.description || ''}>
            {property.label}
          </label>
          <input
            type="checkbox"
            id={property.id}
            checked={value === undefined ? property.defaultValue : value}
            onChange={handleChange}
            title={property.description || ''}
          />
        </div>
      );
    case PropertyType.NUMBER:
    case PropertyType.INTEGER:
      return (
        <div className="property-row">
          <label htmlFor={property.id} title={property.description || ''}>
            {property.label}
          </label>
          <input
            type="number"
            id={property.id}
            value={value === undefined ? property.defaultValue : value}
            min={property.min}
            max={property.max}
            step={property.step || (property.type === PropertyType.INTEGER ? 1 : 0.1)}
            onChange={handleChange}
            title={property.description || ''}
            className={property.advanced ? 'advanced-property' : ''}
          />
        </div>
      );
    case PropertyType.SLIDER:
      return (
        <div className="property-row slider-row">
          <label htmlFor={property.id} title={property.description || ''}>
            {property.label}
          </label>
          <div className="slider-container">
            <input
              type="range"
              id={`${property.id}-slider`}
              value={value === undefined ? property.defaultValue : value}
              min={property.min || 0}
              max={property.max || 1}
              step={property.step || 0.01}
              onChange={handleChange}
              title={property.description || ''}
            />
            <input
              type="number"
              id={property.id}
              value={value === undefined ? property.defaultValue : value}
              min={property.min}
              max={property.max}
              step={property.step || 0.01}
              onChange={handleChange}
              className="slider-value"
            />
          </div>
        </div>
      );
    case PropertyType.DROPDOWN:
      return (
        <div className="property-row">
          <label htmlFor={property.id} title={property.description || ''}>
            {property.label}
          </label>
          <select
            id={property.id}
            value={value === undefined ? property.defaultValue : value}
            onChange={handleChange}
            title={property.description || ''}
          >
            {Array.isArray(property.options) && property.options.map((option: any) => {
              if (typeof option === 'object' && option !== null) {
                return (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                );
              } else {
                return (
                  <option key={String(option)} value={String(option)}>
                    {option}
                  </option>
                );
              }
            })}
          </select>
        </div>
      );
    case PropertyType.STRING:
      return (
        <div className="property-row">
          <label htmlFor={property.id} title={property.description || ''}>
            {property.label}
          </label>
          <input
            type="text"
            id={property.id}
            value={value === undefined ? property.defaultValue : value}
            onChange={handleChange}
            placeholder={property.placeholder || ''}
            title={property.description || ''}
          />
        </div>
      );
    case PropertyType.TEXT:
      return (
        <div className="property-row text-area-row">
          <label htmlFor={property.id} title={property.description || ''}>
            {property.label}
          </label>
          <textarea
            id={property.id}
            value={value === undefined ? property.defaultValue : value}
            onChange={handleChange}
            rows={3}
            placeholder={property.placeholder || ''}
            title={property.description || ''}
          />
        </div>
      );
    case PropertyType.COLOR:
      return (
        <div className="property-row color-row">
          <label htmlFor={property.id} title={property.description || ''}>
            {property.label}
          </label>
          <div className="color-picker-container">
            <input
              type="color"
              id={property.id}
              value={value === undefined ? property.defaultValue : value}
              onChange={handleChange}
              title={property.description || ''}
            />
            <input
              type="text"
              value={value === undefined ? property.defaultValue : value}
              onChange={handleChange}
              className="color-text"
            />
          </div>
        </div>
      );
    case PropertyType.VECTOR3:
      const vector3Value = value || property.defaultValue || { x: 0, y: 0, z: 0 };
      return (
        <div className="property-row vector3-row">
          <label title={property.description || ''}>
            {property.label}
          </label>
          <div className="vector3-inputs">
            <div className="vector-component">
              <label htmlFor={`${property.id}-x`}>X</label>
              <input
                type="number"
                id={`${property.id}-x`}
                value={vector3Value.x}
                onChange={(e) => {
                  const newValue = { ...vector3Value, x: parseFloat(e.target.value) };
                  onChange(property.id, newValue);
                }}
                step="0.1"
              />
            </div>
            <div className="vector-component">
              <label htmlFor={`${property.id}-y`}>Y</label>
              <input
                type="number"
                id={`${property.id}-y`}
                value={vector3Value.y}
                onChange={(e) => {
                  const newValue = { ...vector3Value, y: parseFloat(e.target.value) };
                  onChange(property.id, newValue);
                }}
                step="0.1"
              />
            </div>
            <div className="vector-component">
              <label htmlFor={`${property.id}-z`}>Z</label>
              <input
                type="number"
                id={`${property.id}-z`}
                value={vector3Value.z}
                onChange={(e) => {
                  const newValue = { ...vector3Value, z: parseFloat(e.target.value) };
                  onChange(property.id, newValue);
                }}
                step="0.1"
              />
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

// Get port color based on type
const getPortColor = (type: PortType): string => {
  switch (type) {
    case PortType.TRIGGER: return '#ff0072';
    case PortType.BOOLEAN: return '#00ff9f';
    case PortType.NUMBER: 
    case PortType.INTEGER: return '#00c4ff';
    case PortType.STRING: return '#ffff00';
    case PortType.VECTOR2:
    case PortType.VECTOR3: return '#ff9500';
    case PortType.COLOR: return '#ff00ff';
    case PortType.OBJECT: return '#0051ff';
    case PortType.ARRAY: return '#00ff51';
    default: return '#bbbbbb';
  }
};

// Get node class name based on category
const getNodeClassName = (data: NodeData, selected: boolean, isCollapsed: boolean): string => {
  let className = 'script-node';
  
  if (selected) className += ' selected';
  if (isCollapsed) className += ' collapsed';
  
  // Add class based on node category
  if (data.category) {
    switch (data.category) {
      case NodeCategory.COMMON:
      case NodeCategory.GAMEPLAY:
      case NodeCategory.GRAPHICS:
        className += ' action-node';
        break;
      case NodeCategory.AI:
        className += ' ai-node';
        break;
      case NodeCategory.MATH:
        className += ' math-node';
        break;
      case NodeCategory.LOGIC:
        className += ' condition-node';
        break;
      case NodeCategory.PHYSICS:
      case NodeCategory.AUDIO:
      case NodeCategory.INPUT:
      case NodeCategory.UI:
      case NodeCategory.UTILITY:
      case NodeCategory.CUSTOM:
      case NodeCategory.ADVANCED:
      default:
        className += ' action-node';
        break;
    }
  }
  
  // Add class for advanced nodes
  if (data.isAdvanced) {
    className += ' advanced-node';
  }
  
  return className;
};

// Main ScriptNode component
const ScriptNode: React.FC<NodeProps<NodeData>> = ({ data, id, selected }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handlePropertyChange = (propertyId: string, value: any) => {
    console.log(`Setting property "${propertyId}" to:`, value);
    data.values[propertyId] = value;
    // In a real implementation, you would dispatch an action to update the node in your state
  };

  return (
    <div className={getNodeClassName(data, selected, isCollapsed)}>
      <div className="node-header">
        <div className="node-title">
          {data.label}
          {data.isAdvanced && <span className="advanced-badge">Advanced</span>}
        </div>
        <div className="node-controls">
          {data.properties?.some(p => p.advanced) && (
            <button 
              className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
              title={showAdvanced ? 'Hide advanced properties' : 'Show advanced properties'}
            >
              ⚙️
            </button>
          )}
          <button 
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand node' : 'Collapse node'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>
      
      {data.description && (
        <div className="node-description">
          {data.description}
        </div>
      )}
      
      {!isCollapsed && (
        <div className="node-content">
          {/* Input handles */}
          {data.inputs?.map((input) => (
            <div className="port input-port" key={input.id}>
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                style={{ backgroundColor: getPortColor(input.type) }}
              />
              <span title={input.description || ''}>
                {input.label}
                {input.required && <span className="required-badge">*</span>}
              </span>
            </div>
          ))}
          
          {/* Output handles */}
          {data.outputs?.map((output) => (
            <div className="port output-port" key={output.id}>
              <span title={output.description || ''}>{output.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                style={{ backgroundColor: getPortColor(output.type) }}
              />
            </div>
          ))}
          
          {/* Node properties */}
          {data.properties && data.properties.length > 0 && (
            <div className="node-properties">
              {data.properties.map((property) => (
                <PropertyInput
                  key={property.id}
                  property={property}
                  value={data.values[property.id]}
                  onChange={handlePropertyChange}
                  showAdvanced={showAdvanced}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {data.tags && data.tags.length > 0 && !isCollapsed && (
        <div className="node-tags">
          {data.tags.map((tag: string) => (
            <span key={tag} className="node-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ScriptNode); 