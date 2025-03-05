import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ModelLoaderService } from '../../services/ModelLoaderService';
import './ModelViewer.css';

interface ModelViewerProps {
  modelUrl: string;
  width?: number;
  height?: number;
  rotation?: [number, number, number];
  backgroundColor?: string;
  autoRotate?: boolean;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  width = 400,
  height = 300,
  rotation = [0, 0, 0],
  backgroundColor = '#f5f5f5',
  autoRotate = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const modelLoaderService = ModelLoaderService.getInstance();

  // Initialize the scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.autoRotate = autoRotate;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [width, height, backgroundColor, autoRotate]);

  // Load the model
  useEffect(() => {
    const loadModel = async () => {
      if (!sceneRef.current) return;
      
      try {
        // Remove previous model if exists
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
          modelRef.current = null;
        }
        
        // Load new model
        const model = await modelLoaderService.loadModel(modelUrl);
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Reset model position to center
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Adjust camera position based on model size
        if (cameraRef.current) {
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = cameraRef.current.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
          cameraZ = Math.max(cameraZ * 1.5, 1);
          
          cameraRef.current.position.z = cameraZ;
          cameraRef.current.lookAt(0, 0, 0);
          
          // Update controls target
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
        }
        
        // Add model to scene
        sceneRef.current.add(model);
        modelRef.current = model;
      } catch (error) {
        console.error('Error loading model in viewer:', error);
      }
    };
    
    loadModel();
  }, [modelUrl, modelLoaderService]);

  // Update model rotation
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x = THREE.MathUtils.degToRad(rotation[0]);
      modelRef.current.rotation.y = THREE.MathUtils.degToRad(rotation[1]);
      modelRef.current.rotation.z = THREE.MathUtils.degToRad(rotation[2]);
    }
  }, [rotation]);

  return (
    <div 
      className="model-viewer" 
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};

export default ModelViewer; 