import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  TransformControls, 
  Grid, 
  useTexture, 
  Html, 
  PivotControls 
} from '@react-three/drei';
import './ObjectPlacement.css';

// Available object templates
interface ObjectTemplate {
  id: string;
  name: string;
  type: 'primitive' | 'model' | 'light' | 'effect';
  icon: string;
  props?: Record<string, any>;
}

// Object instance in the scene
interface SceneObject {
  id: string;
  templateId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  name: string;
  properties: Record<string, any>;
}

// Default object templates
const objectTemplates: ObjectTemplate[] = [
  {
    id: 'cube',
    name: 'Cube',
    type: 'primitive',
    icon: '📦',
    props: { size: 1 }
  },
  {
    id: 'sphere',
    name: 'Sphere',
    type: 'primitive',
    icon: '🔵',
    props: { radius: 0.5, widthSegments: 16, heightSegments: 16 }
  },
  {
    id: 'cylinder',
    name: 'Cylinder',
    type: 'primitive',
    icon: '🧪',
    props: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 16 }
  },
  {
    id: 'cone',
    name: 'Cone',
    type: 'primitive',
    icon: '🔺',
    props: { radius: 0.5, height: 1, radialSegments: 16 }
  },
  {
    id: 'torus',
    name: 'Torus',
    type: 'primitive',
    icon: '🍩',
    props: { radius: 0.5, tube: 0.2, radialSegments: 16, tubularSegments: 32 }
  },
  {
    id: 'directionalLight',
    name: 'Directional Light',
    type: 'light',
    icon: '☀️',
    props: { intensity: 1, color: '#ffffff' }
  },
  {
    id: 'pointLight',
    name: 'Point Light',
    type: 'light',
    icon: '💡',
    props: { intensity: 1, distance: 10, color: '#ffffff' }
  },
  {
    id: 'spotLight',
    name: 'Spot Light',
    type: 'light',
    icon: '🔦',
    props: { intensity: 1, distance: 10, angle: 0.3, penumbra: 0.5, color: '#ffffff' }
  },
  {
    id: 'particles',
    name: 'Particle System',
    type: 'effect',
    icon: '✨',
    props: { count: 100, size: 0.1, color: '#ffffff' }
  }
];

