# GameStuAI Engine

GameStuAI Engine is an open-source AI-assisted 3D game engine that makes game development accessible to everyone. With a focus on no-code development, creators can build engaging games without writing a single line of code.

## ✨ Features

- **No-Code Development**: Build games without writing code
- **3D Scene Editor**: Create immersive worlds visually
- **Visual Scripting System**: Create game logic with connected nodes
- **Asset Management**: Import and organize 3D models, textures, and sounds
- **AI-Powered Creation**: Generate assets, terrain, and game logic with AI
- **Cross-Platform**: Export your games to web, desktop, and mobile
- **Physics Engine**: Realistic physics simulation using cannon.js with Unreal Engine-like physics properties
- **3D Character Model Manager**: Upload, preview, and integrate 3D character models

## 🚀 AI-Assisted Features

With GameStuAI Engine, you can use AI to:

1. **Generate 3D Models**: Create characters, objects, and environments
2. **Design Game Logic**: Describe the behavior you want, and AI will create the visual scripts
3. **Create Terrain**: Generate detailed landscapes from text descriptions
4. **Write Dialogue**: Create compelling character conversations
5. **Optimize Performance**: Let AI suggest optimizations for your game

## 🌎 World Creation

The World Creator in GameStuAI Engine includes:

1. **Terrain Editor**:
   - Sculpt terrain with intuitive brushes
   - Apply different textures (grass, rock, sand, etc.)
   - Generate terrain from heightmaps or AI descriptions
   - Add water, trees, and foliage

2. **Object Placement**:
   - Drag and drop objects into your scene
   - Precise positioning with transform controls
   - Advanced Unreal Engine-like physics properties for each object
   - Group objects for easier management

3. **Environment Controls**:
   - Dynamic sky with time of day controls
   - Weather effects (rain, snow, fog)
   - Ambient lighting and atmospheric effects
   - Post-processing effects for visual enhancements

## 🧠 Visual Scripting

Create game logic visually with our node-based scripting system:

1. **Node Types**:
   - Event nodes (collisions, triggers, input)
   - Action nodes (movement, animations, sounds)
   - Logic nodes (conditions, loops, variables)
   - Math nodes (calculations, vectors, transformations)
   - Physics nodes (forces, constraints, raycasts)
   - Character Model Nodes (load, animate, control characters)

2. **Easy Connections**:
   - Connect nodes with visual wires
   - Color-coded connections for different data types
   - Auto-suggestion for compatible connections
   - Error checking and validation

3. **Custom Behaviors**:
   - Create reusable behavior scripts
   - Share scripts with the community
   - Nest scripts for complex functionality
   - AI suggestions for optimizing behaviors

## 💾 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/CloudCorpRecords/gamestudai.git
   cd gamestudai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🎮 Using GameStuAI Engine

### World Builder

1. **Terrain Editor**: Create landscapes with various terrain types and features.
2. **Object Placement**: Add objects to your world with precise control.
   - Control advanced physics properties like friction, bounciness, mass, and simulation type
   - Choose from various physics materials (metal, wood, rubber, ice, etc.)
   - Select different collision shapes for accurate physical behavior
3. **Environment Settings**: Adjust lighting, sky, and weather effects.

### Character Model Manager

Access the Character Model Manager from the sidebar to:

1. **Upload Models**: 
   - Support for GLB, GLTF, FBX, and OBJ formats
   - Add metadata and tags for organization

2. **Manage Model Library**:
   - Browse your collection of models
   - Search and filter by tags
   - Preview in real-time 3D viewer

3. **Add to Game World**:
   - Drag and drop models into your game scene
   - Configure position, rotation, and scale
   - Apply physics behaviors (walkable, interactive, physics-driven)

4. **Use in Visual Scripts**:
   - Connect character models to behaviors
   - Control animations and movement
   - Integrate with game events

### Physics System

Our physics system is inspired by Unreal Engine, providing:

1. **Material Properties**:
   - Predefined materials like metal, wood, rubber, concrete
   - Control friction, bounciness, and density
   - Custom material properties for unique behaviors

2. **Collision Shapes**:
   - Box, sphere, cylinder, capsule shapes
   - Convex hull for complex shapes
   - Compound shapes for multi-part objects

3. **Body Types**:
   - Static (immovable objects)
   - Dynamic (fully simulated physics)
   - Kinematic (user-controlled with physics response)
   - Simulated (character controllers with physics)

4. **Constraints**:
   - Hinges, point-to-point connections
   - Distance constraints
   - Springs and damping

5. **Debug Visualization**:
   - Real-time wireframe display of collision shapes
   - Physics properties displayed in the inspector

### Visual Scripting

In the Visual Scripting editor, you can:

1. **Character Model Nodes**:
   - **Load Model**: Loads a character model by ID
   - **Animate Model**: Plays animations on a character
   - **Move Character**: Moves a character to a target position
   - **Character Action**: Triggers predefined actions like idle, walk, run

2. **Creating Character Behaviors**:
   - Connect character model nodes with event nodes to trigger animations
   - Use logic nodes to create conditional behaviors
   - Build complex character AI with combinations of nodes

## 🧩 Architecture

GameStuAI Engine is built with modern web technologies:

- **React**: For building the user interface
- **Three.js**: 3D rendering engine
- **React Three Fiber**: React renderer for Three.js
- **Cannon.js**: Physics engine with Unreal Engine-like features
- **ReactFlow**: Visual scripting system
- **OpenAI API**: AI integration for asset generation and assistance
- **TypeScript**: For type safety and better developer experience

## 🤝 Contributing

Contributions are welcome! This project aims to make game development accessible to everyone, so we especially value contributions that improve usability and accessibility.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Roadmap

- [x] Basic UI framework and project structure
- [x] Scene editor with 3D rendering
- [x] Visual scripting system
- [x] Asset management
- [x] World creator with terrain and object placement
- [x] AI assistance integration
- [x] 3D Character Model Management
- [x] Physics integration with Unreal Engine-like features
- [ ] Animation system
- [ ] Game logic templates
- [ ] Export to web
- [ ] Export to desktop/mobile platforms
- [ ] Marketplace for assets and templates

## ✨ Inspiration

This project is inspired by accessible game engines like Unity, Unreal Engine Blueprint system, and Godot, with a focus on removing the coding barrier to entry for creative individuals who want to make games. The AI integration draws inspiration from emerging AI tools in creative fields. 