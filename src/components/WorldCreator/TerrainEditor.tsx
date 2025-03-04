import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Cloud, Plane, useTexture, ContactShadows, Environment as DreiEnvironment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { folder, button, useControls, Leva } from 'leva';
import './TerrainEditor.css';

// Generate a heightmap using improved noise algorithm
const generateHeightmap = (size: number, options: {
  roughness: number,
  persistence: number,
  lacunarity: number,
  octaves: number,
  seed: number,
  peakHeight: number,
  valleyDepth: number,
  plateauSize: number
}) => {
  const heightmap = new Float32Array(size * size);
  const seed = options.seed || Math.random() * 1000;
  const noise2D = createNoise2D();
  
  const { roughness, persistence, lacunarity, octaves, peakHeight, valleyDepth, plateauSize } = options;
  
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      // Convert to normalized coordinates
      const nx = x / size - 0.5;
      const nz = z / size - 0.5;
      
      let amplitude = 1;
      let frequency = 1;
      let noiseHeight = 0;
      
      // Apply multiple octaves of noise
      for (let o = 0; o < octaves; o++) {
        const sampleX = nx * frequency + seed;
        const sampleZ = nz * frequency + seed;
        
        const noiseValue = noise2D(sampleX, sampleZ) * 2 - 1;
        noiseHeight += noiseValue * amplitude;
        
        amplitude *= persistence;
        frequency *= lacunarity;
      }
      
      // Apply peak and valley modifiers
      const distFromCenter = Math.sqrt(nx * nx + nz * nz) * 2; // Normalized 0-1
      let height = noiseHeight * roughness;
      
      // Add peaks in the center region
      if (distFromCenter < plateauSize) {
        height += (plateauSize - distFromCenter) * peakHeight;
      }
      
      // Add valleys in the outer regions
      if (distFromCenter > 0.4) {
        height -= (distFromCenter - 0.4) * valleyDepth;
      }
      
      // Normalize to 0-1 range
      heightmap[z * size + x] = Math.max(0, Math.min(1, (height + 1) / 2));
    }
  }
  
  return heightmap;
};

// Terrain presets for quick terrain generation
const terrainPresets = {
  'mountainous': {
    roughness: 0.8,
    persistence: 0.5,
    lacunarity: 2.0,
    octaves: 6,
    peakHeight: 1.2,
    valleyDepth: 0.3,
    plateauSize: 0.2,
    materialId: 'rock'
  },
  'hills': {
    roughness: 0.5,
    persistence: 0.35,
    lacunarity: 1.8,
    octaves: 4,
    peakHeight: 0.5,
    valleyDepth: 0.2,
    plateauSize: 0.3,
    materialId: 'grass'
  },
  'desert': {
    roughness: 0.3,
    persistence: 0.45,
    lacunarity: 2.2,
    octaves: 3,
    peakHeight: 0.4,
    valleyDepth: 0.1,
    plateauSize: 0.5,
    materialId: 'desert'
  },
  'volcanic': {
    roughness: 0.7,
    persistence: 0.6,
    lacunarity: 2.5,
    octaves: 5,
    peakHeight: 1.5,
    valleyDepth: 0.8,
    plateauSize: 0.15,
    materialId: 'volcanic'
  },
  'plains': {
    roughness: 0.2,
    persistence: 0.3,
    lacunarity: 1.5,
    octaves: 2,
    peakHeight: 0.1,
    valleyDepth: 0.05,
    plateauSize: 0.8,
    materialId: 'grass'
  },
  'arctic': {
    roughness: 0.6,
    persistence: 0.4,
    lacunarity: 1.7,
    octaves: 4,
    peakHeight: 0.9,
    valleyDepth: 0.4,
    plateauSize: 0.25,
    materialId: 'snow'
  }
};

// Terrain mesh using the heightmap
interface TerrainProps {
  heightmap: Float32Array;
  size: number;
  heightScale: number;
  resolution: number;
  material: JSX.Element;
  wireframe: boolean;
}

