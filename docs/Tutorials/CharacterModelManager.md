# Character Model Manager Tutorial

This tutorial will guide you through using the Character Model Manager in GameStuAI Engine to import, manage, and integrate 3D character models into your game.

**Difficulty Level**: Intermediate  
**Time to Complete**: 30 minutes  
**Prerequisites**: Basic familiarity with GameStuAI Engine interface  
**Video Tutorial**: [Watch on YouTube](https://youtube.com/gamestudai/character-model-tutorial)

## Contents

1. [Introduction](#introduction)
2. [Accessing the Character Model Manager](#accessing-the-character-model-manager)
3. [Uploading Your First Model](#uploading-your-first-model)
4. [Organizing Models with Tags](#organizing-models-with-tags)
5. [Previewing and Editing Models](#previewing-and-editing-models)
6. [Adding a Character to Your Game](#adding-a-character-to-your-game)
7. [Integrating with Visual Scripting](#integrating-with-visual-scripting)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

## Introduction

The Character Model Manager is a powerful tool that allows you to:

- Import 3D character models in various formats (GLB, GLTF, FBX, OBJ)
- Preview models in a 3D viewer
- Organize your model library with tags
- Edit model properties
- Add characters to your game world
- Create visual scripting nodes for character behavior

This tutorial will walk you through each of these features using a simple example project.

## Accessing the Character Model Manager

1. Launch GameStuAI Engine
2. Open an existing project or create a new one
3. Click on the "Character Models" tab in the top navigation bar

![Character Models Tab](../assets/images/tutorials/character-model-manager/character-models-tab.png)

You should now see the Character Model Manager interface, which consists of:
- A library section on the left showing your models
- A preview panel on the right for viewing selected models

## Uploading Your First Model

Let's upload a character model:

1. Click the "Upload Model" button in the top-left corner of the Character Model Manager

![Upload Button](../assets/images/tutorials/character-model-manager/upload-button.png)

2. In the file dialog, navigate to a 3D model file on your computer
   - For this tutorial, you can use one of the sample models from the [GameStuAI Asset Library](https://gamestudai.com/assets)
   - Supported formats: GLB, GLTF, FBX, OBJ

3. Select the file and click "Open"

4. Wait for the model to upload and process (this may take a few moments depending on the file size)

5. Once processed, your model will appear in the library section

![Model in Library](../assets/images/tutorials/character-model-manager/model-in-library.png)

### Supported Model Formats

The Character Model Manager supports the following formats:

| Format | Extensions | Best For |
|--------|------------|----------|
| glTF/GLB | .gltf, .glb | Modern web-based games, best compatibility |
| FBX | .fbx | Complex rigs and animations |
| OBJ | .obj | Simple static models, wide compatibility |

> **Tip**: For best results, use GLB format which includes embedded textures and animations in a single file.

## Organizing Models with Tags

As your model library grows, you'll want to organize your models for easy access:

1. Select a model by clicking on it in the library
2. Click the "Edit" button in the preview panel

![Edit Button](../assets/images/tutorials/character-model-manager/edit-button.png)

3. In the edit form, find the "Tags" section
4. Add relevant tags separated by commas (e.g., "human, male, fantasy")
5. Click "Save" to apply the changes

![Adding Tags](../assets/images/tutorials/character-model-manager/adding-tags.png)

### Filtering Models

Once you've added tags to your models, you can filter them:

1. In the library header, click on a tag in the tag filter bar
2. The library will show only models with that tag
3. Click multiple tags to refine your filter further
4. Click a selected tag again to remove it from the filter

You can also use the search bar to find models by name:

1. Type in the search bar above the model grid
2. The library will update in real-time to show matching models
3. Clear the search bar to show all models again

## Previewing and Editing Models

Let's take a closer look at a model:

1. Select a model from your library by clicking on it
2. The model appears in the 3D preview panel on the right

### Controlling the Preview

In the preview panel:
- Click and drag to rotate the model
- Use the mouse wheel to zoom in and out
- Right-click and drag to pan the view
- Double-click to reset the view

### Editing Model Properties

To edit a model's properties:

1. With a model selected, click the "Edit" button in the preview panel
2. In the edit form, you can modify:
   - Model Name
   - Model Type (Character, Prop, Environment)
   - Tags
3. Click "Save" to apply your changes or "Cancel" to discard them

## Adding a Character to Your Game

Now let's add the character to your game scene:

1. Select a model from your library
2. In the preview panel, find the "Add to Game" section
3. Set the initial transform:
   - Position (X, Y, Z coordinates)
   - Rotation (degrees)
   - Scale (multiplier)

![Transform Controls](../assets/images/tutorials/character-model-manager/transform-controls.png)

4. Choose behavior options:
   - Walkable Character (can move around)
   - Interactive Object (can be clicked/interacted with)
   - Physics Simulation (affected by gravity and collisions)
   - AI Controlled (automated behavior)
   - Animated (has animations that can play)

5. Click "Add to Game World"

![Add to Game](../assets/images/tutorials/character-model-manager/add-to-game.png)

6. Switch to the Scene tab to see your character in the game world

![Character in Scene](../assets/images/tutorials/character-model-manager/character-in-scene.png)

## Integrating with Visual Scripting

The Character Model Manager integrates with the Visual Scripting system to allow you to control your characters through scripts:

1. With a model selected, click "Create Model Node in Script" in the preview panel
2. Switch to the Visual Scripting tab
3. You'll see a new node has been added to your script representing your character model

### Character Model Nodes

There are several node types you can use with character models:

1. **Load Model Node**
   - Loads a character model by ID
   - Useful for dynamically spawning characters

2. **Animate Model Node**
   - Plays animations on a character
   - Set animation name, speed, and loop options

3. **Move Character Node**
   - Moves a character to a position
   - Controls speed and path finding

4. **Character Action Node**
   - Triggers predefined actions like idle, walk, jump

Let's create a simple script to animate our character:

1. In the Visual Scripting tab, find the "Game Start" node (or add one if it doesn't exist)
2. Drag a line from the "Game Start" output to the character model node input
3. Add an "Animate Model" node
4. Connect the character model node output to the "Animate Model" input
5. Select the "Animate Model" node and set:
   - Animation Name: "idle" (or an animation name that exists in your model)
   - Speed: 1
   - Loop: true

![Animation Script](../assets/images/tutorials/character-model-manager/animation-script.png)

6. Click "Run" to see your character animate in the game view

## Advanced Features

### Model Variants

You can create variants of models with different properties:

1. Select a model and click "Create Variant"
2. Modify the properties of the variant
3. Both the original and variant will be available in your library

### Batch Operations

To apply changes to multiple models at once:

1. Hold Ctrl/Cmd and click multiple models to select them
2. Right-click and select "Edit Selected"
3. Any changes you make will apply to all selected models

### Model Presets

Save commonly used configurations as presets:

1. Set up a model with your desired transform and behavior settings
2. Click "Save as Preset" in the preview panel
3. Name your preset
4. Access the preset by clicking "Load Preset" when working with any model

## Troubleshooting

### Model Appears Too Large or Small

If your model appears at an incorrect scale:

1. Select the model in your scene
2. Adjust the Scale value in the Inspector panel
3. For future imports, consider adjusting the scale in your 3D modeling software

### Missing Textures

If your model appears gray or with missing textures:

1. For OBJ files, ensure the MTL file and texture files are in the same directory when uploading
2. For GLTF/GLB, ensure textures are embedded in the file
3. Check that your model uses supported texture formats (JPG, PNG, WebP)

### Animations Not Working

If animations aren't playing:

1. Ensure your model includes animation data
2. Check that animation names match what you're using in your scripts
3. Verify that the "Animated" behavior option is enabled

## Next Steps

Now that you've learned the basics of the Character Model Manager, you can:

- Import more complex character models
- Create a library of characters for your game
- Use visual scripting to create complex character behaviors
- Learn about advanced animation techniques in the [Character Animation](./CharacterAnimation.md) tutorial

### Practice Exercise

Try this exercise to test your skills:

1. Import at least three different character models
2. Tag and organize them in your library
3. Create a scene with all three characters
4. Make each character perform a different animation using visual scripting

### Related Tutorials

- [Character Animation](./CharacterAnimation.md)
- [Visual Scripting Basics](./VisualScriptingBasics.md)
- [Physics Simulation](./PhysicsBasics.md)

---

Congratulations! You now know how to use the Character Model Manager to import, manage, and integrate 3D character models into your GameStuAI Engine projects. 