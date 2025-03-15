/**
 * Types for the 2D GameStudio RPG Maker system
 */

export interface RPGCharacter {
  id: string;
  name: string;
  sprite: string;
  position: { x: number, y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  stats: {
    hp: number;
    mp: number;
    level: number;
    attack: number;
    defense: number;
    speed: number;
  };
  inventory: string[];
  skills: string[];
}

export interface RPGTile {
  id: string;
  type: 'ground' | 'wall' | 'water' | 'door' | 'chest' | 'npc' | 'event';
  sprite: string;
  walkable: boolean;
  properties?: {
    eventId?: string;
    message?: string;
    teleportTo?: { mapId: string, x: number, y: number };
    contains?: string[];
  };
}

export interface RPGMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: RPGTile[][];
  events: RPGEvent[];
  bgm?: string;
  encounters?: {
    rate: number;
    enemies: string[];
  };
  openingCutscene?: RPGEvent;
}

// Event action types
export type RPGEventActionType = 
  | 'message' 
  | 'giveItem' 
  | 'removeItem' 
  | 'teleport' 
  | 'battle' 
  | 'shop' 
  | 'setVariable' 
  | 'setSwitch'
  | 'wait'
  | 'changeBackground'
  | 'showCharacter'
  | 'hideCharacter'
  | 'moveCharacter';

export interface RPGEvent {
  id: string;
  trigger: 'auto' | 'action' | 'touch';
  position?: { x: number, y: number };
  conditions?: {
    variableCheck?: { id: string, value: any };
    switchCheck?: { id: string, value: boolean };
    itemCheck?: { id: string, hasItem: boolean };
  };
  actions: {
    type: RPGEventActionType;
    params: any;
  }[];
  visualScript?: {
    scriptId: string;
    name: string;
    nodes: any[];
    edges: any[];
    active: boolean;
  };
}

export interface RPGGameState {
  currentMap: RPGMap;
  player: RPGCharacter;
  npcs: RPGCharacter[];
  variables: { [key: string]: any };
  switches: { [key: string]: boolean };
  gameTime: number;
  inventory: string[];
}

// 3D Types - for GameBridge compatibility
export interface GameObject3D {
  id: string;
  name: string;
  type: string;
  transform: {
    position: { x: number, y: number, z: number };
    rotation: { x: number, y: number, z: number };
    scale: { x: number, y: number, z: number };
  };
  prefab?: string;
  components: any[];
  scripts?: any[];
  children?: GameObject3D[];
}

export interface Scene3D {
  id: string;
  name: string;
  objects: GameObject3D[];
  settings: {
    physics: boolean;
    lighting: string;
    skybox: string;
    gravity?: { x: number, y: number, z: number };
  };
  scripts?: any;
}

// Add interface for script library
export interface ScriptLibrary {
  scripts: {
    id: string;
    name: string;
    description: string;
    category: string;
    nodes: any[];
    edges: any[];
    thumbnail?: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

// Window extension
declare global {
  interface Window {
    gameEngine?: any;
    engine?: any;
    GameSetupAPI?: {
      createGameSetup: (scene: Scene3D, scripts: any) => boolean;
      createCharacterWithMovement: (character: GameObject3D, script: any) => boolean;
    };
    // Add visual scripting integration
    VisualScriptingAPI?: {
      executeScript: (scriptId: string, context: any) => Promise<any>;
      getAvailableScripts: () => Promise<ScriptLibrary>;
      importScript: (scriptId: string) => Promise<any>;
    };
  }
}

// Fix the GameSetupAPI interface to be consistent
export interface GameAPI {
  // ... existing code ...
  GameSetupAPI?: {
    createGameSetup: (scene: GameScene, scripts: any[]) => boolean;
    createCharacterWithMovement: (character: GameObject, script: any) => boolean;
  };
  // ... existing code ...
} 