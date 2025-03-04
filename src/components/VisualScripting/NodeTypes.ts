import { NodeProps } from 'reactflow';

// Define the base types for our visual scripting system with more robust types
export type NodeData = {
  label: string;
  description?: string; // Add description for better documentation
  category?: string; // Add category for better organization
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
  properties?: PropertyDefinition[];
  values: Record<string, any>;
  previewImageUrl?: string; // Optional preview image 
  tags?: string[]; // Tags for filtering
  documentation?: string; // Documentation URL or content
  isAdvanced?: boolean; // Flag for advanced nodes
};

export type PortDefinition = {
  id: string;
  label: string;
  type: PortType;
  description?: string; // Added description
  required?: boolean; // Whether the port is required
  defaultValue?: any; // Default value if not connected
  tooltip?: string; // Tooltip when hovering
};

// More specific port types for better type safety
export enum PortType {
  TRIGGER = 'trigger',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  INTEGER = 'integer',
  STRING = 'string',
  VECTOR2 = 'vector2',
  VECTOR3 = 'vector3',
  COLOR = 'color',
  OBJECT = 'object',
  ARRAY = 'array',
  AUDIO = 'audio',
  TEXTURE = 'texture',
  MATERIAL = 'material',
  ANY = 'any',
  EVENT = 'event',
  VECTOR = 'vector',
}

// Improved property types
export type PropertyDefinition = {
  id: string;
  label: string;
  type: PropertyType;
  description?: string;
  defaultValue: any;
  options?: string[] | { label: string; value: any }[]; // For dropdown type with labels
  min?: number; // For number type
  max?: number; // For number type
  step?: number; // For number type
  placeholder?: string; // For string type
  multiline?: boolean; // For string type, rendering as textarea
  fileTypes?: string[]; // For file inputs
  hidden?: boolean; // For hiding properties in the UI
  advanced?: boolean; // For advanced properties
  validation?: (value: any) => string | null; // Validation function, returns error message or null
};

export enum PropertyType {
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  INTEGER = 'integer',
  STRING = 'string',
  TEXT = 'text', // multiline string
  VECTOR2 = 'vector2',
  VECTOR3 = 'vector3',
  COLOR = 'color',
  DROPDOWN = 'dropdown',
  SLIDER = 'slider',
  FILE = 'file',
  IMAGE = 'image',
  AUDIO = 'audio',
  CODE = 'code', // For code snippets
  JSON = 'json',
  OBJECT_REFERENCE = 'object_reference',
  ENUM = 'enum',
}

// Node types for our visual scripting system
export enum NodeType {
  EVENT = 'event',
  ACTION = 'action',
  CONDITION = 'condition',
  VARIABLE = 'variable',
  MATH = 'math',
  LOGIC = 'logic',
  TRANSFORM = 'transform',
  PHYSICS = 'physics',
  AI = 'ai',
  ANIMATION = 'animation',
  AUDIO = 'audio',
  INPUT = 'input',
  UI = 'ui',
  UTILITY = 'utility',
  CUSTOM = 'custom',
  LOAD_MODEL = 'load_model',
  ANIMATE_MODEL = 'animate_model',
  MOVE_CHARACTER = 'move_character',
  CHARACTER_ACTION = 'character_action',
}

// Node categories for organization
export enum NodeCategory {
  COMMON = 'Common',
  GAMEPLAY = 'Gameplay',
  GRAPHICS = 'Graphics',
  PHYSICS = 'Physics',
  AUDIO = 'Audio',
  INPUT = 'Input',
  UI = 'User Interface',
  AI = 'Artificial Intelligence',
  MATH = 'Mathematics',
  LOGIC = 'Logic',
  UTILITY = 'Utility',
  CUSTOM = 'Custom',
  ADVANCED = 'Advanced',
  EVENTS = 'Events',
  ACTIONS = 'Actions',
  GAME_OBJECTS = 'Game Objects',
  MODELS = 'Character Models',
}

