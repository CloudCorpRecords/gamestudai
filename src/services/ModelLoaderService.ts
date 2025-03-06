import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export type ModelFormat = 'gltf' | 'glb' | 'fbx' | 'obj';

export interface ModelLoadOptions {
  format?: ModelFormat;
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  onProgress?: (event: ProgressEvent) => void;
}

export interface LoadedModel {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  format: ModelFormat;
}

export class ModelLoaderService {
  private static instance: ModelLoaderService;
  private gltfLoader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private objLoader: OBJLoader;
  private textureLoader: THREE.TextureLoader;
  private cache: Map<string, LoadedModel> = new Map();

  constructor() {
    // Set up GLTF loader with DRACO compression support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(dracoLoader);
    
    this.fbxLoader = new FBXLoader();
    this.objLoader = new OBJLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ModelLoaderService {
    if (!ModelLoaderService.instance) {
      ModelLoaderService.instance = new ModelLoaderService();
    }
    return ModelLoaderService.instance;
  }

  /**
   * Load a 3D model from a URL
   */
  async loadModel(url: string, options: ModelLoadOptions = {}): Promise<LoadedModel> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const format = options.format || this.getFormatFromUrl(url);
    let model: LoadedModel;

    try {
      switch (format) {
        case 'gltf':
        case 'glb':
          model = await this.loadGLTF(url, options);
          break;
        case 'fbx':
          model = await this.loadFBX(url, options);
          break;
        case 'obj':
          model = await this.loadOBJ(url, options);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Apply transformations
      if (options.scale) {
        model.scene.scale.set(options.scale, options.scale, options.scale);
      }

      if (options.position) {
        model.scene.position.set(options.position.x, options.position.y, options.position.z);
      }

      if (options.rotation) {
        model.scene.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
      }

      // Cache the result
      this.cache.set(url, model);
      return model;
    } catch (error) {
      console.error(`Error loading model from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Load a GLTF/GLB model
   */
  private loadGLTF(url: string, options: ModelLoadOptions): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          resolve({
            scene: gltf.scene,
            animations: gltf.animations,
            format: url.toLowerCase().endsWith('.glb') ? 'glb' : 'gltf'
          });
        },
        options.onProgress,
        reject
      );
    });
  }

  /**
   * Load an FBX model
   */
  private loadFBX(url: string, options: ModelLoadOptions): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(
        url,
        (object) => {
          resolve({
            scene: object,
            animations: object.animations || [],
            format: 'fbx'
          });
        },
        options.onProgress,
        reject
      );
    });
  }

  /**
   * Load an OBJ model
   */
  private loadOBJ(url: string, options: ModelLoadOptions): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.objLoader.load(
        url,
        (object) => {
          resolve({
            scene: object,
            animations: [],
            format: 'obj'
          });
        },
        options.onProgress,
        reject
      );
    });
  }

  /**
   * Load a texture
   */
  loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(url, resolve, undefined, reject);
    });
  }

  /**
   * Get file format from URL
   */
  private getFormatFromUrl(url: string): ModelFormat {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'gltf':
        return 'gltf';
      case 'glb':
        return 'glb';
      case 'fbx':
        return 'fbx';
      case 'obj':
        return 'obj';
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  }

  /**
   * Clear the model cache
   */
  clearCache(): void {
    this.cache.clear();
  }
} 