// Object component for rendering different types of objects
const ObjectInstance: React.FC<{ 
  object: SceneObject; 
  selected: boolean; 
  onClick: () => void; 
  onTransformChange: (position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
}> = ({ object, selected, onClick, onTransformChange }) => {
  const template = objectTemplates.find(t => t.id === object.templateId);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...object.position);
      meshRef.current.rotation.set(...object.rotation);
      meshRef.current.scale.set(...object.scale);
    }
  }, [object]);
  
  const handleTransform = () => {
    if (meshRef.current) {
      const position: [number, number, number] = [
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      ];
      
      const rotation: [number, number, number] = [
        meshRef.current.rotation.x,
        meshRef.current.rotation.y,
        meshRef.current.rotation.z
      ];
      
      const scale: [number, number, number] = [
        meshRef.current.scale.x,
        meshRef.current.scale.y,
        meshRef.current.scale.z
      ];
      
      onTransformChange(position, rotation, scale);
    }
  };
  
  const getMeshComponent = () => {
    if (!template) return null;
    
    switch (template.id) {
      case 'cube':
        return (
          <boxGeometry args={[template.props?.size || 1, template.props?.size || 1, template.props?.size || 1]} />
        );
      case 'sphere':
        return (
          <sphereGeometry args={[
            template.props?.radius || 0.5, 
            template.props?.widthSegments || 16, 
            template.props?.heightSegments || 16
          ]} />
        );
      case 'cylinder':
        return (
          <cylinderGeometry args={[
            template.props?.radiusTop || 0.5,
            template.props?.radiusBottom || 0.5,
            template.props?.height || 1,
            template.props?.radialSegments || 16
          ]} />
        );
      case 'cone':
        return (
          <coneGeometry args={[
            template.props?.radius || 0.5,
            template.props?.height || 1,
            template.props?.radialSegments || 16
          ]} />
        );
      case 'torus':
        return (
          <torusGeometry args={[
            template.props?.radius || 0.5,
            template.props?.tube || 0.2,
            template.props?.radialSegments || 16,
            template.props?.tubularSegments || 32
          ]} />
        );
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };
  
  if (template?.type === 'light') {
    // Render light objects differently
    return (
      <group position={object.position} rotation={object.rotation} onClick={onClick}>
        {template.id === 'directionalLight' && (
          <directionalLight 
            intensity={object.properties.intensity || template.props?.intensity} 
            color={object.color || template.props?.color}
          />
        )}
        {template.id === 'pointLight' && (
          <pointLight 
            intensity={object.properties.intensity || template.props?.intensity}
            distance={object.properties.distance || template.props?.distance}
            color={object.color || template.props?.color}
          />
        )}
        {template.id === 'spotLight' && (
          <spotLight 
            intensity={object.properties.intensity || template.props?.intensity}
            distance={object.properties.distance || template.props?.distance}
            angle={object.properties.angle || template.props?.angle}
            penumbra={object.properties.penumbra || template.props?.penumbra}
            color={object.color || template.props?.color}
          />
        )}
        
        {/* Helper sphere to visualize light position */}
        <mesh scale={[0.2, 0.2, 0.2]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={object.color || "#ffff00"} wireframe />
        </mesh>
      </group>
    );
  }
  
  if (template?.type === 'effect') {
    // Render particle system
    return (
      <group position={object.position} rotation={object.rotation} onClick={onClick}>
        <points>
          <bufferGeometry>
            <float32BufferAttribute 
              attachObject={['attributes', 'position']} 
              args={[new Float32Array(Array.from({ length: (object.properties.count || 100) * 3 }, () => (Math.random() - 0.5) * 2)), 3]} 
            />
          </bufferGeometry>
          <pointsMaterial 
            size={object.properties.size || 0.1} 
            color={object.color || object.properties.color || '#ffffff'}
          />
        </points>
      </group>
    );
  }
  
  return (
    <>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerMissed={(e) => e.type === 'click'}
      >
        {getMeshComponent()}
        <meshStandardMaterial 
          color={object.color || "#4285f4"} 
          wireframe={selected}
        />
      </mesh>
      
      {selected && (
        <TransformControls
          object={meshRef}
          mode="translate"
          onMouseUp={handleTransform}
          onKeyUp={handleTransform}
        />
      )}
    </>
  );
};

// Properties panel for selected object
const PropertiesPanel: React.FC<{
  object: SceneObject | null;
  onUpdate: (updated: Partial<SceneObject>) => void;
  onDelete: () => void;
}> = ({ object, onUpdate, onDelete }) => {
  if (!object) {
    return (
      <div className="properties-panel">
        <h3>Properties</h3>
        <p className="no-selection">No object selected</p>
      </div>
    );
  }
  
  const template = objectTemplates.find(t => t.id === object.templateId);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ color: e.target.value });
  };
  
  const handlePropertyChange = (key: string, value: any) => {
    onUpdate({ 
      properties: { 
        ...object.properties, 
        [key]: value 
      } 
    });
  };
  
  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      
      <div className="property-group">
        <h4>General</h4>
        
        <div className="property-row">
          <label>Name</label>
          <input type="text" value={object.name} onChange={handleNameChange} />
        </div>
        
        <div className="property-row">
          <label>Type</label>
          <input type="text" value={template?.name || ''} disabled />
        </div>
        
        <div className="property-row">
          <label>Position</label>
          <div className="vector-inputs">
            <input 
              type="number" 
              value={object.position[0].toFixed(2)} 
              onChange={(e) => onUpdate({ position: [parseFloat(e.target.value), object.position[1], object.position[2]] })}
              step="0.1"
            />
            <input 
              type="number" 
              value={object.position[1].toFixed(2)} 
              onChange={(e) => onUpdate({ position: [object.position[0], parseFloat(e.target.value), object.position[2]] })}
              step="0.1"
            />
            <input 
              type="number" 
              value={object.position[2].toFixed(2)} 
              onChange={(e) => onUpdate({ position: [object.position[0], object.position[1], parseFloat(e.target.value)] })}
              step="0.1"
            />
          </div>
        </div>
        
        <div className="property-row">
          <label>Rotation</label>
          <div className="vector-inputs">
            <input 
              type="number" 
              value={(object.rotation[0] * 180 / Math.PI).toFixed(0)} 
              onChange={(e) => onUpdate({ rotation: [parseFloat(e.target.value) * Math.PI / 180, object.rotation[1], object.rotation[2]] })}
              step="15"
            />
            <input 
              type="number" 
              value={(object.rotation[1] * 180 / Math.PI).toFixed(0)} 
              onChange={(e) => onUpdate({ rotation: [object.rotation[0], parseFloat(e.target.value) * Math.PI / 180, object.rotation[2]] })}
              step="15"
            />
            <input 
              type="number" 
              value={(object.rotation[2] * 180 / Math.PI).toFixed(0)} 
              onChange={(e) => onUpdate({ rotation: [object.rotation[0], object.rotation[1], parseFloat(e.target.value) * Math.PI / 180] })}
              step="15"
            />
          </div>
        </div>
        
        <div className="property-row">
          <label>Scale</label>
          <div className="vector-inputs">
            <input 
              type="number" 
              value={object.scale[0].toFixed(2)} 
              onChange={(e) => onUpdate({ scale: [parseFloat(e.target.value), object.scale[1], object.scale[2]] })}
              step="0.1"
              min="0.1"
            />
            <input 
              type="number" 
              value={object.scale[1].toFixed(2)} 
              onChange={(e) => onUpdate({ scale: [object.scale[0], parseFloat(e.target.value), object.scale[2]] })}
              step="0.1"
              min="0.1"
            />
            <input 
              type="number" 
              value={object.scale[2].toFixed(2)} 
              onChange={(e) => onUpdate({ scale: [object.scale[0], object.scale[1], parseFloat(e.target.value)] })}
              step="0.1"
              min="0.1"
            />
          </div>
        </div>
        
        <div className="property-row">
          <label>Color</label>
          <input 
            type="color" 
            value={object.color || "#4285f4"} 
            onChange={handleColorChange} 
          />
        </div>
      </div>
      
      {/* Specific properties based on object type */}
      {template?.type === 'light' && (
        <div className="property-group">
          <h4>Light Properties</h4>
          
          <div className="property-row">
            <label>Intensity</label>
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="0.1" 
              value={object.properties.intensity || 1} 
              onChange={(e) => handlePropertyChange('intensity', parseFloat(e.target.value))} 
            />
            <span>{(object.properties.intensity || 1).toFixed(1)}</span>
          </div>
          
          {(template.id === 'pointLight' || template.id === 'spotLight') && (
            <div className="property-row">
              <label>Distance</label>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="1" 
                value={object.properties.distance || 10} 
                onChange={(e) => handlePropertyChange('distance', parseFloat(e.target.value))} 
              />
              <span>{(object.properties.distance || 10).toFixed(0)}</span>
            </div>
          )}
          
          {template.id === 'spotLight' && (
            <>
              <div className="property-row">
                <label>Angle</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1.57" 
                  step="0.1" 
                  value={object.properties.angle || 0.3} 
                  onChange={(e) => handlePropertyChange('angle', parseFloat(e.target.value))} 
                />
                <span>{Math.round((object.properties.angle || 0.3) * 180 / Math.PI)}°</span>
              </div>
              
              <div className="property-row">
                <label>Penumbra</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={object.properties.penumbra || 0.5} 
                  onChange={(e) => handlePropertyChange('penumbra', parseFloat(e.target.value))} 
                />
                <span>{(object.properties.penumbra || 0.5).toFixed(1)}</span>
              </div>
            </>
          )}
        </div>
      )}
      
      {template?.type === 'effect' && template.id === 'particles' && (
        <div className="property-group">
          <h4>Particle Properties</h4>
          
          <div className="property-row">
            <label>Count</label>
            <input 
              type="range" 
              min="10" 
              max="1000" 
              step="10" 
              value={object.properties.count || 100} 
              onChange={(e) => handlePropertyChange('count', parseInt(e.target.value))} 
            />
            <span>{object.properties.count || 100}</span>
          </div>
          
          <div className="property-row">
            <label>Size</label>
            <input 
              type="range" 
              min="0.01" 
              max="1" 
              step="0.01" 
              value={object.properties.size || 0.1} 
              onChange={(e) => handlePropertyChange('size', parseFloat(e.target.value))} 
            />
            <span>{(object.properties.size || 0.1).toFixed(2)}</span>
          </div>
        </div>
      )}
      
      <button className="delete-btn" onClick={onDelete}>
        Delete Object
      </button>
    </div>
  );
};