// Custom node props that include our NodeData
export type CustomNodeProps = NodeProps<NodeData>;

// Event nodes - these trigger the flow
export const EVENT_NODES = {
  START_GAME: {
    type: NodeType.EVENT,
    label: 'Game Start',
    description: 'Triggered when the game starts',
    category: NodeCategory.COMMON,
    outputs: [{ id: 'trigger', label: 'On Start', type: PortType.TRIGGER }],
    values: {},
    tags: ['start', 'initialization'],
  },
  COLLISION: {
    type: NodeType.EVENT,
    label: 'On Collision',
    description: 'Triggered when objects collide',
    category: NodeCategory.PHYSICS,
    inputs: [
      { id: 'object', label: 'Object', type: PortType.OBJECT, required: true },
    ],
    outputs: [
      { id: 'trigger', label: 'On Collision', type: PortType.TRIGGER },
      { id: 'other', label: 'Other Object', type: PortType.OBJECT },
      { id: 'impact', label: 'Impact Force', type: PortType.NUMBER },
      { id: 'position', label: 'Contact Point', type: PortType.VECTOR3 },
    ],
    values: {},
    tags: ['collision', 'physics', 'interaction'],
  },
  KEY_PRESSED: {
    type: NodeType.EVENT,
    label: 'Key Pressed',
    description: 'Triggered when a key is pressed',
    category: NodeCategory.INPUT,
    properties: [
      { 
        id: 'key', 
        label: 'Key', 
        type: PropertyType.DROPDOWN, 
        defaultValue: 'Space',
        options: ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'A', 'W', 'S', 'D', 'E', 'Q', 'R', 'F', 'Shift', 'Control', 'Alt'],
        description: 'The key to detect'
      },
      {
        id: 'continuous',
        label: 'Continuous',
        type: PropertyType.BOOLEAN,
        defaultValue: false,
        description: 'Trigger continuously while key is held'
      }
    ],
    outputs: [
      { id: 'trigger', label: 'On Press', type: PortType.TRIGGER },
      { id: 'released', label: 'On Release', type: PortType.TRIGGER },
    ],
    values: { key: 'Space', continuous: false },
    tags: ['input', 'keyboard', 'control'],
  },
  TIMER: {
    type: NodeType.EVENT,
    label: 'Timer',
    description: 'Triggers after a specified amount of time',
    category: NodeCategory.UTILITY,
    properties: [
      { id: 'seconds', label: 'Seconds', type: PropertyType.NUMBER, defaultValue: 1, min: 0.1, max: 60, step: 0.1 },
      { id: 'repeat', label: 'Repeat', type: PropertyType.BOOLEAN, defaultValue: false },
      { id: 'startImmediately', label: 'Start Immediately', type: PropertyType.BOOLEAN, defaultValue: true },
    ],
    inputs: [
      { id: 'start', label: 'Start', type: PortType.TRIGGER },
      { id: 'stop', label: 'Stop', type: PortType.TRIGGER },
    ],
    outputs: [
      { id: 'trigger', label: 'On Timeout', type: PortType.TRIGGER },
      { id: 'progress', label: 'Progress (0-1)', type: PortType.NUMBER },
    ],
    values: { seconds: 1, repeat: false, startImmediately: true },
    tags: ['time', 'delay', 'loop'],
  },
  MOUSE_EVENT: {
    type: NodeType.EVENT,
    label: 'Mouse Event',
    description: 'Triggered on mouse actions',
    category: NodeCategory.INPUT,
    properties: [
      { 
        id: 'eventType', 
        label: 'Event Type', 
        type: PropertyType.DROPDOWN, 
        defaultValue: 'click',
        options: ['click', 'down', 'up', 'move', 'enter', 'leave', 'drag', 'drop', 'wheel'],
        description: 'Type of mouse event to detect'
      },
    ],
    outputs: [
      { id: 'trigger', label: 'On Event', type: PortType.TRIGGER },
      { id: 'position', label: 'Position', type: PortType.VECTOR2 },
      { id: 'button', label: 'Button', type: PortType.INTEGER },
      { id: 'target', label: 'Target Object', type: PortType.OBJECT },
    ],
    values: { eventType: 'click' },
    tags: ['input', 'mouse', 'interaction'],
  },
  GAME_STATE_CHANGED: {
    type: NodeType.EVENT,
    label: 'Game State Changed',
    description: 'Triggered when game state changes',
    category: NodeCategory.GAMEPLAY,
    properties: [
      { 
        id: 'state', 
        label: 'State', 
        type: PropertyType.DROPDOWN, 
        defaultValue: 'any',
        options: ['any', 'start', 'pause', 'resume', 'win', 'lose', 'level_complete', 'game_over'],
        description: 'The state to listen for'
      },
    ],
    outputs: [
      { id: 'trigger', label: 'On Change', type: PortType.TRIGGER },
      { id: 'previousState', label: 'Previous State', type: PortType.STRING },
      { id: 'newState', label: 'New State', type: PortType.STRING },
    ],
    values: { state: 'any' },
    tags: ['game', 'state', 'event'],
  },
};

