import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Html, useHelper } from '@react-three/drei';
import { FaPlay, FaPause, FaStop, FaSave, FaFolder, FaCog, FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import './GameAssembler.css';

// Types for game objects
interface GameObjectTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  prefab: string;
  description: string;
}

interface GameObjectInstance {
  id: string;
  templateId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  locked: boolean;
  properties: Record<string, any>;
  components: GameComponent[];
}

interface GameComponent {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  enabled: boolean;
}

// Mock data for templates
const TEMPLATE_CATEGORIES = [
  'Characters', 'Environment', 'Props', 'Lights', 'Effects', 'UI', 'Gameplay', 'Vehicles', 'Weapons'
];

const OBJECT_TEMPLATES: GameObjectTemplate[] = [
  // Characters
  {
    id: 'template_character_player',
    name: 'Player Character',
    category: 'Characters',
    thumbnail: '/assets/thumbnails/player.png',
    prefab: 'character_player',
    description: 'Default player character with basic movement controls'
  },
  {
    id: 'template_character_npc',
    name: 'NPC Character',
    category: 'Characters',
    thumbnail: '/assets/thumbnails/npc.png',
    prefab: 'character_npc',
    description: 'Non-player character with AI behavior system'
  },
  {
    id: 'template_character_enemy',
    name: 'Enemy Character',
    category: 'Characters',
    thumbnail: '/assets/thumbnails/enemy.png',
    prefab: 'character_enemy',
    description: 'Hostile enemy with combat AI and attack patterns'
  },
  {
    id: 'template_character_companion',
    name: 'Companion',
    category: 'Characters',
    thumbnail: '/assets/thumbnails/companion.png',
    prefab: 'character_companion',
    description: 'Friendly AI companion that follows and assists the player'
  },
  
  // Environment
  {
    id: 'template_env_platform',
    name: 'Platform',
    category: 'Environment',
    thumbnail: '/assets/thumbnails/platform.png',
    prefab: 'env_platform',
    description: 'Basic platform for characters to stand on'
  },
  {
    id: 'template_env_terrain',
    name: 'Terrain Block',
    category: 'Environment',
    thumbnail: '/assets/thumbnails/terrain.png',
    prefab: 'env_terrain',
    description: 'Customizable terrain block with physics properties'
  },
  {
    id: 'template_env_water',
    name: 'Water Surface',
    category: 'Environment',
    thumbnail: '/assets/thumbnails/water.png',
    prefab: 'env_water',
    description: 'Interactive water surface with physics and reflection'
  },
  {
    id: 'template_env_tree',
    name: 'Tree',
    category: 'Environment',
    thumbnail: '/assets/thumbnails/tree.png',
    prefab: 'env_tree',
    description: 'Decorative tree with wind animation'
  },
  {
    id: 'template_env_rock',
    name: 'Rock Formation',
    category: 'Environment',
    thumbnail: '/assets/thumbnails/rock.png',
    prefab: 'env_rock',
    description: 'Natural rock formation with collision'
  },
  
  // Props
  {
    id: 'template_prop_crate',
    name: 'Crate',
    category: 'Props',
    thumbnail: '/assets/thumbnails/crate.png',
    prefab: 'prop_crate',
    description: 'Destructible crate that can contain items'
  },
  {
    id: 'template_prop_barrel',
    name: 'Barrel',
    category: 'Props',
    thumbnail: '/assets/thumbnails/barrel.png',
    prefab: 'prop_barrel',
    description: 'Explosive barrel that reacts to damage'
  },
  {
    id: 'template_prop_chair',
    name: 'Chair',
    category: 'Props',
    thumbnail: '/assets/thumbnails/chair.png',
    prefab: 'prop_chair',
    description: 'Sittable chair with interaction'
  },
  {
    id: 'template_prop_table',
    name: 'Table',
    category: 'Props',
    thumbnail: '/assets/thumbnails/table.png',
    prefab: 'prop_table',
    description: 'Table with physics and item placement'
  },
  {
    id: 'template_prop_door',
    name: 'Door',
    category: 'Props',
    thumbnail: '/assets/thumbnails/door.png',
    prefab: 'prop_door',
    description: 'Interactive door with open/close animation'
  },
  
  // Lights
  {
    id: 'template_light_point',
    name: 'Point Light',
    category: 'Lights',
    thumbnail: '/assets/thumbnails/point_light.png',
    prefab: 'light_point',
    description: 'Omnidirectional light source'
  },
  {
    id: 'template_light_spot',
    name: 'Spot Light',
    category: 'Lights',
    thumbnail: '/assets/thumbnails/spot_light.png',
    prefab: 'light_spot',
    description: 'Directional cone of light with adjustable angle'
  },
  {
    id: 'template_light_area',
    name: 'Area Light',
    category: 'Lights',
    thumbnail: '/assets/thumbnails/area_light.png',
    prefab: 'light_area',
    description: 'Rectangular light source for soft illumination'
  },
  {
    id: 'template_light_ambient',
    name: 'Ambient Light',
    category: 'Lights',
    thumbnail: '/assets/thumbnails/ambient_light.png',
    prefab: 'light_ambient',
    description: 'Global ambient lighting for the scene'
  },
  {
    id: 'template_light_torch',
    name: 'Torch',
    category: 'Lights',
    thumbnail: '/assets/thumbnails/torch.png',
    prefab: 'light_torch',
    description: 'Flickering torch with light and particle effects'
  },
  
  // Effects
  {
    id: 'template_effect_particle',
    name: 'Particle System',
    category: 'Effects',
    thumbnail: '/assets/thumbnails/particles.png',
    prefab: 'effect_particle',
    description: 'Customizable particle effect system'
  },
  {
    id: 'template_effect_fire',
    name: 'Fire',
    category: 'Effects',
    thumbnail: '/assets/thumbnails/fire.png',
    prefab: 'effect_fire',
    description: 'Realistic fire effect with light and heat'
  },
  {
    id: 'template_effect_smoke',
    name: 'Smoke',
    category: 'Effects',
    thumbnail: '/assets/thumbnails/smoke.png',
    prefab: 'effect_smoke',
    description: 'Billowing smoke effect with wind influence'
  },
  {
    id: 'template_effect_explosion',
    name: 'Explosion',
    category: 'Effects',
    thumbnail: '/assets/thumbnails/explosion.png',
    prefab: 'effect_explosion',
    description: 'Explosion with shockwave, particles, and sound'
  },
  {
    id: 'template_effect_portal',
    name: 'Portal',
    category: 'Effects',
    thumbnail: '/assets/thumbnails/portal.png',
    prefab: 'effect_portal',
    description: 'Teleportation portal with swirling effect'
  },
  
  // UI
  {
    id: 'template_ui_button',
    name: 'Button',
    category: 'UI',
    thumbnail: '/assets/thumbnails/button.png',
    prefab: 'ui_button',
    description: 'Interactive button for user interfaces'
  },
  {
    id: 'template_ui_panel',
    name: 'Panel',
    category: 'UI',
    thumbnail: '/assets/thumbnails/panel.png',
    prefab: 'ui_panel',
    description: 'Container panel for UI elements'
  },
  {
    id: 'template_ui_text',
    name: 'Text',
    category: 'UI',
    thumbnail: '/assets/thumbnails/text.png',
    prefab: 'ui_text',
    description: 'Text display with customizable font and style'
  },
  {
    id: 'template_ui_healthbar',
    name: 'Health Bar',
    category: 'UI',
    thumbnail: '/assets/thumbnails/healthbar.png',
    prefab: 'ui_healthbar',
    description: 'Dynamic health bar that connects to character stats'
  },
  {
    id: 'template_ui_inventory',
    name: 'Inventory Slot',
    category: 'UI',
    thumbnail: '/assets/thumbnails/inventory.png',
    prefab: 'ui_inventory',
    description: 'Inventory slot with drag-and-drop functionality'
  },
  
  // Gameplay
  {
    id: 'template_gameplay_trigger',
    name: 'Trigger Volume',
    category: 'Gameplay',
    thumbnail: '/assets/thumbnails/trigger.png',
    prefab: 'gameplay_trigger',
    description: 'Volume that triggers events when objects enter or exit'
  },
  {
    id: 'template_gameplay_spawner',
    name: 'Enemy Spawner',
    category: 'Gameplay',
    thumbnail: '/assets/thumbnails/spawner.png',
    prefab: 'gameplay_spawner',
    description: 'Spawns enemies at intervals or when triggered'
  },
  {
    id: 'template_gameplay_checkpoint',
    name: 'Checkpoint',
    category: 'Gameplay',
    thumbnail: '/assets/thumbnails/checkpoint.png',
    prefab: 'gameplay_checkpoint',
    description: 'Save point that stores player progress'
  },
  {
    id: 'template_gameplay_collectible',
    name: 'Collectible',
    category: 'Gameplay',
    thumbnail: '/assets/thumbnails/collectible.png',
    prefab: 'gameplay_collectible',
    description: 'Item that can be collected by the player'
  },
  {
    id: 'template_gameplay_puzzle',
    name: 'Puzzle Element',
    category: 'Gameplay',
    thumbnail: '/assets/thumbnails/puzzle.png',
    prefab: 'gameplay_puzzle',
    description: 'Interactive element for puzzle mechanics'
  },
  
  // Vehicles
  {
    id: 'template_vehicle_car',
    name: 'Car',
    category: 'Vehicles',
    thumbnail: '/assets/thumbnails/car.png',
    prefab: 'vehicle_car',
    description: 'Drivable car with realistic physics'
  },
  {
    id: 'template_vehicle_aircraft',
    name: 'Aircraft',
    category: 'Vehicles',
    thumbnail: '/assets/thumbnails/aircraft.png',
    prefab: 'vehicle_aircraft',
    description: 'Flyable aircraft with aerodynamics'
  },
  {
    id: 'template_vehicle_boat',
    name: 'Boat',
    category: 'Vehicles',
    thumbnail: '/assets/thumbnails/boat.png',
    prefab: 'vehicle_boat',
    description: 'Boat with water physics and buoyancy'
  },
  {
    id: 'template_vehicle_motorcycle',
    name: 'Motorcycle',
    category: 'Vehicles',
    thumbnail: '/assets/thumbnails/motorcycle.png',
    prefab: 'vehicle_motorcycle',
    description: 'Rideable motorcycle with leaning physics'
  },
  
  // Weapons
  {
    id: 'template_weapon_sword',
    name: 'Sword',
    category: 'Weapons',
    thumbnail: '/assets/thumbnails/sword.png',
    prefab: 'weapon_sword',
    description: 'Melee weapon with swing animations and damage'
  },
  {
    id: 'template_weapon_gun',
    name: 'Gun',
    category: 'Weapons',
    thumbnail: '/assets/thumbnails/gun.png',
    prefab: 'weapon_gun',
    description: 'Ranged weapon with projectile system'
  },
  {
    id: 'template_weapon_bow',
    name: 'Bow',
    category: 'Weapons',
    thumbnail: '/assets/thumbnails/bow.png',
    prefab: 'weapon_bow',
    description: 'Bow and arrow with physics-based projectiles'
  },
  {
    id: 'template_weapon_grenade',
    name: 'Grenade',
    category: 'Weapons',
    thumbnail: '/assets/thumbnails/grenade.png',
    prefab: 'weapon_grenade',
    description: 'Throwable explosive with timer and physics'
  }
];

