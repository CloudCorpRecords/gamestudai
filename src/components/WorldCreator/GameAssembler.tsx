import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Html, useHelper } from '@react-three/drei';
import { FaPlay, FaPause, FaStop, FaSave, FaFolder, FaCog, FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import './GameAssembler.css';

// Types for game objects
interface GameObjectTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  prefab: string;
  description: string;
}

interface GameObjectInstance {
  id: string;
  templateId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  locked: boolean;
  properties: Record<string, any>;
  components: GameComponent[];
}

interface GameComponent {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  enabled: boolean;
}

// Mock data for templates
const TEMPLATE_CATEGORIES = [
  'Characters', 'Environment', 'Props', 'Lights', 'Effects', 'UI', 'Gameplay'
];

const OBJECT_TEMPLATES: GameObjectTemplate[] = [
  {
    id: 'template_character_player',
    name: 'Player Character',
    category: 'Characters',
    thumbnail: '/assets/thumbnails/player.png',
    prefab: 'character_player',
    description: 'Default player character with basic movement controls'
  },
  {
    id: 'template_env_platform',
    name: 'Platform',
    category: 'Environment',
    thumbnail: '/assets/thumbnails/platform.png',
    prefab: 'env_platform',
    description: 'Basic platform for characters to stand on'
  },
  {
    id: 'template_prop_crate',
    name: 'Crate',
    category: 'Props',
    thumbnail: '/assets/thumbnails/crate.png',
    prefab: 'prop_crate',
    description: 'Destructible crate that can contain items'
  },
  {
    id: 'template_light_point',
    name: 'Point Light',
    category: 'Lights',
    thumbnail: '/assets/thumbnails/point_light.png',
    prefab: 'light_point',
    description: 'Omnidirectional light source'
  },
  {
    id: 'template_effect_particle',
    name: 'Particle System',
    category: 'Effects',
    thumbnail: '/assets/thumbnails/particles.png',
    prefab: 'effect_particle',
    description: 'Customizable particle effect system'
  },
  {
    id: 'template_ui_button',
    name: 'Button',
    category: 'UI',
    thumbnail: '/assets/thumbnails/button.png',
    prefab: 'ui_button',
    description: 'Interactive button for user interfaces'
  },
  {
    id: 'template_gameplay_trigger',
    name: 'Trigger Volume',
    category: 'Gameplay',
    thumbnail: '/assets/thumbnails/trigger.png',
    prefab: 'gameplay_trigger',
    description: 'Volume that triggers events when objects enter or exit'
  }
];

// Component for a single 3D object in the scene
const GameObjectMesh: React.FC<{
  object: GameObjectInstance;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updatedObject: GameObjectInstance) => void;
}> = ({ object, isSelected, onSelect, onUpdate }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate a simple mesh based on the template
  const getMeshForTemplate = (templateId: string) => {
    // In a real implementation, this would load the actual model
    // For now, we'll use simple geometries
    switch (templateId) {
      case 'template_character_player':
        return (
          <>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial color="#4285F4" />
          </>
        );
      case 'template_env_platform':
        return (
          <>
            <boxGeometry args={[4, 0.5, 4]} />
            <meshStandardMaterial color="#34A853" />
          </>
        );
      case 'template_prop_crate':
        return (
          <>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FBBC05" />
          </>
        );
      case 'template_light_point':
        return (
          <>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={2} />
          </>
        );
      case 'template_effect_particle':
        return (
          <>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#EA4335" transparent opacity={0.7} />
          </>
        );
      case 'template_ui_button':
        return (
          <>
            <boxGeometry args={[2, 0.5, 0.1]} />
            <meshStandardMaterial color="#4285F4" />
          </>
        );
      case 'template_gameplay_trigger':
        return (
          <>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#EA4335" transparent opacity={0.3} />
          </>
        );
      default:
        return (
          <>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gray" />
          </>
        );
    }
  };
  
  return (
    <mesh
      ref={meshRef}
      position={object.position}
      rotation={new THREE.Euler(...object.rotation)}
      scale={object.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      visible={object.visible}
    >
      {getMeshForTemplate(object.templateId)}
      
      {/* Selection outline */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry attach="geometry" args={[meshRef.current?.geometry]} />
          <lineBasicMaterial attach="material" color="cyan" />
        </lineSegments>
      )}
      
      {/* Object label */}
      {isSelected && (
        <Html position={[0, 1.5, 0]} center>
          <div className="object-label">{object.name}</div>
        </Html>
      )}
    </mesh>
  );
};

