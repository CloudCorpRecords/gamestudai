import React, { useState, useEffect, useRef } from 'react';
import './GameStudio2D.css';
import { RPGCharacter, RPGTile, RPGMap, RPGEvent, RPGGameState } from './types';
import gameBridge from './GameBridge';
import scriptIntegration from './ScriptIntegration';
import EventEditor from './EventEditor';
import ScriptSelector from './ScriptSelector';
import CutsceneEditor from './CutsceneEditor';
import CutscenePlayer from './CutscenePlayer';

// RPG Maker-style templates and resources
const CHARACTER_TEMPLATES: RPGCharacter[] = [
  {
    id: 'hero',
    name: 'Hero',
    sprite: 'hero.png',
    position: { x: 5, y: 5 },
    direction: 'down',
    stats: {
      hp: 100,
      mp: 50,
      level: 1,
      attack: 10,
      defense: 8,
      speed: 5
    },
    inventory: ['Potion', 'Basic Sword'],
    skills: ['Attack', 'Heal']
  },
  {
    id: 'warrior',
    name: 'Warrior',
    sprite: 'warrior.png',
    position: { x: 5, y: 5 },
    direction: 'down',
    stats: {
      hp: 150,
      mp: 20,
      level: 1,
      attack: 15,
      defense: 12,
      speed: 3
    },
    inventory: ['Potion', 'Basic Axe'],
    skills: ['Attack', 'Power Strike']
  },
  {
    id: 'mage',
    name: 'Mage',
    sprite: 'mage.png',
    position: { x: 5, y: 5 },
    direction: 'down',
    stats: {
      hp: 70,
      mp: 100,
      level: 1,
      attack: 5,
      defense: 5,
      speed: 6
    },
    inventory: ['Mana Potion', 'Basic Staff'],
    skills: ['Attack', 'Fire Ball', 'Ice Shard']
  }
];

// Default tile types
const TILE_TYPES: { [key: string]: Omit<RPGTile, 'id'> } = {
  grass: {
    type: 'ground',
    sprite: 'grass.png',
    walkable: true
  },
  water: {
    type: 'water',
    sprite: 'water.png',
    walkable: false
  },
  tree: {
    type: 'wall',
    sprite: 'tree.png',
    walkable: false
  },
  path: {
    type: 'ground',
    sprite: 'path.png',
    walkable: true
  },
  chest: {
    type: 'chest',
    sprite: 'chest.png',
    walkable: false,
    properties: {
      contains: ['Gold', 'Potion']
    }
  },
  door: {
    type: 'door',
    sprite: 'door.png',
    walkable: true,
    properties: {
      teleportTo: { mapId: 'house_interior', x: 5, y: 10 }
    }
  }
};

// Default map template
const DEFAULT_MAP: RPGMap = {
  id: 'town',
  name: 'Starting Town',
  width: 20,
  height: 15,
  tiles: Array(15).fill(null).map((_, y) => 
    Array(20).fill(null).map((_, x) => ({
      id: `tile_${x}_${y}`,
      ...TILE_TYPES.grass,
      // Create a path in the middle
      ...(x >= 8 && x <= 12 ? TILE_TYPES.path : {})
    }))
  ),
  events: [
    {
      id: 'welcome_event',
      trigger: 'auto',
      actions: [
        {
          type: 'message',
          params: { text: 'Welcome to our 2D RPG! Use arrow keys to move around.' }
        }
      ]
    }
  ]
};

// Initial game state
const INITIAL_GAME_STATE: RPGGameState = {
  currentMap: DEFAULT_MAP,
  player: CHARACTER_TEMPLATES[0], // Hero as default
  npcs: [
    {
      ...CHARACTER_TEMPLATES[2], // Mage as NPC
      id: 'village_mage',
      name: 'Village Mage',
      position: { x: 10, y: 3 }
    }
  ],
  variables: {},
  switches: {},
  gameTime: 0,
  inventory: ['Potion', 'Basic Sword']
};

// Extend RPGMap interface to include opening cutscene
interface RPGMapWithCutscene extends RPGMap {
  openingCutscene?: RPGEvent;
}