const TerrainMesh: React.FC<TerrainProps> = ({ 
  heightmap, 
  size, 
  heightScale, 
  resolution,
  material,
  wireframe
}) => {
  const terrainRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (!terrainRef.current) return;
    
    const geometry = terrainRef.current.geometry as THREE.PlaneGeometry;
    const positions = geometry.attributes.position;
    
    // Safely handle the buffer attribute type - GLBufferAttribute has no array property
    if ('array' in positions) {
      const posArray = positions.array as Float32Array;
      const vertexCount = positions.count;
      
      // Apply heightmap to geometry
      for (let i = 0; i < vertexCount; i++) {
        // Get the current x, z coordinates (y is up in Three.js)
        const x = posArray[i * 3]; 
        const z = posArray[i * 3 + 2];
        
        // Convert to heightmap coordinates
        const hx = Math.floor((x + size/2) / size * resolution);
        const hz = Math.floor((z + size/2) / size * resolution);
        
        if (hx >= 0 && hx < resolution && hz >= 0 && hz < resolution) {
          const heightIndex = hz * resolution + hx;
          const height = heightmap[heightIndex] * heightScale;
          // Update the y-coordinate (height)
          posArray[i * 3 + 1] = height;
        }
      }
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }, [heightmap, size, heightScale, resolution]);
  
  return (
    <mesh 
      ref={terrainRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow 
      castShadow
    >
      <planeGeometry args={[size, size, resolution - 1, resolution - 1]} />
      {material}
      {wireframe && (
        <lineSegments>
          <wireframeGeometry attach="geometry" args={[terrainRef.current?.geometry || new THREE.BoxGeometry()]} />
          <lineBasicMaterial attach="material" color="#000000" opacity={0.2} transparent />
        </lineSegments>
      )}
    </mesh>
  );
};

// Environment setup component with enhanced visual effects
const Environment: React.FC<{ 
  sunPosition: [number, number, number],
  cloudCoverage: number,
  cloudColor: string,
  fogColor: string,
  fogDensity: number,
  environmentPreset: string
}> = ({ 
  sunPosition, 
  cloudCoverage, 
  cloudColor,
  fogColor,
  fogDensity,
  environmentPreset
}) => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={sunPosition} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <Sky 
        sunPosition={new THREE.Vector3(...sunPosition)}
        turbidity={10}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      
      <fog attach="fog" args={[fogColor, 0.01, 100 * fogDensity]} />
      
      <DreiEnvironment preset={environmentPreset as any} />
      
      {Array.from({ length: Math.floor(cloudCoverage * 20) }).map((_, i) => (
        <Cloud 
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            30 + Math.random() * 10,
            (Math.random() - 0.5) * 100
          ]}
          opacity={0.5 + Math.random() * 0.3}
          speed={0.1}
          color={cloudColor}
        />
      ))}
      
      <ContactShadows 
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={100}
        blur={1}
        far={10}
        resolution={256}
        color="#000000"
      />
    </>
  );
};