// Transform controls wrapper
const ObjectTransformControls: React.FC<{
  object: GameObjectInstance;
  mode: 'translate' | 'rotate' | 'scale';
  onUpdate: (updatedObject: GameObjectInstance) => void;
}> = ({ object, mode, onUpdate }) => {
  const controlsRef = useRef<any>(null);
  const { camera, scene } = useThree();
  
  // Create a dummy object to attach the transform controls to
  const dummyObject = useRef(new THREE.Object3D());
  
  useEffect(() => {
    // Set the dummy object's transform to match the game object
    dummyObject.current.position.set(...object.position);
    dummyObject.current.rotation.set(...object.rotation);
    dummyObject.current.scale.set(...object.scale);
    
    // Add it to the scene
    scene.add(dummyObject.current);
    
    return () => {
      scene.remove(dummyObject.current);
    };
  }, [object, scene]);
  
  // Update the game object when the transform changes
  useFrame(() => {
    if (dummyObject.current) {
      const newPosition: [number, number, number] = [
        dummyObject.current.position.x,
        dummyObject.current.position.y,
        dummyObject.current.position.z
      ];
      
      const newRotation: [number, number, number] = [
        dummyObject.current.rotation.x,
        dummyObject.current.rotation.y,
        dummyObject.current.rotation.z
      ];
      
      const newScale: [number, number, number] = [
        dummyObject.current.scale.x,
        dummyObject.current.scale.y,
        dummyObject.current.scale.z
      ];
      
      // Only update if something changed
      if (
        newPosition.some((v, i) => v !== object.position[i]) ||
        newRotation.some((v, i) => v !== object.rotation[i]) ||
        newScale.some((v, i) => v !== object.scale[i])
      ) {
        onUpdate({
          ...object,
          position: newPosition,
          rotation: newRotation,
          scale: newScale
        });
      }
    }
  });
  
  return (
    <TransformControls
      ref={controlsRef}
      object={dummyObject.current}
      mode={mode}
      size={0.75}
      showX={true}
      showY={true}
      showZ={true}
    />
  );
};

// Scene component
const GameScene: React.FC<{
  objects: GameObjectInstance[];
  selectedObjectId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updatedObject: GameObjectInstance) => void;
}> = ({ objects, selectedObjectId, transformMode, onSelectObject, onUpdateObject }) => {
  // Clear selection when clicking on empty space
  const handleBackgroundClick = () => {
    onSelectObject(null);
  };
  
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      {/* Grid */}
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        sectionSize={3}
        sectionThickness={1}
        fadeDistance={50}
        fadeStrength={1.5}
      />
      
      {/* Game objects */}
      <group onClick={handleBackgroundClick}>
        {objects.map((obj) => (
          <GameObjectMesh
            key={obj.id}
            object={obj}
            isSelected={obj.id === selectedObjectId}
            onSelect={() => onSelectObject(obj.id)}
            onUpdate={onUpdateObject}
          />
        ))}
      </group>
      
      {/* Transform controls for selected object */}
      {selectedObjectId && (
        <ObjectTransformControls
          object={objects.find(obj => obj.id === selectedObjectId)!}
          mode={transformMode}
          onUpdate={onUpdateObject}
        />
      )}
    </>
  );
};

