/**
 * GameBridge - Connects the 2D game studio with the 3D game engine
 * 
 * This file serves as a bridge between the 2D RPG game system and the
 * existing 3D game engine, allowing them to share data and functionality.
 */

import { RPGMap, RPGCharacter, RPGTile, RPGGameState } from './types';

// Interface for the bridge methods
interface GameBridgeInterface {
  // 2D to 3D conversions
  convert2DMapTo3D: (map: RPGMap) => any;
  convert2DCharacterTo3D: (character: RPGCharacter) => any;
  convert2DTileTo3D: (tile: RPGTile, x: number, y: number) => any;
  
  // 3D to 2D conversions
  convert3DObjectTo2D: (object3D: any) => any;
  
  // Game state sharing
  syncGameState: (state: RPGGameState) => void;
  
  // Export functions
  exportAs3DScene: (gameState: RPGGameState) => any;
  
  // Input handling
  registerInputHandlers: (handlers: any) => void;
  
  // 3D rendering of 2D game
  render2DGameIn3D: (gameState: RPGGameState, container: HTMLElement) => void;
}

/**
 * GameBridge implementation connecting 2D games to 3D environment
 */
class GameBridge implements GameBridgeInterface {
  private gameEngine: any;
  private is3DAvailable: boolean;
  
  constructor() {
    // Try to detect the 3D game engine
    this.gameEngine = window.gameEngine || (window as any).engine;
    this.is3DAvailable = !!this.gameEngine;
    
    console.log(`🌉 GameBridge: 3D engine ${this.is3DAvailable ? 'detected' : 'not available'}`);
  }
  
  /**
   * Convert a 2D RPG map to a 3D scene
   */
  convert2DMapTo3D(map: RPGMap) {
    if (!this.is3DAvailable) {
      console.warn('3D engine not available for map conversion');
      return null;
    }
    
    console.log(`Converting 2D map "${map.name}" to 3D scene`);
    
    try {
      // Create a new 3D scene
      const scene3D = {
        id: `3d_${map.id}`,
        name: `3D - ${map.name}`,
        objects: [],
        settings: {
          physics: true,
          lighting: 'realtime',
          skybox: 'default_blue_sky',
          gravity: { x: 0, y: -9.8, z: 0 }
        }
      };
      
      // Convert each tile to a 3D object
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const tile = map.tiles[y][x];
          if (tile) {
            const object3D = this.convert2DTileTo3D(tile, x, y);
            if (object3D) {
              scene3D.objects.push(object3D);
            }
          }
        }
      }
      