// Scene component
const Scene: React.FC<{
  objects: SceneObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, updates: Partial<SceneObject>) => void;
}> = ({ objects, selectedObjectId, onSelectObject, onUpdateObject }) => {
  const { gl, viewport } = useThree();
  
  const handlePlaneClick = (e: THREE.Event) => {
    e.stopPropagation();
    onSelectObject(null);
  };
  
  const handleObjectTransform = (objectId: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => {
    onUpdateObject(objectId, { position, rotation, scale });
  };
  
  return (
    <>
      {/* Ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow 
        onClick={handlePlaneClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#cccccc" 
          roughness={1} 
          metalness={0}
        />
      </mesh>
      
      {/* Grid helper */}
      <Grid 
        infiniteGrid 
        cellSize={1} 
        sectionSize={10} 
        fadeDistance={50}
        fadeStrength={1.5}
        cellThickness={0.5}
        sectionThickness={1}
        cellColor="#888888"
        sectionColor="#444444"
      />
      
      {/* Scene objects */}
      {objects.map(object => (
        <ObjectInstance 
          key={object.id} 
          object={object} 
          selected={selectedObjectId === object.id}
          onClick={() => onSelectObject(object.id)} 
          onTransformChange={(position, rotation, scale) => handleObjectTransform(object.id, position, rotation, scale)}
        />
      ))}
      
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} castShadow />
    </>
  );
};