// Component for a single 3D object in the scene
const GameObjectMesh: React.FC<{
  object: GameObjectInstance;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updatedObject: GameObjectInstance) => void;
}> = ({ object, isSelected, onSelect, onUpdate }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate a simple mesh based on the template
  const getMeshForTemplate = (templateId: string) => {
    // In a real implementation, this would load the actual model
    // For now, we'll use simple geometries
    switch (templateId) {
      // Characters
      case 'template_character_player':
        return (
          <>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial color="#4285F4" />
          </>
        );
      case 'template_character_npc':
        return (
          <>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial color="#34A853" />
          </>
        );
      case 'template_character_enemy':
        return (
          <>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial color="#EA4335" />
          </>
        );
      case 'template_character_companion':
        return (
          <>
            <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
            <meshStandardMaterial color="#FBBC05" />
          </>
        );
      
      // Environment
      case 'template_env_platform':
        return (
          <>
            <boxGeometry args={[4, 0.5, 4]} />
            <meshStandardMaterial color="#34A853" />
          </>
        );
      case 'template_env_terrain':
        return (
          <>
            <boxGeometry args={[4, 2, 4]} />
            <meshStandardMaterial color="#8B4513" />
          </>
        );
      case 'template_env_water':
        return (
          <>
            <planeGeometry args={[4, 4, 8, 8]} />
            <meshStandardMaterial color="#1E90FF" transparent opacity={0.8} />
          </>
        );
      case 'template_env_tree':
        return (
          <>
            <group>
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 2.5, 0]}>
                <coneGeometry args={[1.5, 3, 8]} />
                <meshStandardMaterial color="#228B22" />
              </mesh>
            </group>
          </>
        );
      case 'template_env_rock':
        return (
          <>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#808080" />
          </>
        );
      
      // Props
      case 'template_prop_crate':
        return (
          <>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FBBC05" />
          </>
        );
      case 'template_prop_barrel':
        return (
          <>
            <cylinderGeometry args={[0.5, 0.5, 1.5, 16]} />
            <meshStandardMaterial color="#FF5722" />
          </>
        );
      case 'template_prop_chair':
        return (
          <>
            <group>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.8, 0.1, 0.8]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
              <mesh position={[0, 1.2, -0.35]}>
                <boxGeometry args={[0.8, 0.8, 0.1]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
              <mesh position={[-0.35, 0.25, -0.35]}>
                <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
              <mesh position={[0.35, 0.25, -0.35]}>
                <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
              <mesh position={[-0.35, 0.25, 0.35]}>
                <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
              <mesh position={[0.35, 0.25, 0.35]}>
                <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
            </group>
          </>
        );
      case 'template_prop_table':
        return (
          <>
            <group>
              <mesh position={[0, 0.75, 0]}>
                <boxGeometry args={[1.5, 0.1, 1]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[-0.6, 0.375, -0.4]}>
                <cylinderGeometry args={[0.05, 0.05, 0.75, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0.6, 0.375, -0.4]}>
                <cylinderGeometry args={[0.05, 0.05, 0.75, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[-0.6, 0.375, 0.4]}>
                <cylinderGeometry args={[0.05, 0.05, 0.75, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0.6, 0.375, 0.4]}>
                <cylinderGeometry args={[0.05, 0.05, 0.75, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
            </group>
          </>
        );
      case 'template_prop_door':
        return (
          <>
            <group>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[1, 2, 0.1]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0.4, 1, 0.05]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#FFD700" />
              </mesh>
            </group>
          </>
        );
      
      // Lights
      case 'template_light_point':
        return (
          <>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={2} />
          </>
        );
      case 'template_light_spot':
        return (
          <>
            <group>
              <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={2} />
              </mesh>
              <mesh position={[0, -0.3, 0]} rotation={[Math.PI/2, 0, 0]}>
                <coneGeometry args={[0.3, 0.5, 16, 1, true]} />
                <meshStandardMaterial color="#FFFF00" transparent opacity={0.3} emissive="#FFFF00" emissiveIntensity={0.5} />
              </mesh>
            </group>
          </>
        );
      case 'template_light_area':
        return (
          <>
            <group>
              <mesh>
                <boxGeometry args={[1, 0.1, 1]} />
                <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1} />
              </mesh>
            </group>
          </>
        );
      case 'template_light_ambient':
        return (
          <>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" wireframe transparent opacity={0.5} />
          </>
        );
      case 'template_light_torch':
        return (
          <>
            <group>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.05, 0.1, 1, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={2} />
              </mesh>
            </group>
          </>
        );
      
      // Effects
      case 'template_effect_particle':
        return (
          <>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#EA4335" transparent opacity={0.7} />
          </>
        );
      case 'template_effect_fire':
        return (
          <>
            <group>
              <mesh position={[0, 0.2, 0]}>
                <coneGeometry args={[0.5, 1, 8]} />
                <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={2} transparent opacity={0.8} />
              </mesh>
            </group>
          </>
        );
      case 'template_effect_smoke':
        return (
          <>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#A9A9A9" transparent opacity={0.4} />
          </>
        );
      case 'template_effect_explosion':
        return (
          <>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={1.5} transparent opacity={0.6} />
          </>
        );
      case 'template_effect_portal':
        return (
          <>
            <torusGeometry args={[0.7, 0.2, 16, 32]} />
            <meshStandardMaterial color="#9C27B0" emissive="#9C27B0" emissiveIntensity={1.5} />
          </>
        );
      
      // UI
      case 'template_ui_button':
        return (
          <>
            <boxGeometry args={[2, 0.5, 0.1]} />
            <meshStandardMaterial color="#4285F4" />
          </>
        );
      case 'template_ui_panel':
        return (
          <>
            <boxGeometry args={[3, 2, 0.05]} />
            <meshStandardMaterial color="#424242" transparent opacity={0.8} />
          </>
        );
      case 'template_ui_text':
        return (
          <>
            <boxGeometry args={[2, 0.5, 0.05]} />
            <meshStandardMaterial color="#FFFFFF" />
          </>
        );
      case 'template_ui_healthbar':
        return (
          <>
            <group>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 0.3, 0.05]} />
                <meshStandardMaterial color="#424242" />
              </mesh>
              <mesh position={[-0.5, 0, 0.01]}>
                <boxGeometry args={[1, 0.2, 0.05]} />
                <meshStandardMaterial color="#4CAF50" />
              </mesh>
            </group>
          </>
        );
      case 'template_ui_inventory':
        return (
          <>
            <group>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.8, 0.8, 0.05]} />
                <meshStandardMaterial color="#424242" />
              </mesh>
              <mesh position={[0, 0, 0.01]}>
                <boxGeometry args={[0.7, 0.7, 0.05]} />
                <meshStandardMaterial color="#616161" />
              </mesh>
            </group>
          </>
        );
      
      // Gameplay
      case 'template_gameplay_trigger':
        return (
          <>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#EA4335" transparent opacity={0.3} />
          </>
        );
      case 'template_gameplay_spawner':
        return (
          <>
            <group>
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[1, 1, 0.2, 16]} />
                <meshStandardMaterial color="#673AB7" />
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <coneGeometry args={[0.5, 0.5, 16]} />
                <meshStandardMaterial color="#673AB7" emissive="#673AB7" emissiveIntensity={0.5} />
              </mesh>
            </group>
          </>
        );
      case 'template_gameplay_checkpoint':
        return (
          <>
            <group>
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
                <meshStandardMaterial color="#9E9E9E" />
              </mesh>
              <mesh position={[0, 2, 0]}>
                <boxGeometry args={[0.8, 0.5, 0.1]} />
                <meshStandardMaterial color="#4CAF50" emissive="#4CAF50" emissiveIntensity={0.5} />
              </mesh>
            </group>
          </>
        );
      case 'template_gameplay_collectible':
        return (
          <>
            <group rotation={[0, Math.PI/4, Math.PI/4]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.3} />
            </group>
          </>
        );
      case 'template_gameplay_puzzle':
        return (
          <>
            <group>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#00BCD4" />
              </mesh>
              <mesh position={[0, 0, 0.51]}>
                <boxGeometry args={[0.5, 0.5, 0.1]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            </group>
          </>
        );
      
      // Vehicles
      case 'template_vehicle_car':
        return (
          <>
            <group>
              <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[2, 0.5, 1]} />
                <meshStandardMaterial color="#3F51B5" />
              </mesh>
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[1.2, 0.4, 0.9]} />
                <meshStandardMaterial color="#3F51B5" />
              </mesh>
              <mesh position={[-0.6, 0.2, 0.4]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
              <mesh position={[0.6, 0.2, 0.4]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
              <mesh position={[-0.6, 0.2, -0.4]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
              <mesh position={[0.6, 0.2, -0.4]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
            </group>
          </>
        );
      case 'template_vehicle_aircraft':
        return (
          <>
            <group>
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 0.1, 0.1]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
              <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI/4]}>
                <boxGeometry args={[0.5, 0.1, 0.5]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
            </group>
          </>
        );
      case 'template_vehicle_boat':
        return (
          <>
            <group>
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[2, 0.4, 0.8]} />
                <meshStandardMaterial color="#2196F3" />
              </mesh>
              <mesh position={[0.8, 0.4, 0]} rotation={[0, 0, -Math.PI/2]}>
                <coneGeometry args={[0.4, 0.8, 8, 1]} />
                <meshStandardMaterial color="#2196F3" />
              </mesh>
              <mesh position={[-0.8, 0.4, 0]} rotation={[0, 0, Math.PI/2]}>
                <coneGeometry args={[0.4, 0.8, 8, 1]} />
                <meshStandardMaterial color="#2196F3" />
              </mesh>
            </group>
          </>
        );
      case 'template_vehicle_motorcycle':
        return (
          <>
            <group>
              <mesh position={[0, 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
              <mesh position={[-0.5, 0.3, 0]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
              <mesh position={[0.5, 0.3, 0]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
              <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[0.8, 0.2, 0.3]} />
                <meshStandardMaterial color="#F44336" />
              </mesh>
            </group>
          </>
        );
      
      // Weapons
      case 'template_weapon_sword':
        return (
          <>
            <group>
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[0.1, 1.5, 0.02]} />
                <meshStandardMaterial color="#BDBDBD" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.2, 0.3, 0.05]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
            </group>
          </>
        );
      case 'template_weapon_gun':
        return (
          <>
            <group>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.2, 0.3, 0.8]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
              <mesh position={[0, -0.2, 0.2]}>
                <boxGeometry args={[0.15, 0.3, 0.2]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
              <mesh position={[0, 0, -0.5]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                <meshStandardMaterial color="#212121" />
              </mesh>
            </group>
          </>
        );
      case 'template_weapon_bow':
        return (
          <>
            <group>
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <torusGeometry args={[0.5, 0.02, 8, 16, Math.PI]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 1, 8]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            </group>
          </>
        );
      case 'template_weapon_grenade':
        return (
          <>
            <group>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#4CAF50" />
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
                <meshStandardMaterial color="#9E9E9E" />
              </mesh>
            </group>
          </>
        );
      
      default:
        return (
          <>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gray" />
          </>
        );
    }
  };
  
  return (
    <mesh
      ref={meshRef}
      position={object.position}
      rotation={new THREE.Euler(...object.rotation)}
      scale={object.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      visible={object.visible}
    >
      {getMeshForTemplate(object.templateId)}
      
      {/* Selection outline */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry attach="geometry" args={[meshRef.current?.geometry]} />
          <lineBasicMaterial attach="material" color="cyan" />
        </lineSegments>
      )}
      
      {/* Object label */}
      {isSelected && (
        <Html position={[0, 1.5, 0]} center>
          <div className="object-label">{object.name}</div>
        </Html>
      )}
    </mesh>
  );
};