// Enhanced material selector with more options and previews
const TerrainMaterialSelector: React.FC<{
  selected: string;
  onChange: (value: string) => void;
}> = ({ selected, onChange }) => {
  const materials = [
    { id: 'grass', name: 'Grass', color: '#4caf50', description: 'Lush green grass for meadows and plains' },
    { id: 'desert', name: 'Desert', color: '#ffc107', description: 'Sandy desert terrain' },
    { id: 'snow', name: 'Snow', color: '#e0e0e0', description: 'Snow-covered landscapes' },
    { id: 'rock', name: 'Rock', color: '#607d8b', description: 'Rocky mountain terrain' },
    { id: 'volcanic', name: 'Volcanic', color: '#8b3d07', description: 'Volcanic rock and ash' },
    { id: 'mud', name: 'Mud', color: '#795548', description: 'Muddy swampland' },
    { id: 'clay', name: 'Clay', color: '#d7ccc8', description: 'Clay-rich soil and formations' },
    { id: 'forest', name: 'Forest Floor', color: '#33691e', description: 'Dense forest undergrowth' },
  ];
  
  return (
    <div className="material-selector">
      <h3>Terrain Material</h3>
      <div className="material-options">
        {materials.map(material => (
          <div 
            key={material.id}
            className={`material-option ${selected === material.id ? 'selected' : ''}`}
            style={{ backgroundColor: material.color }}
            onClick={() => onChange(material.id)}
            title={material.description}
          >
            <span>{material.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Heightmap visualization component
const HeightmapVisualization: React.FC<{
  heightmap: Float32Array;
  resolution: number;
}> = ({ heightmap, resolution }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw heightmap
    const imgData = ctx.createImageData(resolution, resolution);
    
    for (let i = 0; i < heightmap.length; i++) {
      const height = heightmap[i];
      const val = Math.floor(height * 255);
      
      // RGBA values
      imgData.data[i * 4] = val;
      imgData.data[i * 4 + 1] = val;
      imgData.data[i * 4 + 2] = val;
      imgData.data[i * 4 + 3] = 255; // Alpha
    }
    
    ctx.putImageData(imgData, 0, 0);
  }, [heightmap, resolution]);
  
  return (
    <div className="heightmap-visualization">
      <h3>Heightmap Preview</h3>
      <canvas 
        ref={canvasRef} 
        width={resolution} 
        height={resolution}
        className="heightmap-canvas"
      />
    </div>
  );
};

// Main terrain editor component
const TerrainEditor: React.FC = () => {
  // State for terrain parameters
  const [terrainSize, setTerrainSize] = useState<number>(100);
  const [heightScale, setHeightScale] = useState<number>(15);
  const [resolution, setResolution] = useState<number>(128);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('grass');
  const [currentPreset, setCurrentPreset] = useState<string>('hills');
  const [seed, setSeed] = useState<number>(Math.random() * 1000);
  
  // Environment state
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([100, 100, 100]);
  const [cloudCoverage, setCloudCoverage] = useState<number>(0.3);
  const [cloudColor, setCloudColor] = useState<string>('#ffffff');
  const [fogColor, setFogColor] = useState<string>('#a0d0e0');
  const [fogDensity, setFogDensity] = useState<number>(1);
  const [environmentPreset, setEnvironmentPreset] = useState<string>('sunset');
  
  // Create Leva controls for terrain parameters
  const terrainControls = useControls({
    'Terrain Settings': folder({
      preset: {
        value: currentPreset,
        options: Object.keys(terrainPresets),
        onChange: (value) => {
          setCurrentPreset(value);
          // Apply preset settings
          const preset = terrainPresets[value as keyof typeof terrainPresets];
          setSelectedMaterial(preset.materialId);
          
          // Other preset properties are used directly in regenerateTerrain
          regenerateTerrain(preset);
        }
      },
      terrainSize: {
        value: terrainSize,
        min: 50,
        max: 200,
        step: 10,
        onChange: setTerrainSize
      },
      heightScale: {
        value: heightScale,
        min: 5,
        max: 30,
        step: 1,
        onChange: setHeightScale
      },
      resolution: {
        value: resolution,
        options: [64, 128, 256, 512],
        onChange: setResolution
      },
      wireframe: {
        value: wireframe,
        onChange: setWireframe
      },
      'Generate New Seed': button(() => {
        const newSeed = Math.random() * 1000;
        setSeed(newSeed);
        regenerateTerrain({ seed: newSeed });
      })
    }, { collapsed: false }),
    
    'Environment': folder({
      environmentPreset: {
        value: environmentPreset,
        options: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
        onChange: setEnvironmentPreset
      },
      sunPositionX: {
        value: sunPosition[0],
        min: -100,
        max: 100,
        onChange: (v) => setSunPosition([v, sunPosition[1], sunPosition[2]])
      },
      sunPositionY: {
        value: sunPosition[1],
        min: 0,
        max: 100,
        onChange: (v) => setSunPosition([sunPosition[0], v, sunPosition[2]])
      },
      sunPositionZ: {
        value: sunPosition[2],
        min: -100,
        max: 100,
        onChange: (v) => setSunPosition([sunPosition[0], sunPosition[1], v])
      },
      cloudCoverage: {
        value: cloudCoverage,
        min: 0,
        max: 1,
        onChange: setCloudCoverage
      },
      cloudColor: {
        value: cloudColor,
        onChange: setCloudColor
      },
      fogColor: {
        value: fogColor,
        onChange: setFogColor
      },
      fogDensity: {
        value: fogDensity,
        min: 0.1,
        max: 3,
        onChange: setFogDensity
      }
    }, { collapsed: true })
  });
  
  const getMaterial = () => {
    let color;
    
    switch (selectedMaterial) {
      case 'grass': color = '#4caf50'; break;
      case 'desert': color = '#ffc107'; break;
      case 'snow': color = '#e0e0e0'; break;
      case 'rock': color = '#607d8b'; break;
      case 'volcanic': color = '#8b3d07'; break;
      case 'mud': color = '#795548'; break;
      case 'clay': color = '#d7ccc8'; break;
      case 'forest': color = '#33691e'; break;
      default: color = '#4caf50';
    }
    
    return (
      <meshStandardMaterial 
        color={color} 
        roughness={0.8} 
        metalness={0.2} 
        wireframe={wireframe}
      />
    );
  };
  
  // Generate heightmap with current settings
  const [terrainParams, setTerrainParams] = useState({
    roughness: 0.6,
    persistence: 0.5,
    lacunarity: 2.0,
    octaves: 4,
    seed,
    peakHeight: 0.5,
    valleyDepth: 0.2,
    plateauSize: 0.3
  });
  
  const regenerateTerrain = (params: Partial<typeof terrainParams> = {}) => {
    const newParams = { ...terrainParams, ...params };
    setTerrainParams(newParams);
  };
  
  // Generate heightmap based on current parameters
  const heightmap = useMemo(() => {
    return generateHeightmap(resolution, terrainParams);
  }, [resolution, terrainParams]);
  
  // AI prompt integration
  const [aiPrompt, setAiPrompt] = useState('');
  
  const generateTerrainFromAI = () => {
    const prompt = aiPrompt.trim();
    if (!prompt) return;
    
    // Simple mapping of keywords to presets
    // In a real app, this would call an actual AI service
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('mountain')) {
      setCurrentPreset('mountainous');
      regenerateTerrain(terrainPresets.mountainous);
      setSelectedMaterial('rock');
    } else if (lowercasePrompt.includes('desert')) {
      setCurrentPreset('desert');
      regenerateTerrain(terrainPresets.desert);
      setSelectedMaterial('desert');
    } else if (lowercasePrompt.includes('snow') || lowercasePrompt.includes('ice')) {
      setCurrentPreset('arctic');
      regenerateTerrain(terrainPresets.arctic);
      setSelectedMaterial('snow');
    } else if (lowercasePrompt.includes('volcano')) {
      setCurrentPreset('volcanic');
      regenerateTerrain(terrainPresets.volcanic);
      setSelectedMaterial('volcanic');
    } else if (lowercasePrompt.includes('plain') || lowercasePrompt.includes('flat')) {
      setCurrentPreset('plains');
      regenerateTerrain(terrainPresets.plains);
      setSelectedMaterial('grass');
    } else if (lowercasePrompt.includes('hill')) {
      setCurrentPreset('hills');
      regenerateTerrain(terrainPresets.hills);
      setSelectedMaterial('grass');
    } else {
      // Default to hills with a new seed
      const newSeed = Math.random() * 1000;
      setSeed(newSeed);
      regenerateTerrain({ seed: newSeed });
    }
    
    setAiPrompt('');
  };
  
  return (
    <div className="terrain-editor">
      <div className="terrain-editor-sidebar">
        <div className="terrain-ai-prompt">
          <h3>AI Terrain Generation</h3>
          <div className="ai-prompt-input">
            <input
              type="text"
              placeholder="Describe your terrain (e.g., 'Rocky mountains with snow peaks')"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateTerrainFromAI()}
            />
            <button onClick={generateTerrainFromAI}>Generate</button>
          </div>
        </div>
        
        <TerrainMaterialSelector
          selected={selectedMaterial}
          onChange={setSelectedMaterial}
        />
        
        <HeightmapVisualization
          heightmap={heightmap}
          resolution={resolution}
        />
        
        <div className="terrain-actions">
          <button 
            className="save-terrain-btn"
            onClick={() => alert('Terrain saved!')}
          >
            Save Terrain
          </button>
        </div>
      </div>
      
      <div className="terrain-editor-canvas">
        <Leva collapsed={false} titleBar={false} fill />
        <Canvas 
          shadows 
          camera={{ position: [50, 50, 50], fov: 50 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={[fogColor]} />
          
          <Environment 
            sunPosition={sunPosition}
            cloudCoverage={cloudCoverage}
            cloudColor={cloudColor}
            fogColor={fogColor}
            fogDensity={fogDensity}
            environmentPreset={environmentPreset}
          />
          
          <TerrainMesh 
            heightmap={heightmap}
            size={terrainSize}
            heightScale={heightScale}
            resolution={resolution}
            material={getMaterial()}
            wireframe={wireframe}
          />
          
          <Grid 
            args={[terrainSize, terrainSize, terrainSize/10, terrainSize/10]} 
            position={[0, -0.01, 0]} 
            cellColor="#000000"
            sectionColor="#6f6f6f"
            infiniteGrid
            fadeDistance={terrainSize * 2}
          />
          
          <OrbitControls 
            enableDamping
            dampingFactor={0.1}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default TerrainEditor; 