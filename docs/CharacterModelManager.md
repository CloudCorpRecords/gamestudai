# Character Model Manager Documentation

Welcome to the Character Model Manager documentation! This guide will help you understand how to use the Character Model Manager in GameStuAI Engine to create, manage, and integrate 3D character models into your games.

## Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [The Model Library](#the-model-library)
4. [Working with Models](#working-with-models)
5. [Model Integration](#model-integration)
6. [Visual Scripting Integration](#visual-scripting-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The Character Model Manager is a powerful tool that allows you to:

- Upload and manage 3D character models in various formats
- Preview models in a real-time 3D viewer
- Organize models with tags and categories
- Edit model properties
- Integrate models into your game world
- Create visual scripting nodes for character behavior

## Getting Started

### Accessing the Character Model Manager

1. Launch GameStuAI Engine
2. Click on the "Character Models" tab in the top navigation bar
3. The Character Model Manager interface will appear with two main sections:
   - The Model Library (left side)
   - The Preview Panel (right side)

### Interface Overview

![Character Model Manager Interface](../assets/images/docs/character-model-manager.png)

The Character Model Manager interface consists of:

- **Header Bar**: Contains the title and upload button
- **Library Header**: Contains search bar and tag filters
- **Model Grid**: Displays all available models
- **Preview Panel**: Shows the selected model and its details
- **Integration Panel**: Controls for adding models to your game

## The Model Library

The Model Library is where all your 3D character models are stored and organized.

### Uploading Models

1. Click the "Upload Model" button in the header
2. Select a 3D model file from your computer
   - Supported formats: GLB, GLTF, FBX, OBJ
3. The model will be processed and added to your library
4. You can also drag and drop files directly into the upload area

### Organizing Models

Models can be organized using tags:

1. Select a model by clicking on it
2. Click the "Edit" button in the preview panel
3. Add or remove tags in the tag editor
4. Click "Save" to apply changes

### Searching and Filtering

To find specific models:

1. Use the search bar to search by name or type
2. Click on tag filters to show only models with specific tags
3. Models that match both search and tag filters will be displayed

## Working with Models

### Selecting Models

Click on any model in the grid to select it. The selected model will be highlighted and displayed in the Preview Panel.

### Previewing Models

In the Preview Panel, you can:

1. View a 3D preview of the selected model
2. Orbit around the model by dragging with your mouse
3. Zoom in/out using the mouse wheel
4. Reset the view by double-clicking

### Editing Models

To edit a model:

1. Select a model from the library
2. Click the "Edit" button in the preview panel
3. Edit the following properties:
   - Model Name
   - Model Type (Character, Prop, Environment)
   - Tags
4. Click "Save" to apply your changes

### Deleting Models

To delete a model:

1. Select a model from the library
2. Click the "Delete" button in the preview panel
3. Confirm the deletion in the popup dialog

## Model Integration

The Model Integration panel allows you to add models to your game world or visual scripting system.

### Transform Controls

Set the initial transformation for your model:

1. **Position**: X, Y, Z coordinates in the game world
2. **Rotation**: Rotation angles in degrees
3. **Scale**: Size multiplier for each axis

### Behavior Assignment

Apply behaviors to your character:

1. Click on behavior options to toggle them
2. Available behaviors include:
   - Walkable Character
   - Interactive Object
   - Physics Simulation
   - AI Controlled
   - Animated
   - Collectable Item

### Adding to Game World

1. Set the transform values
2. Select desired behaviors
3. Click "Add to Game World"
4. The model will be added to your current scene

### Adding to Visual Scripting

1. Set the transform values
2. Select desired behaviors
3. Click "Create Model Node in Script"
4. Switch to the Visual Scripting tab to see your new node

## Visual Scripting Integration

The Character Model Manager integrates with the Visual Scripting system to provide specialized nodes for working with character models.

### Character Model Nodes

#### Load Model Node

- **Purpose**: Loads a 3D character model by ID
- **Inputs**: Model ID (string)
- **Outputs**: Model (object)
- **Example Use**: Start of a character behavior chain

#### Animate Model Node

- **Purpose**: Plays an animation on a character model
- **Inputs**: 
  - Model (object)
  - Animation Name (string)
  - Speed (number)
- **Outputs**: On Complete (event)
- **Example Use**: Playing a walking animation when a key is pressed

#### Move Character Node

- **Purpose**: Moves a character to a target position
- **Inputs**:
  - Character (object)
  - Target Position (vector)
  - Speed (number)
- **Outputs**: On Reached (event)
- **Example Use**: Moving an NPC to a waypoint

#### Character Action Node

- **Purpose**: Triggers a predefined action on a character
- **Inputs**:
  - Character (object)
  - Action (dropdown: idle, walk, run, jump, attack, die)
- **Outputs**: On Complete (event)
- **Example Use**: Making a character perform an action based on game events

### Example: Creating a Simple Character Controller

1. Add a "Game Start" node
2. Add a "Load Model" node and connect it to the Start node
3. Set the Model ID to your character model
4. Add a "Key Pressed" node (for WASD controls)
5. Add a "Move Character" node
6. Connect the Key Pressed to the Move Character node
7. Add an "Animate Model" node set to "walk"
8. Connect the model output to both Move and Animate nodes

## Best Practices

### Model Preparation

For best results with your 3D character models:

1. **Optimize polygon count**: Keep models under 50,000 polygons for better performance
2. **Use PBR materials**: For consistent rendering across platforms
3. **Properly rig characters**: Use a standard skeletal rig for animations
4. **Include basic animations**: Idle, walk, run as a minimum
5. **Texture sizes**: Keep textures at 2048x2048 or smaller
6. **Center pivot points**: Models should be centered at the origin
7. **Use appropriate scale**: Character models should be approximately 1.8 units tall
8. **Apply compression**: Compress textures for better performance

### Organization Tips

1. Use consistent naming conventions for models
2. Apply specific tags for easier filtering
3. Group related characters together using common tags
4. Keep separate libraries for different projects
5. Regularly back up your model library

## Troubleshooting

### Common Issues

#### Model appears too large or small

- Solution: Adjust the scale in the Transform panel before adding to game
- Prevention: Ensure your 3D modeling software uses the same scale as GameStuAI Engine

#### Model appears with missing textures

- Solution: Make sure textures are properly embedded in your model file
- For OBJ files, ensure MTL and texture files are included
- For GLTF/GLB, use embedded textures when possible

#### Model appears at the wrong orientation

- Solution: Adjust rotation before adding to game
- Prevention: In your 3D software, align models to the forward Z-axis

#### Model animations don't play correctly

- Solution: Ensure animations are properly named in the model file
- Check that the model has a properly rigged skeleton
- Verify animation names match those used in your visual script

### Getting Help

If you encounter issues not covered in this guide:

1. Check the GameStuAI community forum
2. Submit a detailed bug report via GitHub Issues
3. Consult the API documentation for advanced usage

---

This documentation is continually updated. For the latest version, please visit the GameStuAI documentation repository. 