// Transform controls wrapper
const ObjectTransformControls: React.FC<{
  object: GameObjectInstance;
  mode: 'translate' | 'rotate' | 'scale';
  onUpdate: (updatedObject: GameObjectInstance) => void;
}> = ({ object, mode, onUpdate }) => {
  const controlsRef = useRef<any>(null);
  const { camera, scene } = useThree();
  
  // Create a dummy object to attach the transform controls to
  const dummyObject = useRef(new THREE.Object3D());
  
  useEffect(() => {
    // Set the dummy object's transform to match the game object
    dummyObject.current.position.set(...object.position);
    dummyObject.current.rotation.set(...object.rotation);
    dummyObject.current.scale.set(...object.scale);
    
    // Add it to the scene
    scene.add(dummyObject.current);
    
    return () => {
      scene.remove(dummyObject.current);
    };
  }, [object, scene]);
  
  // Update the game object when the transform changes
  useFrame(() => {
    if (dummyObject.current) {
      const newPosition: [number, number, number] = [
        dummyObject.current.position.x,
        dummyObject.current.position.y,
        dummyObject.current.position.z
      ];
      
      const newRotation: [number, number, number] = [
        dummyObject.current.rotation.x,
        dummyObject.current.rotation.y,
        dummyObject.current.rotation.z
      ];
      
      const newScale: [number, number, number] = [
        dummyObject.current.scale.x,
        dummyObject.current.scale.y,
        dummyObject.current.scale.z
      ];
      
      // Only update if something changed
      if (
        newPosition.some((v, i) => v !== object.position[i]) ||
        newRotation.some((v, i) => v !== object.rotation[i]) ||
        newScale.some((v, i) => v !== object.scale[i])
      ) {
        onUpdate({
          ...object,
          position: newPosition,
          rotation: newRotation,
          scale: newScale
        });
      }
    }
  });
  
  return (
    <TransformControls
      ref={controlsRef}
      object={dummyObject.current}
      mode={mode}
      size={0.75}
      showX={true}
      showY={true}
      showZ={true}
    />
  );
};