      return scene3D;
    } catch (error) {
      console.error('Error converting 2D map to 3D:', error);
      return null;
    }
  }
  
  /**
   * Convert a 2D character to a 3D character model
   */
  convert2DCharacterTo3D(character: RPGCharacter) {
    if (!this.is3DAvailable) {
      console.warn('3D engine not available for character conversion');
      return null;
    }
    
    console.log(`Converting 2D character "${character.name}" to 3D`);
    
    try {
      // Create a basic 3D character
      return {
        id: `3d_${character.id}`,
        name: character.name,
        type: 'character',
        transform: {
          position: { 
            x: character.position.x, 
            y: 0.5, // Lift slightly above ground
            z: character.position.y  // Z in 3D is Y in 2D top-down view
          },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        },
        prefab: 'default_character',
        components: [
          {
            type: 'CharacterController',
            properties: {
              moveSpeed: 5.0,
              jumpForce: 7.0,
              mass: 1.0,
              gravity: 20.0
            }
          },
          {
            type: 'Animator',
            properties: {
              controller: 'humanoid',
              defaultAnimation: 'idle'
            }
          },
          {
            type: 'PlayerInput',
            properties: {
              keyboardEnabled: true,
              gamepadEnabled: true
            }
          }
        ],
        scripts: [
          {
            name: 'Character Movement',
            scriptId: 'character_movement_script'
          }
        ]
      };
    } catch (error) {
      console.error('Error converting 2D character to 3D:', error);
      return null;
    }
  }
  
  /**
   * Convert a 2D tile to a 3D object
   */
  convert2DTileTo3D(tile: RPGTile, x: number, y: number) {
    if (!tile) return null;
    
    try {
      let object3D: any = {
        id: `3d_${tile.id}`,
        name: `Tile ${x},${y}`,
        transform: {
          position: { x: x, y: 0, z: y },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        },
        components: []
      };
      
      // Configure object based on tile type
      switch (tile.type) {
        case 'ground':
          object3D.type = 'static';
          object3D.prefab = 'cube';
          object3D.transform.scale = { x: 1, y: 0.1, z: 1 };
          object3D.components.push({
            type: 'MeshRenderer',
            properties: {
              material: 'ground_material',
              receiveShadows: true
            }
          });
          object3D.components.push({
            type: 'BoxCollider',
            properties: {
              isTrigger: false,
              size: { x: 1, y: 0.1, z: 1 },
              center: { x: 0, y: 0, z: 0 }
            }
          });
          break;
          
        case 'wall':
          object3D.type = 'static';
          object3D.prefab = 'cube';
          object3D.transform.scale = { x: 1, y: 1, z: 1 };
          object3D.transform.position.y = 0.5; // Center vertically
          object3D.components.push({
            type: 'MeshRenderer',
            properties: {
              material: 'wall_material',
              receiveShadows: true
            }
          });
          object3D.components.push({
            type: 'BoxCollider',
            properties: {
              isTrigger: false,
              size: { x: 1, y: 1, z: 1 },
              center: { x: 0, y: 0, z: 0 }
            }
          });
          break;
          
        case 'water':
          object3D.type = 'static';
          object3D.prefab = 'plane';
          object3D.transform.position.y = 0.05; // Slightly above ground
          object3D.components.push({
            type: 'MeshRenderer',
            properties: {
              material: 'water_material',
              receiveShadows: false
            }
          });
          object3D.components.push({
            type: 'BoxCollider',
            properties: {
              isTrigger: true,
              size: { x: 1, y: 0.1, z: 1 },
              center: { x: 0, y: 0, z: 0 }
            }
          });
          break;
          
        case 'chest':
          object3D.type = 'interactive';
          object3D.prefab = 'chest';
          object3D.transform.position.y = 0.25; // Half-height above ground
          object3D.transform.scale = { x: 0.5, y: 0.5, z: 0.5 };
          object3D.components.push({
            type: 'MeshRenderer',
            properties: {
              material: 'chest_material',
              receiveShadows: true
            }
          });
          object3D.components.push({
            type: 'BoxCollider',
            properties: {
              isTrigger: true,
              size: { x: 0.5, y: 0.5, z: 0.5 },
              center: { x: 0, y: 0.25, z: 0 }
            }
          });
          // Add interaction script
          object3D.scripts = [{
            name: 'Chest Interaction',
            scriptId: 'chest_interaction_script',
            properties: {
              contents: tile.properties?.contains || ['Gold']
            }
          }];
          break;
          
        case 'door':
          object3D.type = 'interactive';
          object3D.prefab = 'door';
          object3D.transform.position.y = 0.5; // Center vertically
          object3D.transform.scale = { x: 1, y: 1, z: 0.2 };
          object3D.components.push({
            type: 'MeshRenderer',
            properties: {
              material: 'door_material',
              receiveShadows: true
            }
          });
          object3D.components.push({
            type: 'BoxCollider',
            properties: {
              isTrigger: true,
              size: { x: 1, y: 1, z: 0.2 },
              center: { x: 0, y: 0.5, z: 0 }
            }
          });
          // Add teleport script
          if (tile.properties?.teleportTo) {
            object3D.scripts = [{
              name: 'Door Teleport',
              scriptId: 'door_teleport_script',
              properties: {
                targetMap: tile.properties.teleportTo.mapId,
                targetX: tile.properties.teleportTo.x,
                targetY: tile.properties.teleportTo.y
              }
            }];
          }
          break;
          
        default:
          // Default flat tile
          object3D.type = 'static';
          object3D.prefab = 'plane';
          object3D.components.push({
            type: 'MeshRenderer',
            properties: {
              material: 'default_material',
              receiveShadows: true
            }
          });
      }
      
      return object3D;
    } catch (error) {
      console.error(`Error converting tile at (${x},${y}) to 3D:`, error);
      return null;
    }
  }
  
  /**
   * Convert a 3D object to a 2D game element
   */
  convert3DObjectTo2D(object3D: any) {
    // Simple conversion from 3D to 2D
    if (!object3D) return null;
    
    try {
      // Determine what type of 2D element to create
      if (object3D.type === 'character') {
        // Convert to 2D character
        return {
          id: `2d_${object3D.id}`,
          name: object3D.name,
          sprite: 'character.png',
          position: { 
            x: Math.round(object3D.transform.position.x), 
            y: Math.round(object3D.transform.position.z) 
          },
          direction: 'down',
          stats: {
            hp: 100,
            mp: 50,
            level: 1,
            attack: 10,
            defense: 8,
            speed: 5
          },
          inventory: [],
          skills: ['Attack']
        };
      } else {
        // Convert to 2D tile
        return {
          id: `2d_${object3D.id}`,
          type: object3D.type === 'static' ? 'ground' : 'wall',
          sprite: 'tile.png',
          walkable: object3D.type !== 'wall'
        };
      }
    } catch (error) {
      console.error('Error converting 3D object to 2D:', error);
      return null;
    }
  }
  
  /**
   * Sync the 2D game state with the 3D environment
   */
  syncGameState(state: RPGGameState) {
    if (!this.is3DAvailable) {
      console.warn('3D engine not available for game state sync');
      return;
    }
    
    console.log('Syncing 2D game state with 3D environment');
    
    try {
      // Convert the current 2D map to 3D
      const scene3D = this.convert2DMapTo3D(state.currentMap);
      
      // Convert the player character to 3D
      const player3D = this.convert2DCharacterTo3D(state.player);
      
      if (scene3D && player3D) {
        // Add player to scene
        scene3D.objects.push(player3D);
        
        // Use the existing 3D engine API to load the scene
        if (this.gameEngine.loadScene) {
          this.gameEngine.loadScene(scene3D);
        } else if (this.gameEngine.scene && this.gameEngine.scene.load) {
          this.gameEngine.scene.load(scene3D);
        } else if ((window as any).GameSetupAPI && (window as any).GameSetupAPI.createGameSetup) {
          (window as any).GameSetupAPI.createGameSetup(scene3D, {});
        }
      }
    } catch (error) {
      console.error('Error syncing game state:', error);
    }
  }
  
  /**
   * Export the current 2D game as a 3D scene
   */
  exportAs3DScene(gameState: RPGGameState) {
    console.log('Exporting 2D game as 3D scene');
    
    try {
      // Convert map
      const scene3D = this.convert2DMapTo3D(gameState.currentMap);
      
      // Add player
      const player3D = this.convert2DCharacterTo3D(gameState.player);
      if (scene3D && player3D) {
        scene3D.objects.push(player3D);
      }
      
      // Add NPCs
      if (scene3D && gameState.npcs) {
        gameState.npcs.forEach(npc => {
          const npc3D = this.convert2DCharacterTo3D(npc);
          if (npc3D) {
            scene3D.objects.push(npc3D);
          }
        });
      }
      
      return scene3D;
    } catch (error) {
      console.error('Error exporting game as 3D scene:', error);
      return null;
    }
  }
  
  /**
   * Register input handlers from the 2D game with the 3D engine
   */
  registerInputHandlers(handlers: any) {
    if (!this.is3DAvailable) {
      console.warn('3D engine not available for input handler registration');
      return;
    }
    
    console.log('Registering 2D game input handlers with 3D engine');
    
    try {
      // Set up key mappings between 2D and 3D
      if (this.gameEngine.input && this.gameEngine.input.registerHandlers) {
        this.gameEngine.input.registerHandlers(handlers);
      }
    } catch (error) {
      console.error('Error registering input handlers:', error);
    }
  }
  
  /**
   * Render the 2D game in a 3D environment
   */
  render2DGameIn3D(gameState: RPGGameState, container: HTMLElement) {
    console.log('Rendering 2D game in 3D environment');
    
    try {
      // Convert to 3D scene
      const scene3D = this.exportAs3DScene(gameState);
      
      if (!scene3D) {
        throw new Error('Failed to create 3D scene from 2D game');
      }
      
      // Create a canvas for 3D rendering
      const canvas = document.createElement('canvas');
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      container.appendChild(canvas);
      
      // Initialize a simple 3D renderer
      if (this.is3DAvailable) {
        // Use the existing 3D engine
        if (this.gameEngine.initRenderer) {
          this.gameEngine.initRenderer(canvas);
        }
        
        // Load the scene
        if (this.gameEngine.loadScene) {
          this.gameEngine.loadScene(scene3D);
        }
      } else {
        // Fallback to a basic WebGL renderer
        this.initBasicRenderer(canvas, scene3D);
      }
    } catch (error) {
      console.error('Error rendering 2D game in 3D:', error);
      
      // Show error message in container
      container.innerHTML = `
        <div style="color: red; padding: 20px;">
          <h3>3D Rendering Error</h3>
          <p>${error}</p>
        </div>
      `;
    }
  }
  
  /**
   * Initialize a basic WebGL renderer as fallback
   */
  private initBasicRenderer(canvas: HTMLCanvasElement, scene: any) {
    // Very basic WebGL setup as fallback
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (!gl) {
        throw new Error('WebGL not supported');
      }
      
      // Clear to a dark color
      gl.clearColor(0.1, 0.1, 0.2, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Display message on canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('3D rendering fallback - WebGL', canvas.width / 2, 30);
        ctx.fillText(`Scene: ${scene.name}`, canvas.width / 2, 60);
        ctx.fillText(`Objects: ${scene.objects.length}`, canvas.width / 2, 90);
      }
    } catch (error) {
      console.error('Error initializing basic renderer:', error);
      
      // Fall back to 2D canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('WebGL not available', canvas.width / 2, canvas.height / 2);
      }
    }
  }
}

// Create singleton instance
const gameBridge = new GameBridge();

export default gameBridge; 