// Main component
const GameStudio2D: React.FC = () => {
  // Add screen state to control what's displayed
  const [currentScreen, setCurrentScreen] = useState<'editor' | 'start' | 'options' | 'playing' | 'cutscene'>('editor');
  
  // State for the 2D game studio
  const [isEditing, setIsEditing] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<RPGGameState>({
    currentMap: createTownMap(),
    player: CHARACTER_TEMPLATES[0],
    npcs: [
      { ...CHARACTER_TEMPLATES[1], position: { x: 10, y: 8 } },
      { ...CHARACTER_TEMPLATES[2], position: { x: 15, y: 12 } }
    ],
    variables: {},
    switches: {},
    gameTime: 0,
    inventory: ['Potion', 'Basic Sword']
  });
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedTile, setSelectedTile] = useState<string>('grass');
  const [mapSize, setMapSize] = useState({ width: 20, height: 15 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const preview3DRef = useRef<HTMLDivElement>(null);

  // Add current tool state
  const [currentTool, setCurrentTool] = useState<string>('select');

  // Add new state for script integration
  const [showEventEditor, setShowEventEditor] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<RPGEvent | null>(null);
  const [showScriptSelector, setShowScriptSelector] = useState<boolean>(false);
  const [scriptLibraryLoaded, setScriptLibraryLoaded] = useState<boolean>(false);

  // Add state to track if we should return to editor
  const [returnToEditor, setReturnToEditor] = useState(false);

  // Add state for cutscene editor
  const [showCutsceneEditor, setShowCutsceneEditor] = useState<boolean>(false);
  const [currentCutscene, setCurrentCutscene] = useState<RPGEvent | null>(null);
  const [showCutscenePlayer, setShowCutscenePlayer] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    playOpeningCutscene: true,
    showTitle: true,
    titleText: 'Fantasy Adventure',
    titleBackground: 'default_bg',
  });

  // Add cutscene state
  const [cutsceneActive, setCutsceneActive] = useState<boolean>(false);

  // Add game settings editor
  const [showGameSettingsEditor, setShowGameSettingsEditor] = useState<boolean>(false);

  // Start screen handlers
  const handleStartNewGame = () => {
    // Check if we have an edited map from the editor
    const savedEditorMap = localStorage.getItem('rpgmaker_editor_map');
    
    // Set up new game state
    const newGameState = {
      // Use the saved map from the editor if available, otherwise create a fresh map
      currentMap: savedEditorMap ? JSON.parse(savedEditorMap) : createTownMap(),
      player: CHARACTER_TEMPLATES[0],
      npcs: [
        { ...CHARACTER_TEMPLATES[1], position: { x: 10, y: 8 } },
        { ...CHARACTER_TEMPLATES[2], position: { x: 15, y: 12 } }
      ],
      variables: {},
      switches: {},
      gameTime: 0,
      inventory: ['Potion', 'Basic Sword']
    };
    
    setGameState(newGameState);
    setIsPlaying(true);
    
    // Check if this map has an opening cutscene and settings allow for it
    if (gameSettings.playOpeningCutscene && 
        (newGameState.currentMap as RPGMapWithCutscene).openingCutscene) {
      // Start in cutscene mode
      setCutsceneActive(true);
      setCurrentCutscene((newGameState.currentMap as RPGMapWithCutscene).openingCutscene);
      setCurrentScreen('cutscene');
    } else {
      // Skip to regular gameplay
      setCurrentScreen('playing');
    }
  };

  const handleContinueGame = () => {
    // Check if we have an edited map from the editor
    const savedEditorMap = localStorage.getItem('rpgmaker_editor_map');
    
    const savedGame = localStorage.getItem('rpgmaker_last_session');
    if (savedGame) {
      try {
        const gameData = JSON.parse(savedGame) as RPGGameState;
        
        // If we have an edited map from the editor, use it instead of the saved map
        if (savedEditorMap && returnToEditor) {
          gameData.currentMap = JSON.parse(savedEditorMap);
        }
        
        setGameState(gameData);
        setMapSize({ 
          width: gameData.currentMap.width, 
          height: gameData.currentMap.height 
        });
        setIsPlaying(true);
        setCurrentScreen('playing');
      } catch (e) {
        alert('Could not load last session. Starting new game.');
        handleStartNewGame();
      }
    } else {
      alert('No previous session found. Starting new game.');
      handleStartNewGame();
    }
  };

  const handleLoadSavedGame = () => {
    // Check if we have an edited map from the editor
    const savedEditorMap = localStorage.getItem('rpgmaker_editor_map');
    
    const savedGame = localStorage.getItem('rpgmaker_game');
    if (savedGame) {
      try {
        const gameData = JSON.parse(savedGame) as RPGGameState;
        
        // If we have an edited map from the editor, use it instead of the saved map
        if (savedEditorMap && returnToEditor) {
          gameData.currentMap = JSON.parse(savedEditorMap);
        }
        
        setGameState(gameData);
        setMapSize({ 
          width: gameData.currentMap.width, 
          height: gameData.currentMap.height 
        });
        setIsPlaying(true);
        setCurrentScreen('playing');
        alert('Game loaded!');
      } catch (e) {
        alert('Could not load saved game.');
      }
    } else {
      alert('No saved game found.');
    }
  };

  // Back to editor button handler
  const handleBackToEditor = () => {
    // Stop game and return to editor
    setIsPlaying(false);
    setIsEditing(true);
    setCurrentScreen('editor');
    setReturnToEditor(false);
    // If there was a game loop running, cancel it
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };

  // Back to start screen button handler
  const handleBackToStartScreen = () => {
    // Save current game state as last session
    localStorage.setItem('rpgmaker_last_session', JSON.stringify(gameState));
    // Stop playing and go back to start screen
    setIsPlaying(false);
    setCurrentScreen('start');
  };

  // Initialize script integration
  useEffect(() => {
    const initScriptIntegration = async () => {
      const success = await scriptIntegration.initialize();
      setScriptLibraryLoaded(success);
      console.log(`Script integration ${success ? 'initialized' : 'failed to initialize'}`);
    };
    
    initScriptIntegration();
  }, []);

  // Set up the game canvas
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw the game map
        drawMap(ctx);
        
        // Draw characters
        drawCharacters(ctx);
      }
    }
  }, [gameState, isEditing, isPlaying]);

  // Handle key presses for player movement
  useEffect(() => {
    if (isPlaying) {
      const keys = {
        up: false,
        down: false,
        left: false,
        right: false,
        interact: false
      };

      // Clean up any existing animation elements
      document.querySelectorAll('.movement-ripple').forEach(el => el.remove());
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isPlaying) return;
        
        // Prevent default behavior for game controls
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ', 'Enter'].includes(e.key)) {
          e.preventDefault();
        }
        
        // Update keys state
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
            keys.up = true;
            break;
          case 'ArrowDown':
          case 's':
            keys.down = true;
            break;
          case 'ArrowLeft':
          case 'a':
            keys.left = true;
            break;
          case 'ArrowRight':
          case 'd':
            keys.right = true;
            break;
          case ' ':
          case 'Enter':
          case 'e':
            keys.interact = true;
            // Process immediate interaction
            const interactPos = getPositionInFront(gameState.player.position, gameState.player.direction);
            handleInteraction(interactPos);
            break;
        }

        movePlayer();
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        // Update keys state on key release
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
            keys.up = false;
            break;
          case 'ArrowDown':
          case 's':
            keys.down = false;
            break;
          case 'ArrowLeft':
          case 'a':
            keys.left = false;
            break;
          case 'ArrowRight':
          case 'd':
            keys.right = false;
            break;
          case ' ':
          case 'Enter':
          case 'e':
            keys.interact = false;
            break;
        }
      };

      const movePlayer = () => {
        let newPosition = { ...gameState.player.position };
        let newDirection = gameState.player.direction;
        let moved = false;

        // Determine movement direction
        if (keys.up && !keys.down) {
          newPosition.y = Math.max(0, newPosition.y - 1);
          newDirection = 'up';
          moved = true;
        } else if (keys.down && !keys.up) {
          newPosition.y = Math.min(gameState.currentMap.height - 1, newPosition.y + 1);
          newDirection = 'down';
          moved = true;
        }

        if (keys.left && !keys.right) {
          newPosition.x = Math.max(0, newPosition.x - 1);
          
          // Keep y-axis direction if moving diagonally, otherwise set to left
          if (!keys.up && !keys.down) {
            newDirection = 'left';
          }
          
          moved = true;
        } else if (keys.right && !keys.left) {
          newPosition.x = Math.min(gameState.currentMap.width - 1, newPosition.x + 1);
          
          // Keep y-axis direction if moving diagonally, otherwise set to right
          if (!keys.up && !keys.down) {
            newDirection = 'right';
          }
          
          moved = true;
        }

        if (moved) {
        // Check if the new position is walkable
        const targetTile = gameState.currentMap.tiles[newPosition.y]?.[newPosition.x];
          
        if (targetTile && targetTile.walkable) {
            // Update player position with smooth transition
            const playerElement = document.querySelector('.player-character');
            if (playerElement && playerElement instanceof HTMLElement) {
              // Apply smooth transition
              playerElement.style.transition = 'transform 0.15s ease-out';
              playerElement.style.transform = `translate(${0}px, ${0}px)`;
              
              // Update actual position instead of using transform
              playerElement.style.left = `${newPosition.x * 32}px`;
              playerElement.style.top = `${newPosition.y * 32}px`;
            }
            
          setGameState(prev => ({
            ...prev,
            player: {
              ...prev.player,
              position: newPosition,
              direction: newDirection
            }
          }));
          
          // Check for events at new position
          checkForEvents(newPosition);
            
            // Add movement feedback
            addMovementFeedback(newPosition);
          }
        }
      };

      // Add visual feedback for movement
      const addMovementFeedback = (position: {x: number, y: number}) => {
        // Disable the ripple effect to remove splashing animation
        return;
      };

      // Add ripple animation style if not exists
      if (!document.getElementById('ripple-animation')) {
        // Disabled to remove splashing animation
        // const style = document.createElement('style');
        // style.id = 'ripple-animation';
        // style.textContent = `
        //   @keyframes ripple {
        //     0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
        //     100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        //   }
        // `;
        // document.head.appendChild(style);
      }
      
      // Add controls help indicator
      const controlsIndicator = document.createElement('div');
      controlsIndicator.id = 'controls-indicator';
      controlsIndicator.className = 'controls-indicator';
      controlsIndicator.innerHTML = `
        <div style="padding: 10px; background: rgba(0,0,0,0.7); color: white; position: fixed; bottom: 10px; left: 10px; border-radius: 5px; z-index: 1000;">
          <strong>Controls:</strong>
          <div>Move: WASD / Arrow Keys</div>
          <div>Interact: E / Space / Enter</div>
        </div>
      `;
      document.body.appendChild(controlsIndicator);
      
      // Set up event listeners
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      // Movement loop for smooth continuous movement
      const movementLoop = setInterval(movePlayer, 150); // Player movement speed in ms
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        clearInterval(movementLoop);
        
        // Clean up UI elements
        const indicator = document.getElementById('controls-indicator');
        if (indicator) indicator.remove();
        
        // Clean up ripple-related elements and styles
        const rippleStyle = document.getElementById('ripple-animation');
        if (rippleStyle) rippleStyle.remove();
        
        // Remove any remaining ripple animations
        document.querySelectorAll('.movement-ripple').forEach(el => el.remove());
      };
    }
  }, [isPlaying, gameState]);
  
  // Start game loop when playing (for NPCs and game time)
  useEffect(() => {
    if (isPlaying) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      
      const gameLoop = () => {
        // Update game time
        setGameState(prev => ({
          ...prev,
          gameTime: prev.gameTime + 1
        }));
        
        // Update NPCs (simple movement)
        if (gameState.gameTime % 30 === 0) {
          updateNPCs();
        }
        
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      
      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
        
        // Clean up player character element when game stops
        const playerElement = document.querySelector('.player-character');
        if (playerElement) {
          playerElement.remove();
        }
      };
    }
  }, [isPlaying, gameState.gameTime]);
  
  // Helper function to get position in front of character
  const getPositionInFront = (position: {x: number, y: number}, direction: string) => {
    const newPos = {...position};
    switch (direction) {
      case 'up': newPos.y--; break;
      case 'down': newPos.y++; break;
      case 'left': newPos.x--; break;
      case 'right': newPos.x++; break;
    }
    return newPos;
  };
  
  // Update the handleInteraction function to process visual scripts
  const handleInteraction = (position: {x: number, y: number}) => {
    const tile = gameState.currentMap.tiles[position.y]?.[position.x];
    if (!tile) return;
    
    // Check for interactive tiles
    if (tile.type === 'chest') {
      alert(`You found: ${tile.properties?.contains?.join(', ')}`);
    } else if (tile.type === 'door') {
      alert(`Door leads to: ${tile.properties?.teleportTo?.mapId}`);
    }
    
    // Check for NPCs
    const npc = gameState.npcs.find(n => 
      n.position.x === position.x && n.position.y === position.y
    );
    
    if (npc) {
      alert(`${npc.name} says: Hello adventurer!`);
    }
    
    // Check for events at the position
    const events = checkForEvents(position);
    if (events.length > 0) {
      // Process each event
      events.forEach(async (event) => {
        // Check if the event has a visual script
        if (scriptIntegration.hasVisualScript(event)) {
          console.log(`Processing visual script for event ${event.id}`);
          
          // Execute the visual script
          const result = await scriptIntegration.processScriptEvent(
            event,
            gameState,
            gameState.player.position
          );
          
          if (result.success) {
            console.log('Visual script executed successfully:', result);
            
            // Update game state if needed
            if (result.updatedGameState) {
              setGameState(prevState => ({
                ...prevState,
                ...result.updatedGameState
              }));
            }
            
            // Display message if provided
            if (result.message) {
              // Show message in game UI
              console.log('Script message:', result.message);
            }
          } else {
            console.error('Failed to execute visual script:', result.message);
          }
        } else {
          // Process regular event actions
          event.actions.forEach(action => {
            if (action.type === 'message') {
              alert(action.params.text);
            }
          });
        }
      });
    }
  };
  
  // Check for events at position
  const checkForEvents = (position: {x: number, y: number}) => {
    const events = gameState.currentMap.events.filter(event => 
      event.trigger === 'auto' || event.trigger === 'touch'
    );
    
    return events;
  };
  
  // Update NPCs
  const updateNPCs = () => {
    setGameState(prev => ({
      ...prev,
      npcs: prev.npcs.map(npc => {
        // Simple random movement
        if (Math.random() < 0.3) {
          const directions = ['up', 'down', 'left', 'right'];
          const newDirection = directions[Math.floor(Math.random() * directions.length)] as 'up' | 'down' | 'left' | 'right';
          
          let newPosition = {...npc.position};
          switch (newDirection) {
            case 'up': newPosition.y = Math.max(0, npc.position.y - 1); break;
            case 'down': newPosition.y = Math.min(prev.currentMap.height - 1, npc.position.y + 1); break;
            case 'left': newPosition.x = Math.max(0, npc.position.x - 1); break;
            case 'right': newPosition.x = Math.min(prev.currentMap.width - 1, npc.position.x + 1); break;
          }
          
          // Check if the new position is walkable
          const targetTile = prev.currentMap.tiles[newPosition.y]?.[newPosition.x];
          if (targetTile && targetTile.walkable) {
            return {
              ...npc,
              position: newPosition,
              direction: newDirection
            };
          }
        }
        return npc;
      })
    }));
  };
  
  // Draw the game map
  const drawMap = (ctx: CanvasRenderingContext2D) => {
    const { currentMap } = gameState;
    const tileSize = 32;
    
    for (let y = 0; y < currentMap.height; y++) {
      for (let x = 0; x < currentMap.width; x++) {
        const tile = currentMap.tiles[y][x];
        
        // Draw tile background color based on type
        switch (tile.type) {
          case 'ground':
            ctx.fillStyle = '#7EC850';
            break;
          case 'water':
            ctx.fillStyle = '#5090FF';
            break;
          case 'wall':
            ctx.fillStyle = '#654321';
            break;
          case 'door':
            ctx.fillStyle = '#8B4513';
            break;
          case 'chest':
            ctx.fillStyle = '#FFD700';
            break;
          default:
            ctx.fillStyle = '#333333';
        }
        
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        
        // Add a grid in edit mode
        if (isEditing) {
          ctx.strokeStyle = '#555555';
          ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }
  };
  
  // Draw characters
  const drawCharacters = (ctx: CanvasRenderingContext2D) => {
    const tileSize = 32;
    
    // Draw NPCs
    gameState.npcs.forEach(npc => {
      ctx.fillStyle = '#FF00FF'; // Magenta for NPCs
      ctx.fillRect(
        npc.position.x * tileSize + 4, 
        npc.position.y * tileSize + 4, 
        tileSize - 8, 
        tileSize - 8
      );
      
      // Direction indicator
      drawDirectionIndicator(ctx, npc.position, npc.direction, '#FF00FF');
    });
    
    // Draw player
    ctx.fillStyle = '#00FFFF'; // Cyan for player
    
    // Draw player with border for better visibility
    const playerX = gameState.player.position.x * tileSize;
    const playerY = gameState.player.position.y * tileSize;
    
    ctx.fillRect(playerX + 4, playerY + 4, tileSize - 8, tileSize - 8);
    
    // Add border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(playerX + 4, playerY + 4, tileSize - 8, tileSize - 8);
    
    // Add player-character class for CSS targeting
    const playerElement = document.createElement('div');
    playerElement.className = 'player-character';
    playerElement.style.position = 'absolute';
    playerElement.style.left = `${playerX}px`;
    playerElement.style.top = `${playerY}px`;
    playerElement.style.width = `${tileSize}px`;
    playerElement.style.height = `${tileSize}px`;
    playerElement.style.backgroundColor = 'rgba(0, 255, 255, 0)'; // Make invisible to avoid overlap
    playerElement.style.borderRadius = '4px';
    playerElement.style.zIndex = '100';
    playerElement.style.transition = 'transform 0.15s ease-out';
    playerElement.setAttribute('data-direction', gameState.player.direction);
    
    // Remove any existing player element
    const existingPlayer = document.querySelector('.player-character');
    if (existingPlayer) {
      existingPlayer.remove();
    }
    
    // Add to canvas parent
    canvasRef.current?.parentElement?.appendChild(playerElement);
    
    // Direction indicator with enhanced visibility
    drawDirectionIndicator(ctx, gameState.player.position, gameState.player.direction, '#00FFFF');
  };
  
  // Draw direction indicator
  const drawDirectionIndicator = (
    ctx: CanvasRenderingContext2D, 
    position: {x: number, y: number}, 
    direction: string, 
    color: string
  ) => {
    const tileSize = 32;
    const centerX = position.x * tileSize + tileSize / 2;
    const centerY = position.y * tileSize + tileSize / 2;
    const size = tileSize / 5; // Slightly smaller for better alignment
    
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Draw the direction indicator directly attached to the player square
    ctx.beginPath();
    
    // Calculate offset to place the indicator just outside the player square
    const offset = tileSize / 2 - 2; // Half tile size minus a small gap
    
    switch (direction) {
      case 'up':
        // Arrow pointing up from top of player square
        ctx.moveTo(centerX, centerY - offset);
        ctx.lineTo(centerX - size, centerY - offset + size);
        ctx.lineTo(centerX + size, centerY - offset + size);
        break;
      case 'down':
        // Arrow pointing down from bottom of player square
        ctx.moveTo(centerX, centerY + offset);
        ctx.lineTo(centerX - size, centerY + offset - size);
        ctx.lineTo(centerX + size, centerY + offset - size);
        break;
      case 'left':
        // Arrow pointing left from left side of player square
        ctx.moveTo(centerX - offset, centerY);
        ctx.lineTo(centerX - offset + size, centerY - size);
        ctx.lineTo(centerX - offset + size, centerY + size);
        break;
      case 'right':
        // Arrow pointing right from right side of player square
        ctx.moveTo(centerX + offset, centerY);
        ctx.lineTo(centerX + offset - size, centerY - size);
        ctx.lineTo(centerX + offset - size, centerY + size);
        break;
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  
  // Handle tile click in edit mode
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.floor((e.clientX - rect.left) / 32);
    const y = Math.floor((e.clientY - rect.top) / 32);
    
    // Make sure coordinates are within map bounds
    if (x < 0 || x >= gameState.currentMap.width || y < 0 || y >= gameState.currentMap.height) {
      return;
    }
    
    console.log(`Canvas clicked at tile (${x}, ${y})`);
    
    // Handle different tools
    switch (currentTool) {
      case 'select':
        // Select tile or entity at position
        const tile = gameState.currentMap.tiles[y][x];
        console.log('Selected tile:', tile);
        
        // Check if there's an event at this position
        const events = gameState.currentMap.events.filter(event => {
          // For simplicity, we're assuming events have a position property
          // You might need to adjust this based on your actual event structure
          return event.position?.x === x && event.position?.y === y;
        });
        
        if (events.length > 0) {
          // Edit the first event at this position
          handleEditEvent(events[0].id);
        }
        break;
        
      case 'placeTile':
        // Place selected tile type
        const newTiles = [...gameState.currentMap.tiles];
        newTiles[y][x] = {
          id: `tile_${x}_${y}`,
          type: selectedTile as any,
          sprite: `${selectedTile}.png`,
          walkable: selectedTile !== 'wall' && selectedTile !== 'water'
        };
        
        setGameState(prevState => ({
          ...prevState,
          currentMap: {
            ...prevState.currentMap,
            tiles: newTiles
          }
        }));
        break;
        
      case 'placePlayer':
        // Place player at position
        setGameState(prevState => ({
          ...prevState,
          player: {
            ...prevState.player,
            position: { x, y }
          }
        }));
        break;
        
      case 'placeNPC':
        // Place a new NPC
        const newNPC = {
          ...CHARACTER_TEMPLATES[Math.floor(Math.random() * CHARACTER_TEMPLATES.length)],
          id: `npc_${Date.now()}`,
          position: { x, y }
        };
        
        setGameState(prevState => ({
          ...prevState,
          npcs: [...prevState.npcs, newNPC]
        }));
        break;
        
      case 'addEvent':
        // Create a new event at this position
        const newEvent: RPGEvent = {
          id: `event_${Date.now()}`,
          trigger: 'action',
          position: { x, y },
          actions: [
            {
              type: 'message',
              params: { text: 'New event' }
            }
          ]
        };
        
        setCurrentEvent(newEvent);
        setShowEventEditor(true);
        break;
        
      default:
        break;
    }
  };
  
  // Handle map size changes
  const handleMapSizeChange = () => {
    if (isEditing) {
      // Create a new map with the updated size
      const newTiles = Array(mapSize.height).fill(null).map((_, y) => 
        Array(mapSize.width).fill(null).map((_, x) => {
          // Reuse existing tiles where possible
          if (y < gameState.currentMap.height && x < gameState.currentMap.width) {
            return gameState.currentMap.tiles[y][x];
          }
          return {
            id: `tile_${x}_${y}`,
            ...TILE_TYPES.grass
          };
        })
      );
      
      setGameState(prev => ({
        ...prev,
        currentMap: {
          ...prev.currentMap,
          width: mapSize.width,
          height: mapSize.height,
          tiles: newTiles
        }
      }));
    }
  };
  
  // Create a new RPG game
  const handleCreateNewGame = () => {
    const confirmed = window.confirm('Create a new game? This will reset all changes.');
    if (confirmed) {
      setGameState(INITIAL_GAME_STATE);
      setIsEditing(true);
      setIsPlaying(false);
      setSelectedTool('select');
      setSelectedTile('grass');
      setMapSize({ width: 20, height: 15 });
    }
  };
  
  // Save the current game
  const handleSaveGame = () => {
    const gameData = JSON.stringify(gameState);
    localStorage.setItem('rpgmaker_game', gameData);
    alert('Game saved!');
  };
  
  // Export the game
  const handleExportGame = () => {
    const gameData = JSON.stringify(gameState, null, 2);
    const blob = new Blob([gameData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rpg_game.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  // Add the 3D export functionality
  const exportTo3D = () => {
    const gameState = (window as any).currentRPGState;
    if (!gameState) {
      alert('No game state available to export.');
      return;
    }
    
    try {
      // Convert the 2D game to a 3D scene
      const scene3D = gameBridge.exportAs3DScene(gameState);
      
      if (!scene3D) {
        throw new Error('Failed to create 3D scene from current game.');
      }
      
      // Check if the 3D engine API is available
      if ((window as any).GameSetupAPI?.createGameSetup) {
        // Use the GameSetupAPI to create the 3D scene
        const success = (window as any).GameSetupAPI.createGameSetup(scene3D, {});
        
        if (success) {
          alert('Successfully exported game to 3D! Go to the World Creator tab to see it.');
        } else {
          throw new Error('Failed to set up 3D scene in the game engine.');
        }
      } else if (window.gameEngine) {
        // Use the gameEngine directly
        if (window.gameEngine.loadScene) {
          window.gameEngine.loadScene(scene3D);
          alert('Successfully exported game to 3D! Go to the World Creator tab to see it.');
        } else {
          throw new Error('Game engine does not support loading scenes.');
        }
      } else {
        throw new Error('No 3D engine available to export to.');
      }
    } catch (error) {
      alert(`Error exporting to 3D: ${error}`);
      console.error('Export to 3D error:', error);
    }
  };

  // Function to render a 3D preview
  const renderPreview3D = () => {
    if (!preview3DRef.current) return;
    
    // Keep track of the current game state globally for export
    (window as any).currentRPGState = gameState;
    
    try {
      // Clear previous preview
      preview3DRef.current.innerHTML = '';
      preview3DRef.current.textContent = 'Generating 3D preview...';
      
      // Render the current 2D game in 3D
      setTimeout(() => {
        if (preview3DRef.current) {
          preview3DRef.current.textContent = '';
          gameBridge.render2DGameIn3D(gameState, preview3DRef.current);
        }
      }, 100);
    } catch (error) {
      console.error('Error generating 3D preview:', error);
      if (preview3DRef.current) {
        preview3DRef.current.textContent = 'Error generating preview';
      }
    }
  };

  // Add event editor handling
  const handleAddEvent = (position: {x: number, y: number}) => {
    setCurrentEvent(null); // Create new event
    setShowEventEditor(true);
  };
  
  const handleEditEvent = (eventId: string) => {
    const event = gameState.currentMap.events.find(e => e.id === eventId);
    if (event) {
      setCurrentEvent(event);
      setShowEventEditor(true);
    }
  };
  
  const handleSaveEvent = (event: RPGEvent) => {
    // Check if it's a new event or an existing one
    const isNewEvent = !gameState.currentMap.events.some(e => e.id === event.id);
    
    if (isNewEvent) {
      // Add new event to the map
      setGameState(prevState => ({
        ...prevState,
        currentMap: {
          ...prevState.currentMap,
          events: [...prevState.currentMap.events, event]
        }
      }));
    } else {
      // Update existing event
      setGameState(prevState => ({
        ...prevState,
        currentMap: {
          ...prevState.currentMap,
          events: prevState.currentMap.events.map(e => 
            e.id === event.id ? event : e
          )
        }
      }));
    }
    
    setShowEventEditor(false);
    setCurrentEvent(null);
  };
  
  const handleDeleteEvent = (eventId: string) => {
    // Remove event from the map
    setGameState(prevState => ({
      ...prevState,
      currentMap: {
        ...prevState.currentMap,
        events: prevState.currentMap.events.filter(e => e.id !== eventId)
      }
    }));
    
    setShowEventEditor(false);
    setCurrentEvent(null);
  };

  // Game loop for rendering the game
  const gameLoop = () => {
    if (!canvasRef.current) return;
    
    // Draw the game
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw map
      drawMap(ctx);
      
      // Draw characters
      drawCharacters(ctx);
    }
    
    // Continue the game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  // Play mode button handler
  const handlePlayModeClick = () => {
    setIsEditing(false);
    // Save the current map for use when starting the game
    localStorage.setItem('rpgmaker_editor_map', JSON.stringify(gameState.currentMap));
    // Instead of directly starting the game, show the start screen
    setCurrentScreen('start');
    // Keep track that we came from the editor
    setReturnToEditor(true);
  };

  // Start Screen Component
  const StartScreen = () => {
    return (
      <div className="start-screen">
        <div className="start-screen-bg">
          <div className="splash-image"></div>
        </div>
        <div className="start-screen-content">
          <h1 className="game-title">Fantasy RPG Maker</h1>
          <div className="menu-container">
            <button className="menu-button" onClick={handleStartNewGame}>New Game</button>
            <button className="menu-button" onClick={handleLoadSavedGame}>Load Game</button>
            <button className="menu-button" onClick={handleContinueGame}>Continue</button>
            <button className="menu-button" onClick={() => setCurrentScreen('options')}>Options</button>
            {returnToEditor && (
              <button className="menu-button back-to-editor" onClick={handleBackToEditor}>
                Back to Editor
              </button>
            )}
          </div>
          <div className="version-info">
            <p>Version 1.0.0</p>
            <p>© 2023 GameStudAI Engine</p>
          </div>
        </div>
      </div>
    );
  };

  // Options Screen Component
  const OptionsScreen = () => {
    return (
      <div className="options-screen">
        <div className="options-content">
          <h2>Options</h2>
          <div className="options-controls">
            {/* Add options controls here */}
            <p>No configurable options available yet.</p>
          </div>
          <button className="back-button" onClick={() => setCurrentScreen('start')}>
            Back to Main Menu
          </button>
        </div>
      </div>
    );
  };

  // Playing Game Component
  const PlayingGame = () => {
    // Make sure game loop is running
    useEffect(() => {
      if (!gameLoopRef.current) {
        gameLoop();
      }
      
      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      };
    }, []);
    
    const [playingOpeningCutscene, setPlayingOpeningCutscene] = useState(false);
    
    // Check for opening cutscene on game start
    useEffect(() => {
      if (gameState.currentMap.openingCutscene) {
        setPlayingOpeningCutscene(true);
      }
    }, []);
    
    return (
      <div className="playing-game">
        <div className="game-header">
          <h3>{gameState.currentMap.name}</h3>
          <div className="game-controls">
            <button onClick={handleBackToStartScreen}>Main Menu</button>
            <button onClick={handleSaveGame}>Save Game</button>
          </div>
        </div>
        <div className="game-canvas-container">
          <canvas 
            ref={canvasRef}
            width={gameState.currentMap.width * 32}
            height={gameState.currentMap.height * 32}
            className="play-mode"
          />
        </div>
        <div className="game-stats">
          <div className="player-stats">
            <span>HP: {gameState.player.stats.hp}</span>
            <span>MP: {gameState.player.stats.mp}</span>
            <span>Level: {gameState.player.stats.level}</span>
          </div>
        </div>
        
        {/* Play opening cutscene if available */}
        {playingOpeningCutscene && gameState.currentMap.openingCutscene && (
          <CutscenePlayer
            event={gameState.currentMap.openingCutscene}
            onComplete={() => setPlayingOpeningCutscene(false)}
            onSkip={() => setPlayingOpeningCutscene(false)}
            characters={{
              player: 'https://example.com/player-sprite.png',
              npc1: 'https://example.com/npc1-sprite.png',
              npc2: 'https://example.com/npc2-sprite.png'
            }}
            backgrounds={{
              default_bg: 'https://example.com/default-bg.jpg',
              town_bg: 'https://example.com/town-bg.jpg',
              castle_bg: 'https://example.com/castle-bg.jpg',
              forest_bg: 'https://example.com/forest-bg.jpg',
              cave_bg: 'https://example.com/cave-bg.jpg'
            }}
          />
        )}
      </div>
    );
  };

  // Cutscene Player Component
  const CutscenePlayer = () => {
    // State to track current action in cutscene
    const [currentActionIndex, setCurrentActionIndex] = useState(0);
    
    // Handle next action
    const handleNextAction = () => {
      if (!currentCutscene || currentActionIndex >= currentCutscene.actions.length - 1) {
        // End of cutscene
        handleSkipCutscene();
      } else {
        setCurrentActionIndex(prevIndex => prevIndex + 1);
      }
    };
    
    // Render current action
    const renderCurrentAction = () => {
      if (!currentCutscene || currentCutscene.actions.length === 0) {
        return <div>No actions in cutscene</div>;
      }
      
      const action = currentCutscene.actions[currentActionIndex];
      
      switch (action.type) {
        case 'message':
          return (
            <div className="cutscene-dialog">
              <div className="dialog-box">
                <p>{action.params.text}</p>
                <div className="dialog-controls">
                  <button onClick={handleNextAction}>Next</button>
                </div>
              </div>
            </div>
          );
          
        // Add other action types as needed
        default:
          return <div>Unknown action type</div>;
      }
    };
    
    return (
      <div className="cutscene-player">
        <div className="cutscene-background">
          {/* Background elements */}
          <canvas 
            ref={canvasRef}
            width={gameState.currentMap.width * 32}
            height={gameState.currentMap.height * 32}
            className="cutscene-canvas"
          />
        </div>
        
        <div className="cutscene-content">
          {renderCurrentAction()}
        </div>
        
        <div className="cutscene-controls">
          <button onClick={handleSkipCutscene} className="skip-button">Skip Cutscene</button>
        </div>
      </div>
    );
  };

  // Game Settings Editor Component
  const GameSettingsEditor = () => {
    const [localSettings, setLocalSettings] = useState({...gameSettings});
    
    return (
      <div className="game-settings-editor">
        <h3>Game Settings</h3>
        
        <div className="settings-group">
          <label>
            <input 
              type="checkbox" 
              checked={localSettings.playOpeningCutscene}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                playOpeningCutscene: e.target.checked
              })}
            />
            Play Opening Cutscene
          </label>
        </div>
        
        <div className="settings-group">
          <label>
            <input 
              type="checkbox" 
              checked={localSettings.showTitle}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                showTitle: e.target.checked
              })}
            />
            Show Title Screen
          </label>
        </div>
        
        <div className="settings-group">
          <label>Title Text:</label>
          <input 
            type="text" 
            value={localSettings.titleText}
            onChange={(e) => setLocalSettings({
              ...localSettings,
              titleText: e.target.value
            })}
          />
        </div>
        
        <div className="settings-group">
          <label>Title Background:</label>
          <select
            value={localSettings.titleBackground}
            onChange={(e) => setLocalSettings({
              ...localSettings,
              titleBackground: e.target.value
            })}
          >
            <option value="default_bg">Default Background</option>
            <option value="fantasy">Fantasy Theme</option>
            <option value="sci_fi">Sci-Fi Theme</option>
            <option value="horror">Horror Theme</option>
          </select>
        </div>
        
        <div className="settings-actions">
          <button onClick={() => setShowGameSettingsEditor(false)}>Cancel</button>
          <button onClick={() => handleSaveGameSettings(localSettings)}>Save</button>
        </div>
      </div>
    );
  };

  // Main render
  if (currentScreen === 'start') {
    return <StartScreen />;
  } else if (currentScreen === 'options') {
    return <OptionsScreen />;
  } else if (currentScreen === 'playing') {
    return <PlayingGame />;
  } else if (currentScreen === 'cutscene') {
    return <CutscenePlayer />;
  } else {
    // Editor view (default)
  return (
    <div className="game-studio-2d">
      <div className="studio-header">
        <h2>2D GameStudio - RPG Maker</h2>
        <div className="header-actions">
          <button onClick={handleCreateNewGame}>New Game</button>
          <button onClick={handleSaveGame}>Save</button>
            <button onClick={handleLoadSavedGame}>Load</button>
          <button onClick={handleExportGame}>Export</button>
          <button onClick={exportTo3D}>Export to 3D</button>
            <button onClick={handleEditGameSettings}>Game Settings</button>
        </div>
      </div>
      
      <div className="studio-content">
        <div className="tools-panel">
          <h3>Tools</h3>
          <div className="tool-buttons">
            <button 
              className={`tool-button ${currentTool === 'select' ? 'active' : ''}`}
              onClick={() => setCurrentTool('select')}
            >
              Select
            </button>
            <button 
              className={`tool-button ${currentTool === 'placeTile' ? 'active' : ''}`}
              onClick={() => setCurrentTool('placeTile')}
            >
              Place Tile
            </button>
            <button 
              className={`tool-button ${currentTool === 'placePlayer' ? 'active' : ''}`}
              onClick={() => setCurrentTool('placePlayer')}
            >
              Place Player
            </button>
            <button 
              className={`tool-button ${currentTool === 'placeNPC' ? 'active' : ''}`}
              onClick={() => setCurrentTool('placeNPC')}
            >
              Place NPC
            </button>
            <button 
              className={`tool-button ${currentTool === 'addEvent' ? 'active' : ''}`}
              onClick={() => setCurrentTool('addEvent')}
            >
              Add Event
            </button>
          </div>
          
          {/* Script Integration Section */}
          {scriptLibraryLoaded && (
            <div className="script-integration-section">
              <h3>Visual Scripts</h3>
              <button 
                className="script-button"
                onClick={() => setShowScriptSelector(true)}
              >
                Browse Scripts
              </button>
              <p className="script-info">
                Use visual scripts created in the Logic Editor to add complex behaviors to your game.
              </p>
            </div>
          )}
          
          {/* Tile Selection */}
          {currentTool === 'placeTile' && (
            <div className="tile-selection">
              <h3>Tile Type</h3>
              <select 
                value={selectedTile}
                onChange={(e) => setSelectedTile(e.target.value)}
              >
                <option value="ground">Ground</option>
                <option value="wall">Wall</option>
                <option value="water">Water</option>
                <option value="door">Door</option>
                <option value="chest">Chest</option>
              </select>
            </div>
          )}
          
          {/* Map Size Controls */}
          <div className="map-size-controls">
            <h3>Map Size</h3>
            <div className="size-inputs">
              <div className="size-input">
                <label>Width:</label>
                <input 
                  type="number" 
                  value={mapSize.width}
                  onChange={(e) => setMapSize(prev => ({ ...prev, width: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="50"
                />
              </div>
              <div className="size-input">
                <label>Height:</label>
                <input 
                  type="number" 
                  value={mapSize.height}
                  onChange={(e) => setMapSize(prev => ({ ...prev, height: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="50"
                />
              </div>
            </div>
            <button onClick={handleMapSizeChange}>Apply Size</button>
          </div>
          
          {/* Game Controls */}
          <div className="game-controls">
            <h3>Game Mode</h3>
            <div className="mode-buttons">
              <button 
                className={`mode-button ${isEditing ? 'active' : ''}`}
                onClick={() => {
                  setIsEditing(true);
                  setIsPlaying(false);
                  if (gameLoopRef.current) {
                    cancelAnimationFrame(gameLoopRef.current);
                    gameLoopRef.current = null;
                  }
                }}
                  title="Switch to Edit Mode (Esc)"
              >
                Edit Mode
              </button>
              <button 
                  className={`mode-button ${!isEditing ? 'active' : ''}`}
                  onClick={handlePlayModeClick}
                  title="Start the game with a title screen"
              >
                Play Mode
              </button>
            </div>
          </div>
            
            {/* Cutscene Section */}
            <div className="tools-group">
              <h3>Cutscenes</h3>
              <button 
                className="opening-cutscene-button"
                onClick={handleOpeningCutsceneClick}
              >
                Edit Opening Cutscene
              </button>
              {gameState.currentMap.openingCutscene && (
                <button 
                  className="preview-button"
                  onClick={handlePreviewCutscene}
                >
                  Preview Opening Cutscene
                </button>
              )}
            </div>
        </div>
        
        <div className="game-view">
          <canvas 
            ref={canvasRef}
            width={gameState.currentMap.width * 32}
            height={gameState.currentMap.height * 32}
            onClick={handleCanvasClick}
            className={isEditing ? 'edit-mode' : 'play-mode'}
          />
        </div>
        
        <div className="properties-panel">
          <h3>Properties</h3>
          <div className="map-info">
            <h4>Map: {gameState.currentMap.name}</h4>
            <p>Size: {gameState.currentMap.width} x {gameState.currentMap.height}</p>
            <p>Events: {gameState.currentMap.events.length}</p>
            <p>NPCs: {gameState.npcs.length}</p>
          </div>
          
          <div className="player-info">
            <h4>Player: {gameState.player.name}</h4>
            <p>Position: ({gameState.player.position.x}, {gameState.player.position.y})</p>
            <p>Level: {gameState.player.stats.level}</p>
            <p>HP: {gameState.player.stats.hp}</p>
            <p>MP: {gameState.player.stats.mp}</p>
          </div>
          
          {/* 3D Preview */}
          <div className="preview-section">
            <h4>3D Preview</h4>
            <div className="preview-container" ref={preview3DRef}>
              <p className="preview-placeholder">Preview will appear here</p>
            </div>
            <button onClick={renderPreview3D}>Generate 3D Preview</button>
          </div>
        </div>
      </div>
      
      {/* Add Event Editor */}
      {showEventEditor && (
        <div className="modal-overlay">
          <EventEditor
            event={currentEvent}
            onSave={handleSaveEvent}
            onCancel={() => {
              setShowEventEditor(false);
              setCurrentEvent(null);
            }}
            onDelete={handleDeleteEvent}
          />
        </div>
      )}
      
      {/* Add Script Selector */}
      {showScriptSelector && (
        <div className="modal-overlay">
          <ScriptSelector
            onScriptSelect={(scriptId) => {
              // Create a new event with the selected script
              try {
                const newEvent = scriptIntegration.createScriptEvent(scriptId);
                setCurrentEvent(newEvent);
                setShowScriptSelector(false);
                setShowEventEditor(true);
              } catch (error) {
                console.error('Failed to create script event:', error);
              }
            }}
            onCancel={() => setShowScriptSelector(false)}
          />
        </div>
      )}
        
        {/* Add Cutscene section */}
        <div className="cutscene-section">
          <h3>Cutscenes</h3>
          <button 
            className="cutscene-button"
            onClick={handleEditOpeningCutscene}
          >
            Edit Opening Cutscene
          </button>
          <p className="cutscene-info">
            Create a cutscene that plays when the game starts
          </p>
        </div>
        
        {/* Modal for cutscene editor */}
        {showCutsceneEditor && currentCutscene && (
          <div className="modal-overlay">
            <CutsceneEditor
              event={currentCutscene}
              onSave={handleSaveCutscene}
              onCancel={handleCancelCutscene}
            />
          </div>
        )}
        
        {/* Modal for cutscene player */}
        {showCutscenePlayer && currentCutscene && (
          <div className="modal-overlay">
            <CutscenePlayer
              event={currentCutscene}
              onComplete={handleCloseCutscenePlayer}
              onSkip={handleCloseCutscenePlayer}
              characters={{
                player: 'https://example.com/player-sprite.png',
                npc1: 'https://example.com/npc1-sprite.png',
                npc2: 'https://example.com/npc2-sprite.png'
              }}
              backgrounds={{
                default_bg: 'https://example.com/default-bg.jpg',
                town_bg: 'https://example.com/town-bg.jpg',
                castle_bg: 'https://example.com/castle-bg.jpg',
                forest_bg: 'https://example.com/forest-bg.jpg',
                cave_bg: 'https://example.com/cave-bg.jpg'
              }}
            />
          </div>
        )}
        
        {/* Modal for game settings */}
        {showGameSettingsEditor && (
          <div className="modal-overlay">
            <GameSettingsEditor />
          </div>
        )}
    </div>
  );
  }
  
  // This shouldn't be reached, but providing a fallback
  return <StartScreen />;
};

// Create a town map
const createTownMap = (): RPGMap => {
  const width = 30;
  const height = 20;
  
  // Create base map with grass
  const tiles: RPGTile[][] = Array(height).fill(null).map((_, y) => 
    Array(width).fill(null).map((_, x) => ({
      id: `tile_${x}_${y}`,
      ...TILE_TYPES.grass
    }))
  );
  
  // Add a path
  for (let x = 5; x < width - 5; x++) {
    tiles[10][x] = { id: `tile_${x}_10`, ...TILE_TYPES.path };
  }
  
  // Add vertical path
  for (let y = 5; y < height - 5; y++) {
    tiles[y][15] = { id: `tile_${15}_${y}`, ...TILE_TYPES.path };
  }
  
  // Add some trees (border)
  for (let x = 0; x < width; x++) {
    tiles[0][x] = { id: `tile_${x}_0`, ...TILE_TYPES.tree };
    tiles[height-1][x] = { id: `tile_${x}_${height-1}`, ...TILE_TYPES.tree };
  }
  
  for (let y = 0; y < height; y++) {
    tiles[y][0] = { id: `tile_0_${y}`, ...TILE_TYPES.tree };
    tiles[y][width-1] = { id: `tile_${width-1}_${y}`, ...TILE_TYPES.tree };
  }
  
  // Add lake (water tiles) in an L shape away from the player starting area
  for (let y = 3; y < 8; y++) {
    for (let x = 3; x < 8; x++) {
      // Add water tiles far enough away from player position
      if (x >= 3 && y >= 3) {
      tiles[y][x] = { id: `tile_${x}_${y}`, ...TILE_TYPES.water };
      }
    }
  }
  
  // Add a chest
  tiles[5][18] = { id: `tile_18_5`, ...TILE_TYPES.chest };
  
  // Add a door
  tiles[10][20] = { id: `tile_20_10`, ...TILE_TYPES.door };
  
  return {
    id: 'town',
    name: 'Fantasy Town',
    width,
    height,
    tiles,
    events: [
      {
        id: 'welcome_town',
        trigger: 'auto',
        actions: [
          {
            type: 'message',
            params: { text: 'Welcome to Fantasy Town! Explore and talk to the villagers.' }
          }
        ]
      }
    ]
  };
};

// Create a dungeon map
const createDungeonMap = (): RPGMap => {
  const width = 20;
  const height = 15;
  
  // Create base map with walls
  const tiles: RPGTile[][] = Array(height).fill(null).map((_, y) => 
    Array(width).fill(null).map((_, x) => ({
      id: `tile_${x}_${y}`,
      ...TILE_TYPES.tree // Use tree as wall
    }))
  );
  
  // Carve rooms and corridors
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      // Main corridor
      if (y === 7 || (x === 10 && y > 2 && y < 12)) {
        tiles[y][x] = { id: `tile_${x}_${y}`, ...TILE_TYPES.path };
      }
      
      // Rooms
      if ((x > 3 && x < 8 && y > 3 && y < 6) || 
          (x > 12 && x < 17 && y > 3 && y < 6) ||
          (x > 12 && x < 17 && y > 8 && y < 11)) {
        tiles[y][x] = { id: `tile_${x}_${y}`, ...TILE_TYPES.path };
      }
    }
  }
  
  // Add chests to rooms
  tiles[4][6] = { id: `tile_6_4`, ...TILE_TYPES.chest };
  tiles[4][14] = { id: `tile_14_4`, ...TILE_TYPES.chest };
  tiles[9][14] = { id: `tile_14_9`, ...TILE_TYPES.chest };
  
  // Add exit door
  tiles[7][2] = { id: `tile_2_7`, ...TILE_TYPES.door, properties: { teleportTo: { mapId: 'town', x: 10, y: 10 } } };
  
  return {
    id: 'dungeon',
    name: 'Dark Dungeon',
    width,
    height,
    tiles,
    events: [
      {
        id: 'welcome_dungeon',
        trigger: 'auto',
        actions: [
          {
            type: 'message',
            params: { text: 'You\'ve entered the Dark Dungeon! Be careful...' }
          }
        ]
      }
    ]
  };
};

// Handle when a game is started - check for opening cutscene
const handleStartNewGame = () => {
  // Set up new game state
  const newGameState = {
    currentMap: createTownMap(),
    player: CHARACTER_TEMPLATES[0],
    npcs: [
      { ...CHARACTER_TEMPLATES[1], position: { x: 10, y: 8 } },
      { ...CHARACTER_TEMPLATES[2], position: { x: 15, y: 12 } }
    ],
    variables: {},
    switches: {},
    gameTime: 0,
    inventory: ['Potion', 'Basic Sword']
  };
  
  setGameState(newGameState);
  setIsPlaying(true);
  
  // Check if this map has an opening cutscene and settings allow for it
  if (gameSettings.playOpeningCutscene && 
      (newGameState.currentMap as RPGMapWithCutscene).openingCutscene) {
    // Start in cutscene mode
    setCutsceneActive(true);
    setCurrentCutscene((newGameState.currentMap as RPGMapWithCutscene).openingCutscene);
    setCurrentScreen('cutscene');
  } else {
    // Skip to regular gameplay
    setCurrentScreen('playing');
  }
};

// Handle cutscene editing
const handleEditOpeningCutscene = () => {
  // Edit the current map's opening cutscene or create a new one
  const currentMapCopy = { ...gameState.currentMap } as RPGMapWithCutscene;
  
  if (!currentMapCopy.openingCutscene) {
    // Create a default opening cutscene if none exists
    currentMapCopy.openingCutscene = {
      id: `cutscene_opening_${Date.now()}`,
      trigger: 'auto',
      actions: [
        {
          type: 'message',
          params: { text: 'Welcome to your adventure!' }
        }
      ]
    };
  }
  
  setCurrentEvent(currentMapCopy.openingCutscene);
  setShowCutsceneEditor(true);
};

// Save cutscene
const handleSaveCutscene = (event: RPGEvent) => {
  // Update the current map with the new opening cutscene
  setGameState(prev => ({
    ...prev,
    currentMap: {
      ...prev.currentMap,
      openingCutscene: event
    }
  }));
  
  setShowCutsceneEditor(false);
  setCurrentCutscene(null);
};

// Cancel cutscene editing
const handleCancelCutscene = () => {
  setShowCutsceneEditor(false);
  setCurrentCutscene(null);
};

// Add game settings editor
const handleEditGameSettings = () => {
  // Open game settings modal
  setShowGameSettingsEditor(true);
};

// Save game settings
const handleSaveGameSettings = (settings: any) => {
  setGameSettings(settings);
  setShowGameSettingsEditor(false);
};

// Handle opening the cutscene editor for the map's opening cutscene
const handleOpeningCutsceneClick = () => {
  // Create default cutscene if none exists
  if (!gameState.currentMap.openingCutscene) {
    const defaultCutscene: RPGEvent = {
      id: 'opening_cutscene',
      trigger: 'auto',
      actions: [{
        type: 'message',
        params: { text: 'Welcome to your adventure!' }
      }]
    };
    
    setCurrentCutscene(defaultCutscene);
  } else {
    setCurrentCutscene({ ...gameState.currentMap.openingCutscene });
  }
  
  setShowCutsceneEditor(true);
};

// Preview the opening cutscene
const handlePreviewCutscene = () => {
  if (gameState.currentMap.openingCutscene) {
    setCurrentCutscene({ ...gameState.currentMap.openingCutscene });
    setShowCutscenePlayer(true);
  }
};

// Close the cutscene player
const handleCloseCutscenePlayer = () => {
  setShowCutscenePlayer(false);
  setCurrentCutscene(null);
};

export default GameStudio2D; 