// Scene component
const GameScene: React.FC<{
  objects: GameObjectInstance[];
  selectedObjectId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updatedObject: GameObjectInstance) => void;
}> = ({ objects, selectedObjectId, transformMode, onSelectObject, onUpdateObject }) => {
  // Clear selection when clicking on empty space
  const handleBackgroundClick = () => {
    onSelectObject(null);
  };
  
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      {/* Grid */}
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        sectionSize={3}
        sectionThickness={1}
        fadeDistance={50}
        fadeStrength={1.5}
      />
      
      {/* Game objects */}
      <group onClick={handleBackgroundClick}>
        {objects.map((obj) => (
          <GameObjectMesh
            key={obj.id}
            object={obj}
            isSelected={obj.id === selectedObjectId}
            onSelect={() => onSelectObject(obj.id)}
            onUpdate={onUpdateObject}
          />
        ))}
      </group>
      
      {/* Transform controls for selected object */}
      {selectedObjectId && (
        <ObjectTransformControls
          object={objects.find(obj => obj.id === selectedObjectId)!}
          mode={transformMode}
          onUpdate={onUpdateObject}
        />
      )}
    </>
  );
};

// Main component
const GameAssembler: React.FC = () => {
  // State
  const [objects, setObjects] = useState<GameObjectInstance[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showComponentPanel, setShowComponentPanel] = useState<boolean>(true);
  
  // Get the selected object
  const selectedObject = selectedObjectId 
    ? objects.find(obj => obj.id === selectedObjectId) 
    : null;
  
  // Filter templates by category and search query
  const filteredTemplates = OBJECT_TEMPLATES.filter(template => {
    const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Add a new object to the scene
  const handleAddObject = (template: GameObjectTemplate) => {
    const newObject: GameObjectInstance = {
      id: `object_${Date.now()}`,
      templateId: template.id,
      name: template.name,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: false,
      properties: {},
      components: []
    };
    
    setObjects([...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };
  
  // Update an object
  const handleUpdateObject = (updatedObject: GameObjectInstance) => {
    setObjects(objects.map(obj => 
      obj.id === updatedObject.id ? updatedObject : obj
    ));
  };
  
  // Delete the selected object
  const handleDeleteObject = () => {
    if (selectedObjectId) {
      setObjects(objects.filter(obj => obj.id !== selectedObjectId));
      setSelectedObjectId(null);
    }
  };
  
  // Toggle object visibility
  const handleToggleVisibility = () => {
    if (selectedObject) {
      handleUpdateObject({
        ...selectedObject,
        visible: !selectedObject.visible
      });
    }
  };
  
  // Toggle play mode
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Update object property
  const handleUpdateProperty = (key: string, value: any) => {
    if (selectedObject) {
      handleUpdateObject({
        ...selectedObject,
        properties: {
          ...selectedObject.properties,
          [key]: value
        }
      });
    }
  };
  
  // Add a component to the selected object
  const handleAddComponent = (componentType: string) => {
    if (selectedObject) {
      const newComponent: GameComponent = {
        id: `component_${Date.now()}`,
        type: componentType,
        name: componentType,
        properties: {},
        enabled: true
      };
      
      handleUpdateObject({
        ...selectedObject,
        components: [...selectedObject.components, newComponent]
      });
    }
  };
  
  // Remove a component from the selected object
  const handleRemoveComponent = (componentId: string) => {
    if (selectedObject) {
      handleUpdateObject({
        ...selectedObject,
        components: selectedObject.components.filter(comp => comp.id !== componentId)
      });
    }
  };
  
  return (
    <div className="game-assembler">
      {/* Left panel - Object templates */}
      <div className="template-panel">
        <div className="panel-header">
          <h3>Game Objects</h3>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search objects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="category-tabs">
          <button 
            className={activeCategory === 'All' ? 'active' : ''}
            onClick={() => setActiveCategory('All')}
          >
            All
          </button>
          {TEMPLATE_CATEGORIES.map(category => (
            <button
              key={category}
              className={activeCategory === category ? 'active' : ''}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="template-list">
          {filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className="template-item"
              onClick={() => handleAddObject(template)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('template', template.id);
              }}
            >
              <div className="template-icon">
                <img src={template.thumbnail} alt={template.name} />
              </div>
              <div className="template-info">
                <div className="template-name">{template.name}</div>
                <div className="template-category">{template.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Center panel - 3D viewport */}
      <div className="viewport-panel">
        <div className="viewport-toolbar">
          <div className="transform-tools">
            <button 
              className={transformMode === 'translate' ? 'active' : ''}
              onClick={() => setTransformMode('translate')}
              title="Move (W)"
            >
              Move
            </button>
            <button 
              className={transformMode === 'rotate' ? 'active' : ''}
              onClick={() => setTransformMode('rotate')}
              title="Rotate (E)"
            >
              Rotate
            </button>
            <button 
              className={transformMode === 'scale' ? 'active' : ''}
              onClick={() => setTransformMode('scale')}
              title="Scale (R)"
            >
              Scale
            </button>
          </div>
          
          <div className="object-tools">
            <button 
              onClick={handleToggleVisibility}
              disabled={!selectedObjectId}
              title="Toggle Visibility"
            >
              {selectedObject?.visible ? <FaEye /> : <FaEyeSlash />}
            </button>
            <button 
              onClick={handleDeleteObject}
              disabled={!selectedObjectId}
              title="Delete Object (Del)"
            >
              <FaTrash />
            </button>
          </div>
          
          <div className="playback-tools">
            <button 
              className={isPlaying ? 'active' : ''}
              onClick={handleTogglePlay}
              title={isPlaying ? 'Stop (Esc)' : 'Play (F5)'}
            >
              {isPlaying ? <FaStop /> : <FaPlay />}
            </button>
          </div>
        </div>
        
        <div className="viewport-container">
          <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
            <GameScene
              objects={objects}
              selectedObjectId={selectedObjectId}
              transformMode={transformMode}
              onSelectObject={setSelectedObjectId}
              onUpdateObject={handleUpdateObject}
            />
            <OrbitControls />
          </Canvas>
          
          {isPlaying && (
            <div className="play-overlay">
              <button onClick={handleTogglePlay}>
                <FaStop /> Stop
              </button>
            </div>
          )}
        </div>
        
        <div className="viewport-status">
          {selectedObject ? (
            <span>Selected: {selectedObject.name}</span>
          ) : (
            <span>No object selected</span>
          )}
        </div>
      </div>
      
      {/* Right panel - Properties */}
      <div className={`properties-panel ${showComponentPanel ? '' : 'collapsed'}`}>
        <div className="panel-header">
          <h3>Properties</h3>
          <button 
            className="toggle-panel-btn"
            onClick={() => setShowComponentPanel(!showComponentPanel)}
          >
            {showComponentPanel ? '>' : '<'}
          </button>
        </div>
        
        {selectedObject ? (
          <div className="properties-content">
            <div className="property-section">
              <h4>Transform</h4>
              
              <div className="property-group">
                <label>Position</label>
                <div className="vector3-input">
                  <div className="vector-component">
                    <label>X</label>
                    <input
                      type="number"
                      value={selectedObject.position[0]}
                      onChange={(e) => {
                        const newPosition: [number, number, number] = [...selectedObject.position];
                        newPosition[0] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          position: newPosition
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Y</label>
                    <input
                      type="number"
                      value={selectedObject.position[1]}
                      onChange={(e) => {
                        const newPosition: [number, number, number] = [...selectedObject.position];
                        newPosition[1] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          position: newPosition
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Z</label>
                    <input
                      type="number"
                      value={selectedObject.position[2]}
                      onChange={(e) => {
                        const newPosition: [number, number, number] = [...selectedObject.position];
                        newPosition[2] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          position: newPosition
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="property-group">
                <label>Rotation</label>
                <div className="vector3-input">
                  <div className="vector-component">
                    <label>X</label>
                    <input
                      type="number"
                      value={selectedObject.rotation[0]}
                      onChange={(e) => {
                        const newRotation: [number, number, number] = [...selectedObject.rotation];
                        newRotation[0] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          rotation: newRotation
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Y</label>
                    <input
                      type="number"
                      value={selectedObject.rotation[1]}
                      onChange={(e) => {
                        const newRotation: [number, number, number] = [...selectedObject.rotation];
                        newRotation[1] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          rotation: newRotation
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Z</label>
                    <input
                      type="number"
                      value={selectedObject.rotation[2]}
                      onChange={(e) => {
                        const newRotation: [number, number, number] = [...selectedObject.rotation];
                        newRotation[2] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          rotation: newRotation
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="property-group">
                <label>Scale</label>
                <div className="vector3-input">
                  <div className="vector-component">
                    <label>X</label>
                    <input
                      type="number"
                      value={selectedObject.scale[0]}
                      onChange={(e) => {
                        const newScale: [number, number, number] = [...selectedObject.scale];
                        newScale[0] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          scale: newScale
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Y</label>
                    <input
                      type="number"
                      value={selectedObject.scale[1]}
                      onChange={(e) => {
                        const newScale: [number, number, number] = [...selectedObject.scale];
                        newScale[1] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          scale: newScale
                        });
                      }}
                    />
                  </div>
                  <div className="vector-component">
                    <label>Z</label>
                    <input
                      type="number"
                      value={selectedObject.scale[2]}
                      onChange={(e) => {
                        const newScale: [number, number, number] = [...selectedObject.scale];
                        newScale[2] = parseFloat(e.target.value);
                        handleUpdateObject({
                          ...selectedObject,
                          scale: newScale
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="property-section">
              <h4>Object</h4>
              
              <div className="property-group">
                <label>Name</label>
                <input
                  type="text"
                  value={selectedObject.name}
                  onChange={(e) => {
                    handleUpdateObject({
                      ...selectedObject,
                      name: e.target.value
                    });
                  }}
                />
              </div>
              
              <div className="property-group">
                <label>Visible</label>
                <input
                  type="checkbox"
                  checked={selectedObject.visible}
                  onChange={(e) => {
                    handleUpdateObject({
                      ...selectedObject,
                      visible: e.target.checked
                    });
                  }}
                />
              </div>
              
              <div className="property-group">
                <label>Locked</label>
                <input
                  type="checkbox"
                  checked={selectedObject.locked}
                  onChange={(e) => {
                    handleUpdateObject({
                      ...selectedObject,
                      locked: e.target.checked
                    });
                  }}
                />
              </div>
            </div>
            
            <div className="property-section">
              <div className="section-header">
                <h4>Components</h4>
                <button 
                  className="add-component-btn"
                  onClick={() => handleAddComponent('Physics')}
                >
                  <FaPlus /> Add
                </button>
              </div>
              
              {selectedObject.components.length > 0 ? (
                <div className="component-list">
                  {selectedObject.components.map(component => (
                    <div key={component.id} className="component-item">
                      <div className="component-header">
                        <span className="component-name">{component.name}</span>
                        <div className="component-controls">
                          <input
                            type="checkbox"
                            checked={component.enabled}
                            onChange={(e) => {
                              const updatedComponents = selectedObject.components.map(comp =>
                                comp.id === component.id
                                  ? { ...comp, enabled: e.target.checked }
                                  : comp
                              );
                              
                              handleUpdateObject({
                                ...selectedObject,
                                components: updatedComponents
                              });
                            }}
                          />
                          <button
                            className="remove-component-btn"
                            onClick={() => handleRemoveComponent(component.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      
                      <div className="component-properties">
                        {/* Component-specific properties would go here */}
                        <div className="property-group">
                          <label>Example Property</label>
                          <input type="text" placeholder="Value" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-components">
                  <p>No components added</p>
                  <button onClick={() => handleAddComponent('Physics')}>
                    <FaPlus /> Add Component
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <p>No object selected</p>
            <p>Click on an object in the scene or drag an object from the library</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameAssembler; 