// Action nodes - these do something in the game
export const ACTION_NODES = {
  MOVE_OBJECT: {
    type: NodeType.ACTION,
    label: 'Move Object',
    description: 'Moves an object to a position over time',
    category: NodeCategory.PHYSICS,
    inputs: [
      { id: 'trigger', label: 'Trigger', type: PortType.TRIGGER, required: true },
      { id: 'object', label: 'Object', type: PortType.OBJECT, required: true },
      { id: 'position', label: 'Target Position', type: PortType.VECTOR3 },
    ],
    outputs: [
      { id: 'trigger', label: 'On Complete', type: PortType.TRIGGER },
      { id: 'progress', label: 'Progress (0-1)', type: PortType.NUMBER },
    ],
    properties: [
      { id: 'duration', label: 'Duration (s)', type: PropertyType.NUMBER, defaultValue: 1, min: 0, max: 60, step: 0.1 },
      { id: 'easing', label: 'Easing', type: PropertyType.DROPDOWN, defaultValue: 'linear', 
        options: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'bounce', 'elastic'] },
      { id: 'relative', label: 'Relative Movement', type: PropertyType.BOOLEAN, defaultValue: false },
    ],
    values: { duration: 1, easing: 'linear', relative: false },
    tags: ['movement', 'transform', 'animation'],
  },
  ROTATE_OBJECT: {
    type: NodeType.ACTION,
    label: 'Rotate Object',
    description: 'Rotates an object over time',
    category: NodeCategory.PHYSICS,
    inputs: [
      { id: 'trigger', label: 'Trigger', type: PortType.TRIGGER, required: true },
      { id: 'object', label: 'Object', type: PortType.OBJECT, required: true },
      { id: 'targetRotation', label: 'Target Rotation', type: PortType.VECTOR3 },
    ],
    outputs: [
      { id: 'trigger', label: 'On Complete', type: PortType.TRIGGER },
      { id: 'progress', label: 'Progress (0-1)', type: PortType.NUMBER },
    ],
    properties: [
      { id: 'x', label: 'X (degrees)', type: PropertyType.NUMBER, defaultValue: 0, min: -360, max: 360 },
      { id: 'y', label: 'Y (degrees)', type: PropertyType.NUMBER, defaultValue: 90, min: -360, max: 360 },
      { id: 'z', label: 'Z (degrees)', type: PropertyType.NUMBER, defaultValue: 0, min: -360, max: 360 },
      { id: 'duration', label: 'Duration (s)', type: PropertyType.NUMBER, defaultValue: 1, min: 0, max: 60, step: 0.1 },
      { id: 'easing', label: 'Easing', type: PropertyType.DROPDOWN, defaultValue: 'linear', 
        options: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'bounce', 'elastic'] },
      { id: 'relative', label: 'Relative Rotation', type: PropertyType.BOOLEAN, defaultValue: true },
    ],
    values: { x: 0, y: 90, z: 0, duration: 1, easing: 'linear', relative: true },
    tags: ['rotation', 'transform', 'animation'],
  },
  CHANGE_COLOR: {
    type: NodeType.ACTION,
    label: 'Change Color',
    description: 'Changes the color of an object',
    category: NodeCategory.GRAPHICS,
    inputs: [
      { id: 'trigger', label: 'Trigger', type: PortType.TRIGGER, required: true },
      { id: 'object', label: 'Object', type: PortType.OBJECT, required: true },
      { id: 'color', label: 'Target Color', type: PortType.COLOR },
    ],
    outputs: [
      { id: 'trigger', label: 'On Complete', type: PortType.TRIGGER },
    ],
    properties: [
      { id: 'color', label: 'Color', type: PropertyType.COLOR, defaultValue: '#FF0000' },
      { id: 'duration', label: 'Duration (s)', type: PropertyType.NUMBER, defaultValue: 0.5, min: 0, max: 10, step: 0.1 },
    ],
    values: { color: '#FF0000', duration: 0.5 },
    tags: ['color', 'material', 'graphics'],
  },
  PLAY_SOUND: {
    type: NodeType.ACTION,
    label: 'Play Sound',
    description: 'Plays an audio clip',
    category: NodeCategory.AUDIO,
    inputs: [
      { id: 'trigger', label: 'Trigger', type: PortType.TRIGGER, required: true },
      { id: 'volume', label: 'Volume (0-1)', type: PortType.NUMBER },
      { id: 'position', label: '3D Position', type: PortType.VECTOR3 },
    ],
    outputs: [
      { id: 'trigger', label: 'On Complete', type: PortType.TRIGGER },
      { id: 'duration', label: 'Duration (s)', type: PortType.NUMBER },
    ],
    properties: [
      { 
        id: 'sound', 
        label: 'Sound', 
        type: PropertyType.DROPDOWN, 
        defaultValue: 'Beep',
        options: ['Beep', 'Explosion', 'Jump', 'Collect', 'Win', 'Lose', 'Footstep', 'Ambient', 'Impact', 'UI_Click'],
        description: 'Audio clip to play'
      },
      { id: 'volume', label: 'Volume', type: PropertyType.SLIDER, defaultValue: 1, min: 0, max: 1, step: 0.01 },
      { id: 'pitch', label: 'Pitch', type: PropertyType.SLIDER, defaultValue: 1, min: 0.5, max: 2, step: 0.01 },
      { id: 'loop', label: 'Loop', type: PropertyType.BOOLEAN, defaultValue: false },
      { id: 'spatial', label: '3D Spatial', type: PropertyType.BOOLEAN, defaultValue: false },
    ],
    values: { sound: 'Beep', volume: 1, pitch: 1, loop: false, spatial: false },
    tags: ['audio', 'sound', 'feedback'],
  },
};