// Main component
const GameAssembler: React.FC = () => {
  // State
  const [objects, setObjects] = useState<GameObjectInstance[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showComponentPanel, setShowComponentPanel] = useState<boolean>(true);
  
  // Get the selected object
  const selectedObject = selectedObjectId 
    ? objects.find(obj => obj.id === selectedObjectId) 
    : null;
  
  // Filter templates by category and search query
  const filteredTemplates = OBJECT_TEMPLATES.filter(template => {
    const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Add a new object to the scene
  const handleAddObject = (template: GameObjectTemplate) => {
    const newObject: GameObjectInstance = {
      id: `object_${Date.now()}`,
      templateId: template.id,
      name: template.name,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: false,
      properties: {},
      components: []
    };
    
    setObjects([...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };
  
  // Update an object
  const handleUpdateObject = (updatedObject: GameObjectInstance) => {
    setObjects(objects.map(obj => 
      obj.id === updatedObject.id ? updatedObject : obj
    ));
  };
  
  // Delete the selected object
  const handleDeleteObject = () => {
    if (selectedObjectId) {
      setObjects(objects.filter(obj => obj.id !== selectedObjectId));
      setSelectedObjectId(null);
    }
  };
  
  // Toggle object visibility
  const handleToggleVisibility = () => {
    if (selectedObject) {
      handleUpdateObject({
        ...selectedObject,
        visible: !selectedObject.visible
      });
    }
  };
  
  // Toggle play mode
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Update object property
  const handleUpdateProperty = (key: string, value: any) => {
    if (selectedObject) {
      handleUpdateObject({
        ...selectedObject,
        properties: {
          ...selectedObject.properties,
          [key]: value
        }
      });
    }
  };
  
  // Add a component to the selected object
  const handleAddComponent = (componentType: string) => {
    if (selectedObject) {
      const newComponent: GameComponent = {
        id: `component_${Date.now()}`,
        type: componentType,
        name: componentType,
        properties: {},
        enabled: true
      };
      
      handleUpdateObject({
        ...selectedObject,
        components: [...selectedObject.components, newComponent]
      });
    }
  };
  
  // Remove a component from the selected object
  const handleRemoveComponent = (componentId: string) => {
    if (selectedObject) {
      handleUpdateObject({
        ...selectedObject,
        components: selectedObject.components.filter(comp => comp.id !== componentId)
      });
    }
  };
  
  return (
    <div className="game-assembler">
      {/* Left panel - Object templates */}
      <div className="template-panel">
        <div className="panel-header">
          <h3>Game Objects</h3>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search objects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="category-tabs">
          <button 
            className={activeCategory === 'All' ? 'active' : ''}
            onClick={() => setActiveCategory('All')}
          >
            All
          </button>
          {TEMPLATE_CATEGORIES.map(category => (
            <button
              key={category}
              className={activeCategory === category ? 'active' : ''}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="template-list">
          {filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className="template-item"
              onClick={() => handleAddObject(template)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('template', template.id);
              }}
            >
              <div className="template-icon">
                <img src={template.thumbnail} alt={template.name} />
              </div>
              <div className="template-info">
                <div className="template-name">{template.name}</div>
                <div className="template-category">{template.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Center panel - 3D viewport */}
      <div className="viewport-panel">
        <div className="viewport-toolbar">
          <div className="transform-tools">
            <button 
              className={transformMode === 'translate' ? 'active' : ''}
              onClick={() => setTransformMode('translate')}
              title="Move (W)"
            >
              Move
            </button>
            <button 
              className={transformMode === 'rotate' ? 'active' : ''}
              onClick={() => setTransformMode('rotate')}
              title="Rotate (E)"
            >
              Rotate
            </button>
            <button 
              className={transformMode === 'scale' ? 'active' : ''}
              onClick={() => setTransformMode('scale')}
              title="Scale (R)"
            >
              Scale
            </button>
          </div>
          
          <div className="object-tools">
            <button 
              onClick={handleToggleVisibility}
              disabled={!selectedObjectId}
              title="Toggle Visibility"
            >
              {selectedObject?.visible ? <FaEye /> : <FaEyeSlash />}
            </button>
            <button 
              onClick={handleDeleteObject}
              disabled={!selectedObjectId}
              title="Delete Object (Del)"
            >
              <FaTrash />
            </button>
          </div>
          
          <div className="playback-tools">
            <button 
              className={isPlaying ? 'active' : ''}
              onClick={handleTogglePlay}
              title={isPlaying ? 'Stop (Esc)' : 'Play (F5)'}
            >
              {isPlaying ? <FaStop /> : <FaPlay />}
            </button>
          </div>
        </div>
        
        <div className="viewport-container">
          <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
            <GameScene
              objects={objects}
              selectedObjectId={selectedObjectId}
              transformMode={transformMode}
              onSelectObject={setSelectedObjectId}
              onUpdateObject={handleUpdateObject}
            />
            <OrbitControls />
          </Canvas>
          
          {isPlaying && (
            <div className="play-overlay">
              <button onClick={handleTogglePlay}>
                <FaStop /> Stop
              </button>
            </div>
          )}
        </div>
        
        <div className="viewport-status">
          {selectedObject ? (
            <span>Selected: {selectedObject.name}</span>
          ) : (
            <span>No object selected</span>
          )}
        </div>
      </div>
      
      {/* Right panel - Properties */}
      <div className={`properties-panel ${showComponentPanel ? '' : 'collapsed'}`}>
        <div className="panel-header">
          <h3>Properties</h3>
          <button 
            className="toggle-panel-btn"
            onClick={() => setShowComponentPanel(!showComponentPanel)}
          >
            {showComponentPanel ? '>' : '<'}
          </button>
        </div>
        
        {selectedObject ? (
          <div className="properties-content">
            <div className="property-section">
              <h4>Transform</h4>
              
              <div className="property-group">
                <label>Position</label>
                <div className="vector3-input">
                  <div className="vector-component">
                    <label>X</label>
                    <input
                      type="number"
                      value={selectedObject.position[0]}
                      onChange={(e) => {
                        const newPosition: [number, number, number] = [...selectedObject.position];
                        newPosition[0] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          position: newPosition
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Y</label>
                    <input
                      type="number"
                      value={selectedObject.position[1]}
                      onChange={(e) => {
                        const newPosition: [number, number, number] = [...selectedObject.position];
                        newPosition[1] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          position: newPosition
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Z</label>
                    <input
                      type="number"
                      value={selectedObject.position[2]}
                      onChange={(e) => {
                        const newPosition: [number, number, number] = [...selectedObject.position];
                        newPosition[2] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          position: newPosition
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="property-group">
                <label>Rotation</label>
                <div className="vector3-input">
                  <div className="vector-component">
                    <label>X</label>
                    <input
                      type="number"
                      value={selectedObject.rotation[0]}
                      onChange={(e) => {
                        const newRotation: [number, number, number] = [...selectedObject.rotation];
                        newRotation[0] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          rotation: newRotation
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Y</label>
                    <input
                      type="number"
                      value={selectedObject.rotation[1]}
                      onChange={(e) => {
                        const newRotation: [number, number, number] = [...selectedObject.rotation];
                        newRotation[1] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          rotation: newRotation
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Z</label>
                    <input
                      type="number"
                      value={selectedObject.rotation[2]}
                      onChange={(e) => {
                        const newRotation: [number, number, number] = [...selectedObject.rotation];
                        newRotation[2] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          rotation: newRotation
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="property-group">
                <label>Scale</label>
                <div className="vector3-input">
                  <div className="vector-component">
                    <label>X</label>
                    <input
                      type="number"
                      value={selectedObject.scale[0]}
                      onChange={(e) => {
                        const newScale: [number, number, number] = [...selectedObject.scale];
                        newScale[0] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          scale: newScale
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Y</label>
                    <input
                      type="number"
                      value={selectedObject.scale[1]}
                      onChange={(e) => {
                        const newScale: [number, number, number] = [...selectedObject.scale];
                        newScale[1] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          scale: newScale
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Z</label>
                    <input
                      type="number"
                      value={selectedObject.scale[2]}
                      onChange={(e) => {
                        const newScale: [number, number, number] = [...selectedObject.scale];
                        newScale[2] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          scale: newScale
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="property-section">
              <h4>Object</h4>
              
              <div className="property-group">
                <label>Name</label>
                <input
                  type="text"
                  value={selectedObject.name}
                  onChange={(e) => {
                    handleUpdateObject({
                      ...selectedObject,
                      name: e.target.value
                    });
                  }}
                />
              </div>
              
              <div className="property-group">
                <label>Visible</label>
                <input
                  type="checkbox"
                  checked={selectedObject.visible}
                  onChange={(e) => {
                    handleUpdateObject({
                      ...selectedObject,
                      visible: e.target.checked
                    });
                  }}
                />
              </div>
              
              <div className="property-group">
                <label>Locked</label>
                <input
                  type="checkbox"
                  checked={selectedObject.locked}
                  onChange={(e) => {
                    handleUpdateObject({
                      ...selectedObject,
                      locked: e.target.checked
                    });
                  }}
                />
              </div>
            </div>
            
            <div className="property-section">
              <div className="section-header">
                <h4>Components</h4>
                <button 
                  className="add-component-btn"
                  onClick={() => handleAddComponent('Physics')}
                >
                  <FaPlus /> Add
                </button>
              </div>
              
              {selectedObject.components.length > 0 ? (
                <div className="component-list">
                  {selectedObject.components.map(component => (
                    <div key={component.id} className="component-item">
                      <div className="component-header">
                        <span className="component-name">{component.name}</span>
                        <div className="component-controls">
                          <input
                            type="checkbox"
                            checked={component.enabled}
                            onChange={(e) => {
                              const updatedComponents = selectedObject.components.map(comp =>
                                comp.id === component.id
                                  ? { ...comp, enabled: e.target.checked }
                                  : comp
                              );
                              
                              handleUpdateObject({
                                ...selectedObject,
                                components: updatedComponents
                              });
                            }}
                          />
                          <button
                            className="remove-component-btn"
                            onClick={() => handleRemoveComponent(component.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      
                      <div className="component-properties">
                        {/* Component-specific properties would go here */}
                        <div className="property-group">
                          <label>Example Property</label>
                          <input type="text" placeholder="Value" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-components">
                  <p>No components added</p>
                  <button onClick={() => handleAddComponent('Physics')}>
                    <FaPlus /> Add Component
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <p>No object selected</p>
            <p>Click on an object in the scene or drag an object from the library</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameAssembler; 