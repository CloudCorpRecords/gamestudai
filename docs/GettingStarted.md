# Getting Started with GameStuAI Engine

Welcome to GameStuAI Engine! This guide will walk you through the process of setting up and creating your first game with GameStuAI Engine.

## Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [First Launch](#first-launch)
4. [Creating Your First Project](#creating-your-first-project)
5. [Exploring the Interface](#exploring-the-interface)
6. [Your First Game: Hello World](#your-first-game-hello-world)
7. [Next Steps](#next-steps)

## System Requirements

Before installing GameStuAI Engine, make sure your system meets the following requirements:

### Minimum Requirements:
- **Operating System**: Windows 10/11, macOS 11+, Ubuntu 20.04+
- **Processor**: Intel Core i5 or equivalent
- **Memory**: 8GB RAM
- **Storage**: 2GB available space
- **Graphics**: DirectX 11 / Metal / Vulkan compatible GPU
- **Display**: 1080p resolution
- **Internet**: Required for installation and updates

### Recommended Requirements:
- **Operating System**: Windows 11, macOS 12+, Ubuntu 22.04+
- **Processor**: Intel Core i7/i9 or equivalent
- **Memory**: 16GB RAM
- **Storage**: 4GB available space
- **Graphics**: NVIDIA GTX 1660 / AMD RX 5600 or better
- **Display**: 1440p resolution
- **Internet**: Broadband connection

## Installation

Follow these steps to install GameStuAI Engine:

### Windows:
1. Download the installer from [gamestudai.com/download](https://gamestudai.com/download)
2. Run the `.exe` installer file
3. Follow the on-screen instructions
4. Launch GameStuAI Engine from the desktop shortcut or Start menu

### macOS:
1. Download the `.dmg` file from [gamestudai.com/download](https://gamestudai.com/download)
2. Open the `.dmg` file
3. Drag GameStuAI Engine to your Applications folder
4. Open GameStuAI Engine from your Applications

### Linux:
1. Download the AppImage from [gamestudai.com/download](https://gamestudai.com/download)
2. Make the AppImage executable: `chmod +x GameStuAI-Engine.AppImage`
3. Run the AppImage: `./GameStuAI-Engine.AppImage`

### Installing via npm:
If you prefer using npm:
```bash
npm install -g gamestudai-engine
gamestudai-engine
```

## First Launch

When you first launch GameStuAI Engine, you'll be greeted with a welcome screen that offers several options:

1. **Create New Project**: Start a new game project from scratch
2. **Open Existing Project**: Load a project you've worked on before
3. **Try Templates**: Start with a pre-made template game
4. **Learn GameStuAI**: Access tutorials and documentation
5. **Community**: Connect with other GameStuAI users

For your first time, we recommend selecting "Try Templates" to explore some sample projects, but for this guide, we'll walk through creating a project from scratch.

## Creating Your First Project

To create a new project:

1. Click "Create New Project" on the welcome screen or select File → New Project
2. Enter a project name (e.g., "MyFirstGame")
3. Choose a location to save your project
4. Select a template (for beginners, "Empty 3D Game" is recommended)
5. Click "Create Project"

The engine will set up your new project with the basic structure needed to start development.

## Exploring the Interface

The GameStuAI Engine interface is divided into several key areas:

### Main Menu
At the top of the window, providing access to all engine features and settings.

### Toolbar
Below the main menu, containing frequently used tools and actions.

### Scene View
The central area where you can see and manipulate your game world in 3D.

### Hierarchy Panel
On the left side, showing all objects in your scene in a tree structure.

### Inspector Panel
On the right side, showing properties of the currently selected object.

### Project Panel
At the bottom, showing all assets and files in your project.

### Console
At the bottom, showing logs, warnings, and errors.

Take some time to explore these panels by clicking around the interface.

## Your First Game: Hello World

Let's create a simple "Hello World" game to get familiar with the basics:

### Step 1: Create a 3D Scene

1. Go to File → New Scene or click the "+" in the Project panel
2. Select "3D Scene" and name it "MainScene"
3. Click "Create"

### Step 2: Add a 3D Object

1. Right-click in the Hierarchy panel
2. Select 3D Object → Cube
3. The cube will appear in your scene

### Step 3: Position the Camera

1. Select the Main Camera in the Hierarchy panel
2. In the Inspector panel, set its Position to X: 0, Y: 1, Z: -10
3. Make sure it's pointing toward the cube

### Step 4: Add a Material to the Cube

1. Right-click in the Project panel
2. Select Create → Material and name it "CubeMaterial"
3. Select the new material
4. In the Inspector, change its color to blue
5. Drag the material onto the cube in the Scene view

### Step 5: Add a Visual Script

1. Click on the Visual Scripting tab at the top
2. Click "New Script" and name it "RotateCube"
3. From the Node Selector, drag a "Game Start" node onto the canvas
4. Drag a "Find Object" node and connect it to the Game Start node
5. Set the Find Object property to "Cube" 
6. Drag a "Loop" node and connect it to the Find Object node
7. Drag a "Get Transform" node and connect it to the Loop node
8. Drag a "Rotate" node and connect it to the Get Transform node
9. Set the Rotate node X, Y, Z values to 0, 1, 0
10. Click "Save" and return to the scene

### Step 6: Run Your Game

1. Click the Play button at the top of the interface
2. You should see your blue cube rotating in the game view
3. Press Escape or click the Stop button to exit play mode

Congratulations! You've created your first simple game with GameStuAI Engine.

## Next Steps

Now that you've created a basic project, here are some suggested next steps:

### Learn More About GameStuAI Engine
- Follow the [Basic Tutorials](./Tutorials/BasicTutorials.md)
- Explore the [Visual Scripting System](./VisualScripting.md)
- Learn about the [Character Model Manager](./CharacterModelManager.md)

### Enhance Your Game
- Add more objects to your scene
- Create more complex scripts
- Import 3D models and textures
- Add sound effects and music

### Connect with the Community
- Join our [Discord server](https://discord.gg/gamestudai)
- Ask questions on the [forums](https://forum.gamestudai.com)
- Share your creations on [social media](https://twitter.com/gamestudai) with #GameStuAI

### Troubleshooting
If you encounter any issues, refer to the [Troubleshooting Guide](./Troubleshooting.md) or reach out to our community for help.

---

We're excited to see what you create with GameStuAI Engine! Happy game developing! 