// AI nodes - These leverage AI for dynamic content
export const AI_NODES = {
  GENERATE_TEXT: {
    type: NodeType.AI,
    label: 'Generate Text',
    description: 'Generates text using AI based on a prompt',
    category: NodeCategory.AI,
    inputs: [
      { id: 'trigger', label: 'Trigger', type: PortType.TRIGGER, required: true },
      { id: 'prompt', label: 'Prompt', type: PortType.STRING },
      { id: 'context', label: 'Context', type: PortType.STRING },
    ],
    outputs: [
      { id: 'trigger', label: 'On Complete', type: PortType.TRIGGER },
      { id: 'text', label: 'Generated Text', type: PortType.STRING },
    ],
    properties: [
      { id: 'prompt', label: 'Default Prompt', type: PropertyType.TEXT, defaultValue: 'Generate a description', multiline: true },
      { id: 'maxLength', label: 'Max Length', type: PropertyType.INTEGER, defaultValue: 100, min: 10, max: 1000 },
      { id: 'temperature', label: 'Temperature', type: PropertyType.SLIDER, defaultValue: 0.7, min: 0.1, max: 1.5, step: 0.01 },
      { id: 'cacheResults', label: 'Cache Results', type: PropertyType.BOOLEAN, defaultValue: true },
    ],
    values: { prompt: 'Generate a description', maxLength: 100, temperature: 0.7, cacheResults: true },
    tags: ['ai', 'text', 'generation', 'content'],
    isAdvanced: false,
  },
  ANALYZE_IMAGE: {
    type: NodeType.AI,
    label: 'Analyze Image',
    description: 'Analyzes an image to extract information',
    category: NodeCategory.AI,
    inputs: [
      { id: 'trigger', label: 'Trigger', type: PortType.TRIGGER, required: true },
      { id: 'image', label: 'Image', type: PortType.TEXTURE, required: true },
      { id: 'query', label: 'Query', type: PortType.STRING },
    ],
    outputs: [
      { id: 'trigger', label: 'On Complete', type: PortType.TRIGGER },
      { id: 'description', label: 'Description', type: PortType.STRING },
      { id: 'objects', label: 'Detected Objects', type: PortType.ARRAY },
      { id: 'colors', label: 'Dominant Colors', type: PortType.ARRAY },
    ],
    properties: [
      { id: 'analysisType', label: 'Analysis Type', type: PropertyType.DROPDOWN, defaultValue: 'general', 
        options: ['general', 'objects', 'text', 'faces', 'colors', 'custom'] },
      { id: 'detailLevel', label: 'Detail Level', type: PropertyType.SLIDER, defaultValue: 0.7, min: 0.1, max: 1, step: 0.1 },
    ],
    values: { analysisType: 'general', detailLevel: 0.7 },
    tags: ['ai', 'image', 'analysis', 'vision'],
    isAdvanced: true,
  },
  GENERATE_BEHAVIOR: {
    type: NodeType.AI,
    label: 'AI Behavior',
    description: 'Generates dynamic NPC behavior using AI',
    category: NodeCategory.AI,
    inputs: [
      { id: 'trigger', label: 'Trigger', type: PortType.TRIGGER, required: true },
      { id: 'npc', label: 'Character', type: PortType.OBJECT, required: true },
      { id: 'playerAction', label: 'Player Action', type: PortType.STRING },
      { id: 'environment', label: 'Environment', type: PortType.OBJECT },
    ],
    outputs: [
      { id: 'trigger', label: 'On Decision', type: PortType.TRIGGER },
      { id: 'action', label: 'Action', type: PortType.STRING },
      { id: 'target', label: 'Target', type: PortType.VECTOR3 },
      { id: 'dialogue', label: 'Dialogue', type: PortType.STRING },
    ],
    properties: [
      { id: 'personality', label: 'Personality', type: PropertyType.TEXT, defaultValue: 'Friendly and helpful', multiline: true },
      { id: 'goal', label: 'Goal', type: PropertyType.TEXT, defaultValue: 'Assist the player', multiline: true },
      { id: 'memory', label: 'Memory Size', type: PropertyType.INTEGER, defaultValue: 10, min: 1, max: 50 },
      { id: 'creativity', label: 'Creativity', type: PropertyType.SLIDER, defaultValue: 0.6, min: 0.1, max: 1, step: 0.1 },
    ],
    values: { personality: 'Friendly and helpful', goal: 'Assist the player', memory: 10, creativity: 0.6 },
    tags: ['ai', 'npc', 'behavior', 'character'],
    isAdvanced: true,
  },
};

