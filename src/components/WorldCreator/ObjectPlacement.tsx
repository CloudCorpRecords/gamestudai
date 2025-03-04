import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { nanoid } from 'nanoid';
import { FaTrash, FaClone, FaCircle, FaCube, FaCylinder, FaFire, FaBox, FaBars, FaPlus, FaArrowsAlt } from 'react-icons/fa';
import { PhysicsSystem, usePhysics, CollisionShape, BodyType, PhysicsMaterial, DEFAULT_PHYSICAL_PROPERTIES, PhysicalProperties } from '../../systems/PhysicsSystem';

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
  physics: PhysicalProperties;
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
  physics: PhysicsSystem;
}> = ({ object, selected, onClick, onTransformChange, physics }) => {
  const template = objectTemplates.find(t => t.id === object.templateId);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...object.position);
      meshRef.current.rotation.set(...object.rotation);
      meshRef.current.scale.set(...object.scale);
    }
  }, [object]);
  
  useEffect(() => {
    if (!meshRef.current || !object.physics.enabled) return;
    
    try {
      if (physics.bodies.has(object.id)) {
        physics.removeBody(object.id);
      }
      
      physics.createBody(object.id, meshRef.current, object.physics);
    } catch (e) {
      console.error("Failed to create physics body:", e);
    }
    
    return () => {
      physics.removeBody(object.id);
    };
  }, [object.id, object.physics, physics, meshRef.current]);
  
  useEffect(() => {
    if (!meshRef.current || !object.physics.enabled) return;
    
    if (object.physics.bodyType === BodyType.DYNAMIC || 
        object.physics.bodyType === BodyType.SIMULATED) {
      const sync = () => {
        if (meshRef.current && !selected) {
          physics.syncMeshWithBody(meshRef.current, object.id);
        }
        requestAnimationFrame(sync);
      };
      
      const syncId = requestAnimationFrame(sync);
      return () => {
        cancelAnimationFrame(syncId);
      };
    }
  }, [object.id, object.physics, physics, selected]);
  
  const handleTransform = () => {
    if (!meshRef.current) return;
    
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
    
    if (object.physics.enabled) {
      const body = physics.bodies.get(object.id);
      if (body) {
        body.position.set(position[0], position[1], position[2]);
        body.quaternion.setFromEuler(rotation[0], rotation[1], rotation[2]);
        
        body.wakeUp();
      }
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
  
  const showPhysicsWireframe = object.physics.enabled && !selected;
  
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
      
      {showPhysicsWireframe && (
        <mesh position={object.position} rotation={object.rotation} scale={object.scale}>
          {getPhysicsDebugGeometry(object.physics.shape, template)}
          <meshBasicMaterial color="#00ff00" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
      
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

// Helper to get debug wireframe geometry for physics visualization
const getPhysicsDebugGeometry = (shape: CollisionShape, template: ObjectTemplate | undefined) => {
  if (!template) return <boxGeometry args={[1, 1, 1]} />;
  
  switch (shape) {
    case CollisionShape.BOX:
      return (
        <boxGeometry args={[
          template.props?.size || 1, 
          template.props?.size || 1, 
          template.props?.size || 1
        ]} />
      );
    case CollisionShape.SPHERE:
      return (
        <sphereGeometry args={[
          template.props?.radius || 0.5, 
          8, 8
        ]} />
      );
    case CollisionShape.CYLINDER:
      return (
        <cylinderGeometry args={[
          template.props?.radiusTop || 0.5,
          template.props?.radiusBottom || 0.5,
          template.props?.height || 1,
          8
        ]} />
      );
    case CollisionShape.CAPSULE:
      return (
        <cylinderGeometry args={[
          template.props?.radius || 0.5,
          template.props?.radius || 0.5,
          template.props?.height || 1,
          8
        ]} />
      );
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
};

// Properties panel for selected object
const PropertiesPanel: React.FC<{
  object: SceneObject | null;
  onUpdate: (updated: Partial<SceneObject>) => void;
  onDelete: () => void;
}> = ({ object, onUpdate, onDelete }) => {
  if (!object) {
    return (
      <div className="properties-panel properties-panel-empty">
        <h3>Properties</h3>
        <p>Select an object to edit its properties</p>
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
  
  const handlePhysicsChange = (updates: Partial<PhysicalProperties>) => {
    onUpdate({
      physics: {
        ...object.physics,
        ...updates
      }
    });
  };

  const handlePhysicsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhysicsChange({ enabled: e.target.checked });
  };
  
  const handleBodyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handlePhysicsChange({ bodyType: e.target.value as BodyType });
  };
  
  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handlePhysicsChange({ material: e.target.value as PhysicsMaterial });
  };
  
  const handleCollisionShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handlePhysicsChange({ shape: e.target.value as CollisionShape });
  };
  
  const handleMassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhysicsChange({ mass: parseFloat(e.target.value) });
  };
  
  const handleFrictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhysicsChange({ friction: parseFloat(e.target.value) });
  };
  
  const handleRestitutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhysicsChange({ restitution: parseFloat(e.target.value) });
  };
  
  const handleLinearDampingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhysicsChange({ linearDamping: parseFloat(e.target.value) });
  };
  
  const handleAngularDampingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhysicsChange({ angularDamping: parseFloat(e.target.value) });
  };
  
  const handleFixedRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhysicsChange({ fixedRotation: e.target.checked });
  };
  
  const handleIsTriggerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhysicsChange({ isTrigger: e.target.checked });
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
      
      {/* Physics properties section */}
      <div className="property-group">
        <h4>Physics</h4>
        
        <div className="property-row">
          <label>Enable Physics</label>
          <input 
            type="checkbox" 
            checked={object.physics.enabled} 
            onChange={handlePhysicsToggle}
          />
        </div>
        
        {object.physics.enabled && (
          <>
            <div className="property-row">
              <label>Body Type</label>
              <select 
                value={object.physics.bodyType} 
                onChange={handleBodyTypeChange}
              >
                <option value={BodyType.STATIC}>Static (Immovable)</option>
                <option value={BodyType.DYNAMIC}>Dynamic (Fully Simulated)</option>
                <option value={BodyType.KINEMATIC}>Kinematic (User Controlled)</option>
                <option value={BodyType.SIMULATED}>Character (Physics Interaction)</option>
              </select>
            </div>
            
            <div className="property-row">
              <label>Collision Shape</label>
              <select 
                value={object.physics.shape} 
                onChange={handleCollisionShapeChange}
              >
                <option value={CollisionShape.BOX}>Box</option>
                <option value={CollisionShape.SPHERE}>Sphere</option>
                <option value={CollisionShape.CYLINDER}>Cylinder</option>
                <option value={CollisionShape.CAPSULE}>Capsule</option>
                <option value={CollisionShape.CONVEX_HULL}>Convex Hull</option>
                <option value={CollisionShape.COMPOUND}>Compound</option>
                <option value={CollisionShape.TRIMESH}>Trimesh (Complex)</option>
              </select>
            </div>
            
            <div className="property-row">
              <label>Material</label>
              <select 
                value={object.physics.material} 
                onChange={handleMaterialChange}
              >
                <option value={PhysicsMaterial.DEFAULT}>Default</option>
                <option value={PhysicsMaterial.METAL}>Metal</option>
                <option value={PhysicsMaterial.WOOD}>Wood</option>
                <option value={PhysicsMaterial.CONCRETE}>Concrete</option>
                <option value={PhysicsMaterial.PLASTIC}>Plastic</option>
                <option value={PhysicsMaterial.RUBBER}>Rubber</option>
                <option value={PhysicsMaterial.GLASS}>Glass</option>
                <option value={PhysicsMaterial.ICE}>Ice</option>
                <option value={PhysicsMaterial.WATER}>Water</option>
                <option value={PhysicsMaterial.FABRIC}>Fabric</option>
                <option value={PhysicsMaterial.SPONGE}>Sponge</option>
              </select>
            </div>
            
            {(object.physics.bodyType === BodyType.DYNAMIC || 
              object.physics.bodyType === BodyType.SIMULATED) && (
              <>
                <div className="property-row">
                  <label>Mass</label>
                  <input 
                    type="number" 
                    value={object.physics.mass} 
                    onChange={handleMassChange}
                    min="0.01"
                    step="0.1"
                  />
                </div>
                
                <div className="property-row">
                  <label>Friction</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={object.physics.friction} 
                    onChange={handleFrictionChange}
                  />
                  <span className="range-value">{object.physics.friction?.toFixed(2)}</span>
                </div>
                
                <div className="property-row">
                  <label>Bounciness</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={object.physics.restitution} 
                    onChange={handleRestitutionChange}
                  />
                  <span className="range-value">{object.physics.restitution?.toFixed(2)}</span>
                </div>
                
                <div className="property-row">
                  <label>Linear Damping</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={object.physics.linearDamping} 
                    onChange={handleLinearDampingChange}
                  />
                  <span className="range-value">{object.physics.linearDamping?.toFixed(2)}</span>
                </div>
                
                <div className="property-row">
                  <label>Angular Damping</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={object.physics.angularDamping} 
                    onChange={handleAngularDampingChange}
                  />
                  <span className="range-value">{object.physics.angularDamping?.toFixed(2)}</span>
                </div>
                
                <div className="property-row">
                  <label>Lock Rotation</label>
                  <input 
                    type="checkbox" 
                    checked={object.physics.fixedRotation} 
                    onChange={handleFixedRotationChange}
                  />
                </div>
              </>
            )}
            
            <div className="property-row">
              <label>Is Trigger</label>
              <input 
                type="checkbox" 
                checked={object.physics.isTrigger} 
                onChange={handleIsTriggerChange}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Specific properties based on object type */}
      {template && template.props && Object.keys(template.props).length > 0 && (
        <div className="property-group">
          <h4>{template.name} Properties</h4>
          
          {Object.entries(template.props).map(([key, defaultValue]) => (
            <div className="property-row" key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input 
                type={typeof defaultValue === 'number' ? 'number' : 'text'} 
                value={object.properties[key] !== undefined ? object.properties[key] : defaultValue} 
                onChange={(e) => {
                  const value = typeof defaultValue === 'number' ? parseFloat(e.target.value) : e.target.value;
                  handlePropertyChange(key, value);
                }}
                step={typeof defaultValue === 'number' ? '0.1' : undefined}
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="property-actions">
        <button className="delete-button" onClick={onDelete}>
          <FaTrash /> Delete
        </button>
        <button className="clone-button" onClick={() => {
          alert("Clone feature coming soon!");
        }}>
          <FaClone /> Clone
        </button>
      </div>
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
  const physics = usePhysics({ x: 0, y: -9.82, z: 0 }, true);
  
  useEffect(() => {
    let lastTime = 0;
    
    const updatePhysics = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      
      if (deltaTime > 0) {
        physics.update(deltaTime);
      }
      
      requestAnimationFrame(updatePhysics);
    };
    
    const animationId = requestAnimationFrame(updatePhysics);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [physics]);
  
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
          physics={physics}
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
      id: nanoid(),
      templateId,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      name: `${template.name} ${objects.length + 1}`,
      properties: template.props || {},
      physics: { ...DEFAULT_PHYSICAL_PROPERTIES }
    };
    
    // Set appropriate physics shape based on template
    switch (templateId) {
      case 'sphere':
        newObject.physics.shape = CollisionShape.SPHERE;
        break;
      case 'cylinder':
      case 'cone':
        newObject.physics.shape = CollisionShape.CYLINDER;
        break;
      default:
        newObject.physics.shape = CollisionShape.BOX;
    }
    
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