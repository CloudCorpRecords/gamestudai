# Visual Scripting System Documentation

Welcome to the Visual Scripting System documentation for GameStuAI Engine! This guide will help you understand how to use the visual scripting system to create game logic without writing code.

## Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [The Visual Scripting Interface](#the-visual-scripting-interface)
4. [Working with Nodes](#working-with-nodes)
5. [Node Types](#node-types)
6. [Creating Scripts](#creating-scripts)
7. [Script Examples](#script-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The Visual Scripting System in GameStuAI Engine allows you to create game logic and behaviors without writing code. By connecting nodes in a visual graph, you can create complex interactions, animations, and game mechanics.

Key features include:
- Intuitive node-based interface
- Logic, math, and character model nodes
- Real-time preview and testing
- Advanced and beginner modes
- Script saving and loading
- Integration with other GameStuAI Engine systems

## Getting Started

### Accessing the Visual Scripting System

1. Launch GameStuAI Engine
2. Click on the "Visual Scripting" tab in the top navigation bar
3. The Visual Scripting interface will appear with three main sections:
   - Node Selector (left sidebar)
   - Script Canvas (center area)
   - Properties Panel (right sidebar)

### Creating Your First Script

1. Click "New Script" in the top-left corner
2. Name your script something descriptive
3. From the Node Selector, drag the "Game Start" node onto the canvas
4. Drag an "Object Create" node onto the canvas
5. Connect the output port of the "Game Start" node to the input port of the "Object Create" node
6. Select the "Object Create" node and set its properties in the Properties Panel
7. Click "Run" to test your script

## The Visual Scripting Interface

### Node Selector

The Node Selector is located on the left side of the screen and contains all available nodes organized by category:

- **Logic Nodes**: Conditions, loops, events
- **Math Nodes**: Mathematical operations and calculations
- **Character Model Nodes**: For working with 3D character models
- **Game Object Nodes**: For creating and manipulating game objects
- **Input Nodes**: For handling player input
- **Physics Nodes**: For collision detection and physics simulation
- **UI Nodes**: For creating and controlling UI elements
- **Audio Nodes**: For playing sounds and music

You can toggle between "Basic" and "Advanced" nodes using the toggle at the top of the Node Selector.

### Script Canvas

The Script Canvas is the central area where you build your visual scripts by:

- Dragging nodes from the Node Selector
- Connecting node ports by clicking and dragging from one port to another
- Rearranging nodes by dragging them around the canvas
- Selecting multiple nodes by dragging a selection box
- Deleting nodes by selecting them and pressing Delete
- Zooming in/out using the mouse wheel or zoom controls
- Panning by holding the middle mouse button and dragging

### Properties Panel

The Properties Panel appears on the right side when you select a node. It displays the properties of the selected node and allows you to:

- Edit node properties
- Configure node behavior
- Set default values
- Choose from dropdown options
- Toggle advanced properties

### Quick Actions Bar

The Quick Actions Bar at the top of the screen provides:

- New Script: Create a new visual script
- Save: Save the current script
- Load: Load an existing script
- Export: Export the script as a JSON file
- Run: Test the current script
- Stop: Stop the running script
- Help: Access this documentation

## Working with Nodes

### Node Anatomy

Each node consists of:

- **Header**: Contains the node name and optional controls
- **Input Ports**: Located on the left side of the node
- **Output Ports**: Located on the right side of the node
- **Properties**: Configurable in the Properties Panel when the node is selected

### Node Connections

Connections represent the flow of data or execution between nodes:

- **Execution Connections**: Thick lines that determine the order of execution
- **Data Connections**: Thin lines that pass values between nodes
- **Valid Connections**: The system only allows connections between compatible port types

To create a connection:
1. Click on an output port
2. Drag to an input port of another node
3. Release to create the connection

To delete a connection:
1. Click on the connection line
2. Press Delete or right-click and select "Delete Connection"

### Node Groups

You can organize complex scripts by grouping related nodes:

1. Select multiple nodes by dragging a selection box
2. Right-click and select "Group"
3. Name the group
4. Collapse/expand the group by clicking the toggle

## Node Types

### Logic Nodes

- **Start**: Entry point for the script (Game Start, Level Start, Object Start)
- **Branch**: IF-THEN conditional logic
- **Sequence**: Execute nodes in sequence
- **Loop**: For, While, Do-While loops
- **Event**: Listen for game events (collision, trigger, timer)
- **Delay**: Wait for a specified time
- **Random**: Select a random path
- **Gate**: Control flow based on a condition
- **Comparison**: Compare two values (equal, not equal, greater than, less than)

### Math Nodes

- **Add**: Add two or more values
- **Subtract**: Subtract one value from another
- **Multiply**: Multiply two or more values
- **Divide**: Divide one value by another
- **Vector**: Create or modify 3D vectors
- **Transform**: Transform vectors (translate, rotate, scale)
- **Random**: Generate random numbers
- **Lerp**: Linear interpolation between values
- **Min/Max**: Return minimum or maximum of multiple values
- **Clamp**: Constrain a value between a minimum and maximum

### Character Model Nodes

- **Load Model**: Load a 3D character model by ID
- **Animate Model**: Play an animation on a character model
- **Move Character**: Move a character to a target position
- **Character Action**: Trigger a predefined action on a character

### Game Object Nodes

- **Create Object**: Create a new game object
- **Get Property**: Get a property from a game object
- **Set Property**: Set a property on a game object
- **Destroy Object**: Remove a game object from the scene
- **Find Object**: Find a game object by name or tag
- **Instantiate**: Create a copy of an existing object
- **Parent/Child**: Manage hierarchical relationships between objects

### Input Nodes

- **Key Press**: Detect keyboard input
- **Mouse Click**: Detect mouse clicks
- **Touch Input**: Detect touch screen input
- **Gamepad**: Detect gamepad input
- **Axis Input**: Handle analog input (joysticks, triggers)

## Creating Scripts

### Script Management

- **Create**: Click "New Script" in the Quick Actions Bar
- **Save**: Click "Save" to store your script
- **Load**: Click "Load" to open a saved script
- **Export/Import**: Use the Export/Import buttons to share scripts

### Script Organization

For complex scripts:
1. Use groups to organize related functionality
2. Use comments to explain script sections
3. Follow a left-to-right flow for better readability
4. Use consistent naming conventions
5. Break complex logic into sub-scripts

### Script Debugging

To debug your scripts:
1. Click "Run" to execute the script
2. Watch the flow of execution on the canvas (active connections will be highlighted)
3. Check for errors in the console at the bottom of the screen
4. Use the "Log" node to output values during execution
5. Place "Breakpoint" nodes to pause execution at specific points

## Script Examples

### Example 1: Character Movement with WASD Controls

This script creates a character and allows it to move with WASD keys:

1. Add a "Game Start" node
2. Add a "Load Model" node and connect it to the Start node
3. Set the Model ID to your character model
4. Add four "Key Press" nodes (W, A, S, D)
5. Add a "Get Position" node connected to the model output
6. Add four "Add" nodes for each direction
7. Connect each Add node to the corresponding Key Press node
8. Add a "Set Position" node
9. Connect all Add nodes to the Set Position node

### Example 2: Collectible Item

This script creates a collectible item that disappears when the player touches it:

1. Add an "Object Start" node
2. Add a "Collision Event" node connected to Start
3. Add a "Compare Tag" node connected to Collision
4. Set the tag to "Player"
5. Add a "Branch" node connected to Compare Tag
6. Add a "Play Sound" node connected to the True output
7. Add an "Add Score" node connected to Play Sound
8. Add a "Destroy Object" node connected to Add Score

## Best Practices

### Performance Optimization

1. Minimize the number of active nodes
2. Avoid creating infinite loops
3. Use efficient node connections
4. Limit the use of heavy operations in Update loops
5. Use event-based logic when possible

### Script Structure

1. Keep scripts modular and reusable
2. Create clear input and output interfaces
3. Document complex logic with comments
4. Use consistent naming conventions
5. Test scripts incrementally

### Version Control

1. Export important scripts regularly
2. Use descriptive naming for script versions
3. Keep a backup of critical scripts
4. Document major changes

## Troubleshooting

### Common Issues

#### Script not executing

- Ensure the Start node is properly connected
- Check for disconnected execution paths
- Verify that all required properties are set
- Look for errors in the console

#### Nodes not connecting

- Verify that the ports are compatible types
- Check if the output port already has the maximum connections
- Ensure you're connecting from output to input (not input to input)

#### Values not passing correctly

- Check the data types of connected ports
- Verify that the providing node is executing before the receiving node
- Use a "Log" node to debug values during execution

#### Performance issues

- Look for accidental infinite loops
- Reduce the number of nodes in Update loops
- Check for memory leaks (objects not being destroyed)
- Consider splitting into multiple smaller scripts

### Getting Help

If you encounter issues not covered in this guide:

1. Check the GameStuAI community forum
2. Submit a detailed bug report via GitHub Issues
3. Consult the API documentation for advanced usage
4. Use the floating help button in the interface for context-specific help

---

This documentation is continually updated. For the latest version, please visit the GameStuAI documentation repository. 