// Logic nodes for conditions and control flow
export const LOGIC_NODES = {
  BRANCH: {
    type: NodeType.CONDITION,
    label: 'Branch (If/Else)',
    description: 'Branches flow based on a condition',
    category: NodeCategory.LOGIC,
    inputs: [
      { id: 'trigger', label: 'Trigger', type: PortType.TRIGGER, required: true },
      { id: 'condition', label: 'Condition', type: PortType.BOOLEAN, required: true },
    ],
    outputs: [
      { id: 'true', label: 'If True', type: PortType.TRIGGER },
      { id: 'false', label: 'If False', type: PortType.TRIGGER },
    ],
    values: {},
    tags: ['logic', 'flow', 'condition'],
  },
  COMPARE: {
    type: NodeType.CONDITION,
    label: 'Compare Values',
    description: 'Compares two values',
    category: NodeCategory.LOGIC,
    inputs: [
      { id: 'valueA', label: 'Value A', type: PortType.NUMBER },
      { id: 'valueB', label: 'Value B', type: PortType.NUMBER },
    ],
    outputs: [
      { id: 'result', label: 'Result', type: PortType.BOOLEAN },
      { id: 'equal', label: 'Equal', type: PortType.BOOLEAN },
      { id: 'greater', label: 'Greater Than', type: PortType.BOOLEAN },
      { id: 'less', label: 'Less Than', type: PortType.BOOLEAN },
    ],
    properties: [
      { id: 'comparison', label: 'Comparison', type: PropertyType.DROPDOWN, defaultValue: 'equal', 
        options: ['equal', 'notEqual', 'greater', 'greaterEqual', 'less', 'lessEqual'] },
      { id: 'tolerance', label: 'Tolerance', type: PropertyType.NUMBER, defaultValue: 0.001, min: 0, max: 1, step: 0.001,
        description: 'Tolerance for floating-point comparison' },
    ],
    values: { comparison: 'equal', tolerance: 0.001 },
    tags: ['logic', 'comparison', 'condition'],
  },
};

