import React, { useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/Editor.css';

// A simple mesh that represents a selected object
const SelectedMesh: React.FC<{
  position: [number, number, number],
  setPosition: (pos: [number, number, number]) => void
}> = ({ position, setPosition }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Helper that shows the normal vectors of the mesh
  useHelper(meshRef, THREE.BoxHelper, 'cyan');

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="lightblue" />
    </mesh>
  );
};

// Scene component that contains the 3D objects
const Scene: React.FC = () => {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.5} />
      
      {/* Directional light with shadow */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      
      {/* Ground grid */}
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        sectionSize={3}
        sectionThickness={1}
        fadeDistance={30}
        fadeStrength={1.5}
      />
      
      {/* Object that's currently selected/being edited */}
      <SelectedMesh position={position} setPosition={setPosition} />
    </>
  );
};

// Main editor component
const Editor: React.FC = () => {
  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button>Select</button>
        <button>Move</button>
        <button>Rotate</button>
        <button>Scale</button>
        <button>Play</button>
      </div>
      
      <div className="editor-viewport">
        <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
          <Scene />
          <OrbitControls />
        </Canvas>
      </div>
      
      <div className="editor-timeline">
        <div className="timeline-controls">
          <button>◀</button>
          <button>▶</button>
          <span>Frame: 0</span>
        </div>
        <div className="timeline-track"></div>
      </div>
    </div>
  );
};

export default Editor; 