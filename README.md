# GameStuAI Engine

An open-source AI-assisted 3D game engine focused on making game development accessible to everyone, regardless of coding experience.

## 🎮 Features

- **No-code Game Development**: Create games using visual scripting and intuitive interfaces
- **3D Scene Editor**: Drag and drop objects to build your game world
- **Visual Scripting System**: Create game logic without writing code
- **Asset Management**: Import and organize 3D models, textures, audio, and more
- **World Creator**: Easily create beautiful game worlds with terrain, objects, and environments
- **3D Character Model Manager**: Seamlessly upload, manage, and animate character models
- **AI-Powered Creation**: Generate assets, scripts, and game elements using AI
- **Physics Engine**: Realistic physics simulation using cannon.js
- **Cross-platform Export**: Build games for web, desktop, and mobile platforms
- **Modern UI**: Beautiful and intuitive user interface

## 🧠 AI-Assisted Features

GameStuAI takes game development to the next level with AI assistance:

- **Asset Generation**: Create 3D models, textures, and sounds using AI prompts
- **NPC Behavior**: Design complex character behaviors without coding
- **Level Generation**: Generate complete game levels from text descriptions
- **Visual Scripting with AI**: AI nodes that can dynamically create game content
- **Terrain Generation**: Create landscapes and environments with natural text prompts
- **AI Assistant**: Get help and suggestions as you build your game

## 🌎 World Creation

The GameStuAI World Creator makes it easy to build immersive game worlds:

- **Terrain Editor**: Create landscapes with mountains, valleys, and different materials
- **Object Placement**: Drag and drop 3D objects into your world with precise control
- **Environment Settings**: Customize sky, lighting, weather, and atmospheric effects
- **AI-generated Worlds**: Generate entire worlds from text descriptions
- **Prefab System**: Create and reuse complex scene elements

## 👤 Character Model Management

Our new Character Model Manager provides powerful tools for working with 3D characters:

- **Model Library**: Upload, organize, and manage all your 3D character models
- **Multiple Format Support**: Import models in GLB, GLTF, FBX, and OBJ formats
- **3D Preview**: View and manipulate models in a real-time 3D preview
- **Tag System**: Organize models with tags for easy searching and filtering
- **Game Integration**: Add characters to your game world with position, rotation, and scale controls
- **Behavior Assignment**: Apply various behaviors to characters (walkable, interactive, AI-controlled)
- **Visual Script Integration**: Dedicated nodes for working with characters in the visual scripting system
- **Animation Controls**: Manage character animations through a simple interface

## 🔍 Visual Scripting System

Create game logic without writing code using our enhanced visual scripting system:

- **Node-Based Interface**: Connect nodes to create complex logic flows
- **Character Model Nodes**: Load, animate, and control character models
- **Logic Nodes**: Implement conditions, loops, and branches
- **Math Nodes**: Perform calculations and numerical operations
- **Event Nodes**: Respond to game events like collisions and user input
- **AI Nodes**: Leverage AI for dynamic content generation
- **Comprehensive Documentation**: Built-in help for all node types
- **Advanced Mode**: Toggle advanced nodes for more complex functionality
- **Script Management**: Save, load, and share your visual scripts

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Easy Installation (Recommended)

#### For Mac/Linux Users:
1. Open Terminal in the project directory
2. Run the following command:
   ```
   sh start.sh
   ```

#### For Windows Users:
1. Double-click the `start.bat` file in the project folder
   
OR

1. Open Command Prompt in the project directory
2. Run:
   ```
   start.bat
   ```

That's it! The script will check your Node.js version, install all dependencies, and start the development server automatically.

### Manual Installation (Alternative)

If you prefer to install manually:

1. Install dependencies with legacy peer dependencies:
   ```
   npm install --legacy-peer-deps
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## 📖 Using GameStuAI Engine

### Character Model Manager

1. **Accessing the Model Manager**:
   - Click on the "Character Models" tab in the top navigation bar

2. **Working with the Model Library**:
   - **Upload Models**: Click the "Upload Model" button to add 3D models
   - **Browse Models**: View all models in the library grid
   - **Search & Filter**: Use the search bar and tag filters to find models
   - **Select a Model**: Click on any model to view and edit it

3. **3D Model Preview**:
   - View the selected model in a 3D preview window
   - Orbit around the model to see it from all angles
   - Edit model properties (name, type, tags) by clicking the "Edit" button

4. **Adding Models to Your Game**:
   - Select a model from the library
   - Use the integration panel to set position, rotation, and scale
   - Select behaviors to apply to the character
   - Click "Add to Game World" to place the model in your game

5. **Adding Models to Visual Scripts**:
   - Select a model and click "Add to Script" to create a model node in the Visual Scripting editor
   - Connect the model node to other nodes to create character behaviors

### Visual Scripting with Character Models

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
- **Cannon.js**: Physics engine
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
- [ ] Physics integration
- [ ] Animation system
- [ ] Game logic templates
- [ ] Export to web
- [ ] Export to desktop/mobile platforms
- [ ] Marketplace for assets and templates

## ✨ Inspiration

This project is inspired by accessible game engines like Unity, Unreal Engine Blueprint system, and Godot, with a focus on removing the coding barrier to entry for creative individuals who want to make games. The AI integration draws inspiration from emerging AI tools in creative fields. 