// Math nodes
export const MATH_NODES = {
  BASIC_MATH: {
    type: NodeType.MATH,
    label: 'Basic Math',
    description: 'Performs basic mathematical operations',
    category: NodeCategory.MATH,
    inputs: [
      { id: 'a', label: 'A', type: PortType.NUMBER, required: true },
      { id: 'b', label: 'B', type: PortType.NUMBER, required: true },
    ],
    outputs: [
      { id: 'result', label: 'Result', type: PortType.NUMBER },
    ],
    properties: [
      { id: 'operation', label: 'Operation', type: PropertyType.DROPDOWN, defaultValue: 'add', 
        options: ['add', 'subtract', 'multiply', 'divide', 'power', 'modulo', 'min', 'max'] },
    ],
    values: { operation: 'add' },
    tags: ['math', 'arithmetic', 'calculation'],
  },
  VECTOR_MATH: {
    type: NodeType.MATH,
    label: 'Vector Math',
    description: 'Performs vector mathematics',
    category: NodeCategory.MATH,
    inputs: [
      { id: 'vectorA', label: 'Vector A', type: PortType.VECTOR3, required: true },
      { id: 'vectorB', label: 'Vector B', type: PortType.VECTOR3 },
    ],
    outputs: [
      { id: 'result', label: 'Result', type: PortType.VECTOR3 },
      { id: 'magnitude', label: 'Magnitude', type: PortType.NUMBER },
      { id: 'normalized', label: 'Normalized', type: PortType.VECTOR3 },
    ],
    properties: [
      { id: 'operation', label: 'Operation', type: PropertyType.DROPDOWN, defaultValue: 'add', 
        options: ['add', 'subtract', 'multiply', 'divide', 'cross', 'dot', 'distance', 'reflect', 'project'] },
    ],
    values: { operation: 'add' },
    tags: ['math', 'vector', '3d', 'physics'],
    isAdvanced: true,
  },
};

