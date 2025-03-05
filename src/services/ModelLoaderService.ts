import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Interface for model metadata
export interface ModelMetadata {
  format: string;
  vertices: number;
  faces: number;
  materials: number;
  textures: number;
  animations: number;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

// Interface for the loaded model result
export interface LoadedModel {
  scene: THREE.Group | THREE.Mesh | THREE.Object3D;
  metadata: ModelMetadata;
  animations?: THREE.AnimationClip[];
}

export class ModelLoaderService {
  private static instance: ModelLoaderService;
  private loader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private objLoader: OBJLoader;
  private stlLoader: STLLoader;
  private colladaLoader: ColladaLoader;
  private plyLoader: PLYLoader;
  private tdsLoader: TDSLoader;
  private dracoLoader: DRACOLoader;
  
  private constructor() {
    this.loader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();
    this.objLoader = new OBJLoader();
    this.stlLoader = new STLLoader();
    this.colladaLoader = new ColladaLoader();
    this.plyLoader = new PLYLoader();
    this.tdsLoader = new TDSLoader();
    
    // Set up Draco compression
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    this.loader.setDRACOLoader(this.dracoLoader);
  }
  
  public static getInstance(): ModelLoaderService {
    if (!ModelLoaderService.instance) {
      ModelLoaderService.instance = new ModelLoaderService();
    }
    return ModelLoaderService.instance;
  }
  
  public async loadModel(url: string): Promise<THREE.Object3D> {
    const fileExtension = this.getFileExtension(url).toLowerCase();
    
    try {
      switch (fileExtension) {
        case 'glb':
        case 'gltf':
          return await this.loadGLTF(url);
        case 'fbx':
          return await this.loadFBX(url);
        case 'obj':
          return await this.loadOBJ(url);
        case 'stl':
          return await this.loadSTL(url);
        case 'dae':
          return await this.loadCollada(url);
        case 'ply':
          return await this.loadPLY(url);
        case '3ds':
          return await this.load3DS(url);
        case 'pbn':
          // Special handling for PBN files
          return await this.loadPBN(url);
        default:
          // Try GLTF as default
          console.warn(`Unsupported file format: ${fileExtension}, trying GLTF loader as fallback`);
          return await this.loadGLTF(url);
      }
    } catch (error) {
      console.error(`Error loading model: ${error}`);
      throw new Error(`Failed to load model: ${error}`);
    }
  }
  
  private getFileExtension(url: string): string {
    return url.split('.').pop() || '';
  }
  
  private async loadGLTF(url: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          resolve(model);
        },
        undefined,
        (error) => {
          console.error('Error loading GLTF model:', error);
          reject(error);
        }
      );
    });
  }
  
  private async loadFBX(url: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(
        url,
        (object) => {
          resolve(object);
        },
        undefined,
        (error) => {
          console.error('Error loading FBX model:', error);
          reject(error);
        }
      );
    });
  }
  
  private async loadOBJ(url: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.objLoader.load(
        url,
        (object) => {
          resolve(object);
        },
        undefined,
        (error) => {
          console.error('Error loading OBJ model:', error);
          reject(error);
        }
      );
    });
  }
  
  private async loadSTL(url: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.stlLoader.load(
        url,
        (geometry) => {
          const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
          const mesh = new THREE.Mesh(geometry, material);
          resolve(mesh);
        },
        undefined,
        (error) => {
          console.error('Error loading STL model:', error);
          reject(error);
        }
      );
    });
  }
  
  private async loadCollada(url: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.colladaLoader.load(
        url,
        (collada) => {
          resolve(collada.scene);
        },
        undefined,
        (error) => {
          console.error('Error loading Collada model:', error);
          reject(error);
        }
      );
    });
  }
  
  private async loadPLY(url: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.plyLoader.load(
        url,
        (geometry) => {
          const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, vertexColors: true });
          const mesh = new THREE.Mesh(geometry, material);
          resolve(mesh);
        },
        undefined,
        (error) => {
          console.error('Error loading PLY model:', error);
          reject(error);
        }
      );
    });
  }
  
  private async load3DS(url: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.tdsLoader.load(
        url,
        (object) => {
          resolve(object);
        },
        undefined,
        (error) => {
          console.error('Error loading 3DS model:', error);
          reject(error);
        }
      );
    });
  }
  
  private async loadPBN(url: string): Promise<THREE.Object3D> {
    // Custom implementation for PBN files
    // This is a placeholder - actual implementation would depend on the PBN format specification
    try {
      // For now, try to load as GLTF as a fallback
      return await this.loadGLTF(url);
    } catch (error) {
      console.error('Error loading PBN model:', error);
      throw new Error(`PBN format not fully supported yet: ${error}`);
    }
  }
  
  public async generateThumbnail(model: THREE.Object3D, width = 256, height = 256): Promise<string> {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);
    
    // Add the model to the scene
    scene.add(model);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    // Position camera to frame the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Set a minimum distance
    cameraZ = Math.max(cameraZ * 1.5, 1);
    
    camera.position.set(center.x, center.y, center.z + cameraZ);
    camera.lookAt(center);
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    
    // Render the scene
    renderer.render(scene, camera);
    
    // Get the thumbnail as a data URL
    const dataURL = renderer.domElement.toDataURL('image/png');
    
    // Clean up
    renderer.dispose();
    
    return dataURL;
  }
  
  public getModelMetadata(model: THREE.Object3D): any {
    let vertexCount = 0;
    let faceCount = 0;
    let materialCount = 0;
    const materials = new Set();
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geometry = child.geometry;
        
        if (geometry) {
          // Count vertices
          if (geometry.attributes.position) {
            vertexCount += geometry.attributes.position.count;
          }
          
          // Count faces
          if (geometry.index) {
            faceCount += geometry.index.count / 3;
          } else if (geometry.attributes.position) {
            faceCount += geometry.attributes.position.count / 3;
          }
          
          // Count materials
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => materials.add(mat));
          } else if (child.material) {
            materials.add(child.material);
          }
        }
      }
    });
    
    materialCount = materials.size;
    
    return {
      vertexCount,
      faceCount: Math.floor(faceCount),
      materialCount,
      objectCount: this.countObjects(model),
      boundingBox: this.getBoundingBox(model)
    };
  }
  
  private countObjects(model: THREE.Object3D): number {
    let count = 0;
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        count++;
      }
    });
    
    return count;
  }
  
  private getBoundingBox(model: THREE.Object3D): { width: number, height: number, depth: number } {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    
    return {
      width: parseFloat(size.x.toFixed(2)),
      height: parseFloat(size.y.toFixed(2)),
      depth: parseFloat(size.z.toFixed(2))
    };
  }
} 