// Main object placement component
const ObjectPlacement: React.FC = () => {
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState<ObjectTemplate | null>(null);
  
  // Get selected object
  const selectedObject = selectedObjectId 
    ? objects.find(obj => obj.id === selectedObjectId) || null 
    : null;
  
  // Add a new object to the scene
  const handleAddObject = (templateId: string, position: [number, number, number] = [0, 0, 0]) => {
    const template = objectTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const newObject: SceneObject = {
      id: `obj_${Date.now()}`,
      templateId,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      name: `${template.name} ${objects.length + 1}`,
      properties: template.props || {},
    };
    
    setObjects([...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };
  
  // Update object properties
  const handleUpdateObject = (id: string, updates: Partial<SceneObject>) => {
    setObjects(objects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  };
  
  // Delete an object
  const handleDeleteObject = () => {
    if (!selectedObjectId) return;
    setObjects(objects.filter(obj => obj.id !== selectedObjectId));
    setSelectedObjectId(null);
  };
  
  // Handle template drag start
  const handleDragStart = (template: ObjectTemplate) => {
    setIsDraggingTemplate(true);
    setDraggedTemplate(template);
  };
  
  // Handle template drop in canvas
  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!draggedTemplate) return;
    
    // Calculate drop position in 3D space
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 20 - 10;
    const z = ((e.clientY - rect.top) / rect.height) * 20 - 10;
    
    handleAddObject(draggedTemplate.id, [x, 0, z]);
    
    setIsDraggingTemplate(false);
    setDraggedTemplate(null);
  };
  
  return (
    <div className="object-placement">
      <div className="object-templates">
        <h2>Objects</h2>
        
        <div className="template-categories">
          <div className="template-category">
            <h3>Primitives</h3>
            <div className="template-list">
              {objectTemplates.filter(t => t.type === 'primitive').map(template => (
                <div 
                  key={template.id}
                  className="object-template"
                  draggable
                  onDragStart={(e) => handleDragStart(template)}
                  onClick={() => handleAddObject(template.id)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <span>{template.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="template-category">
            <h3>Lights</h3>
            <div className="template-list">
              {objectTemplates.filter(t => t.type === 'light').map(template => (
                <div 
                  key={template.id}
                  className="object-template"
                  draggable
                  onDragStart={(e) => handleDragStart(template)}
                  onClick={() => handleAddObject(template.id)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <span>{template.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="template-category">
            <h3>Effects</h3>
            <div className="template-list">
              {objectTemplates.filter(t => t.type === 'effect').map(template => (
                <div 
                  key={template.id}
                  className="object-template"
                  draggable
                  onDragStart={(e) => handleDragStart(template)}
                  onClick={() => handleAddObject(template.id)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <span>{template.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="template-category">
            <h3>AI Assisted</h3>
            <div className="template-list">
              <button className="ai-generate-object">
                🤖 Generate Object with AI
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="object-canvas" 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
      >
        <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
          <Scene 
            objects={objects} 
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
            onUpdateObject={handleUpdateObject}
          />
          <OrbitControls />
        </Canvas>
        
        {isDraggingTemplate && (
          <div className="drag-helper">
            Drop to place object
          </div>
        )}
      </div>
      
      <PropertiesPanel 
        object={selectedObject} 
        onUpdate={(updates) => selectedObjectId && handleUpdateObject(selectedObjectId, updates)}
        onDelete={handleDeleteObject}
      />
    </div>
  );
};

export default ObjectPlacement; 