// Add new model-related node types
export const MODEL_NODES = {
  LOAD_MODEL: {
    type: NodeType.LOAD_MODEL,
    label: 'Load Model',
    description: 'Loads a 3D character model by its ID',
    category: NodeCategory.MODELS,
    inputs: [
      { id: 'modelId', label: 'Model ID', type: PortType.STRING, required: true }
    ],
    outputs: [
      { id: 'model', label: 'Model', type: PortType.OBJECT }
    ],
    values: {},
    tags: ['model', 'character', '3d'],
  },
  ANIMATE_MODEL: {
    type: NodeType.ANIMATE_MODEL,
    label: 'Animate Model',
    description: 'Plays an animation on a character model',
    category: NodeCategory.MODELS,
    inputs: [
      { id: 'model', label: 'Model', type: PortType.OBJECT, required: true },
      { id: 'animation', label: 'Animation Name', type: PortType.STRING, required: true },
      { id: 'speed', label: 'Speed', type: PortType.NUMBER }
    ],
    outputs: [
      { id: 'completed', label: 'On Complete', type: PortType.EVENT }
    ],
    properties: [
      { id: 'speed', label: 'Speed', type: PropertyType.NUMBER, defaultValue: 1.0, min: 0.1, max: 5.0, step: 0.1 }
    ],
    values: { speed: 1.0 },
    tags: ['animation', 'model', 'character'],
  },
  MOVE_CHARACTER: {
    type: NodeType.MOVE_CHARACTER,
    label: 'Move Character',
    description: 'Moves a character to a target position',
    category: NodeCategory.MODELS,
    inputs: [
      { id: 'model', label: 'Character', type: PortType.OBJECT, required: true },
      { id: 'position', label: 'Target Position', type: PortType.VECTOR3 },
      { id: 'speed', label: 'Speed', type: PortType.NUMBER }
    ],
    outputs: [
      { id: 'reached', label: 'On Reached', type: PortType.EVENT }
    ],
    properties: [
      { id: 'speed', label: 'Speed', type: PropertyType.NUMBER, defaultValue: 1.0, min: 0.1, max: 10.0, step: 0.1 }
    ],
    values: { speed: 1.0 },
    tags: ['movement', 'character', 'model'],
  },
  CHARACTER_ACTION: {
    type: NodeType.CHARACTER_ACTION,
    label: 'Character Action',
    description: 'Triggers a predefined action on a character',
    category: NodeCategory.MODELS,
    isAdvanced: false,
    inputs: [
      { id: 'model', label: 'Character', type: PortType.OBJECT, required: true },
      { id: 'action', label: 'Action', type: PortType.STRING }
    ],
    outputs: [
      { id: 'completed', label: 'On Complete', type: PortType.EVENT }
    ],
    properties: [
      { 
        id: 'action', 
        label: 'Action', 
        type: PropertyType.DROPDOWN, 
        defaultValue: 'idle',
        options: ['idle', 'walk', 'run', 'jump', 'attack', 'die']
      }
    ],
    values: { action: 'idle' },
    tags: ['animation', 'character', 'action'],
  },
};

// Update the ALL_NODE_TYPES to use the proper object format
export const ALL_NODE_TYPES = {
  ...LOGIC_NODES,
  ...MATH_NODES,
  ...EVENT_NODES,
  ...ACTION_NODES,
  ...AI_NODES,
  ...MODEL_NODES // Add the model nodes
};

// Helper function to get nodes by category
export const getNodesByCategory = (category: NodeCategory) => {
  return Object.entries(ALL_NODE_TYPES).filter(([_, node]) => node.category === category);
};

// Helper function to search nodes by text
export const searchNodes = (searchText: string) => {
  const lowerCaseSearch = searchText.toLowerCase();
  return Object.entries(ALL_NODE_TYPES).filter(([_, node]) => {
    return (
      node.label.toLowerCase().includes(lowerCaseSearch) ||
      (node.description?.toLowerCase().includes(lowerCaseSearch)) ||
      (node.tags?.some(tag => tag.toLowerCase().includes(lowerCaseSearch)))
    );
  });
}; 