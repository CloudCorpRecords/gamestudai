# Visual Scripting Basics Tutorial

This tutorial will introduce you to the Visual Scripting system in GameStuAI Engine, allowing you to create game logic without writing code.

**Difficulty Level**: Beginner  
**Time to Complete**: 45 minutes  
**Prerequisites**: Basic familiarity with GameStuAI Engine interface  
**Video Tutorial**: [Watch on YouTube](https://youtube.com/gamestudai/visual-scripting-basics)

## Contents

1. [Introduction](#introduction)
2. [Accessing the Visual Scripting Editor](#accessing-the-visual-scripting-editor)
3. [Understanding the Interface](#understanding-the-interface)
4. [Creating Your First Script](#creating-your-first-script)
5. [Working with Logic Nodes](#working-with-logic-nodes)
6. [Using Math Nodes](#using-math-nodes)
7. [Creating Interactive Objects](#creating-interactive-objects)
8. [Saving and Loading Scripts](#saving-and-loading-scripts)
9. [Debugging Scripts](#debugging-scripts)
10. [Next Steps](#next-steps)

## Introduction

Visual Scripting is a powerful feature in GameStuAI Engine that allows you to create complex game behaviors without writing code. Instead, you connect visual nodes in a graph-like interface to create logic flows.

Key benefits include:
- No programming knowledge required
- Immediate visual feedback
- Easy to understand and modify
- Quick prototyping

## Accessing the Visual Scripting Editor

1. Launch GameStuAI Engine
2. Open an existing project or create a new one
3. Click on the "Visual Scripting" tab in the top navigation bar

![Visual Scripting Tab](../assets/images/tutorials/visual-scripting/visual-scripting-tab.png)

## Understanding the Interface

The Visual Scripting interface consists of three main sections:

### Node Selector (Left Side)
This panel contains all available nodes organized by category:
- Logic Nodes (conditionals, loops, events)
- Math Nodes (calculations, vectors)
- Game Object Nodes (create, modify objects)
- Input Nodes (keyboard, mouse, touch)
- Character Model Nodes (model operations)

### Script Canvas (Center)
This is your workspace where you:
- Place nodes
- Connect nodes
- Organize your logic flow

### Properties Panel (Right Side)
When you select a node, this panel shows:
- Configurable properties
- Input/output options
- Documentation

### Quick Actions Bar (Top)
Contains buttons for:
- New Script
- Save
- Load
- Run
- Stop

## Creating Your First Script

Let's create a simple script that makes a cube rotate when the game starts:

### Step 1: Create a New Script

1. Click "New Script" in the Quick Actions Bar
2. Name your script "RotatingCube"
3. Click "Create"

![New Script](../assets/images/tutorials/visual-scripting/new-script.png)

### Step 2: Add Start Node

1. In the Node Selector, find "Game Start" under Logic Nodes
2. Drag it onto the canvas
   
This node acts as the entry point for your script, triggering when the game begins.

### Step 3: Create a Cube

1. In the Node Selector, find "Create Object" under Game Object Nodes
2. Drag it onto the canvas
3. Connect the output port of "Game Start" to the input port of "Create Object"
   - Click on the white circle on the right side of Game Start
   - Drag to the white circle on the left side of Create Object

4. Select the "Create Object" node
5. In the Properties Panel, set:
   - Object Type: Cube
   - Position: X=0, Y=0, Z=0
   - Scale: X=1, Y=1, Z=1
   - Name: "RotatingCube"

![Connected Nodes](../assets/images/tutorials/visual-scripting/connected-nodes.png)

### Step 4: Add Loop Node

1. Find "Loop" under Logic Nodes
2. Drag it onto the canvas
3. Connect the output of "Create Object" to the input of "Loop"
4. In the Properties Panel, set:
   - Loop Type: Every Frame
   
This will make the contained actions run every frame.

### Step 5: Get the Cube

1. Find "Get Object" under Game Object Nodes
2. Drag it onto the canvas
3. Connect the output of "Loop" to the input of "Get Object"
4. In the Properties Panel, set:
   - Object Name: "RotatingCube"
   
This retrieves the cube we created earlier.

### Step 6: Rotate the Cube

1. Find "Rotate" under Game Object Nodes
2. Drag it onto the canvas
3. Connect the output of "Get Object" to the input of "Rotate"
4. Connect the object output of "Get Object" (the blue circle) to the object input of "Rotate" (the blue circle)
5. In the Properties Panel, set:
   - X: 0
   - Y: 1
   - Z: 0
   - Speed: 50

![Rotation Script](../assets/images/tutorials/visual-scripting/rotation-script.png)

### Step 7: Run Your Script

1. Click the "Run" button in the Quick Actions Bar
2. Switch to the "Game" tab to see your rotating cube
3. Press "Escape" or click "Stop" to end execution

Congratulations! You've created your first visual script that creates a cube and makes it rotate continuously.

## Working with Logic Nodes

Logic nodes control the flow of your script. Let's explore some common logic nodes:

### Branch (If-Then)

The Branch node allows your script to make decisions:

1. Create a new script named "BranchExample"
2. Add a "Game Start" node
3. Add a "Random Number" node from Math Nodes
4. Connect "Game Start" to "Random Number"
5. Add a "Branch" node from Logic Nodes
6. Connect "Random Number" to "Branch"
7. Add two "Create Object" nodes
8. Connect the "True" output of Branch to one "Create Object"
9. Connect the "False" output of Branch to the other "Create Object"
10. Configure the first "Create Object" to create a Sphere
11. Configure the second "Create Object" to create a Cube
12. Set the Branch condition to check if the random number > 0.5

![Branch Node](../assets/images/tutorials/visual-scripting/branch-node.png)

Run this script, and you'll get either a sphere or a cube randomly each time.

### Sequence

The Sequence node executes actions in order:

1. Create a new script named "SequenceExample"
2. Add a "Game Start" node
3. Add a "Sequence" node
4. Connect "Game Start" to "Sequence"
5. Add three "Create Object" nodes
6. Connect the first, second, and third outputs of "Sequence" to each "Create Object"
7. Configure them to create different objects at different positions

![Sequence Node](../assets/images/tutorials/visual-scripting/sequence-node.png)

This will create all three objects in sequence when the game starts.

## Using Math Nodes

Math nodes perform calculations. Let's use them to create a pulsing cube:

1. Create a new script named "PulsingCube"
2. Add "Game Start" → "Create Object" → "Loop" nodes as before
3. Add a "Time" node from Math Nodes
4. Connect "Loop" to "Time"
5. Add a "Sin" node from Math Nodes
6. Connect "Time" to "Sin"
7. Add a "Add" node from Math Nodes
8. Connect "Sin" to "Add"
9. Set the second input of "Add" to 1.5
10. Add a "Get Object" node, connected to "Loop"
11. Add a "Scale Object" node
12. Connect "Get Object" and "Add" to "Scale Object"

![Math Nodes](../assets/images/tutorials/visual-scripting/math-nodes.png)

Run this script to see a cube that pulses in size using a sine wave.

## Creating Interactive Objects

Let's create an object that changes color when clicked:

1. Create a new script named "ClickableObject"
2. Add a "Game Start" node
3. Add a "Create Object" node (set to create a Sphere)
4. Connect "Game Start" to "Create Object"
5. Add a "Mouse Click" node from Input Nodes
6. Connect "Create Object" to "Mouse Click"
7. Add a "Get Object" node
8. Connect "Mouse Click" to "Get Object"
9. Add a "Random Color" node from Math Nodes
10. Connect "Mouse Click" to "Random Color"
11. Add a "Set Material" node
12. Connect "Get Object" and "Random Color" to "Set Material"

![Interactive Object](../assets/images/tutorials/visual-scripting/interactive-object.png)

Run this script and click on the sphere to see it change color randomly.

## Saving and Loading Scripts

To save your script:

1. Click the "Save" button in the Quick Actions Bar
2. Your script is saved with the current name

To load an existing script:

1. Click the "Load" button
2. Select a script from the list
3. Click "Load"

You can also export scripts to share with others:

1. Right-click on the canvas
2. Select "Export Script"
3. Choose a location to save the JSON file

To import:

1. Right-click on the canvas
2. Select "Import Script"
3. Select a JSON script file

## Debugging Scripts

When things don't work as expected, use these debugging techniques:

### Log Node

1. Add a "Log" node from Logic Nodes
2. Connect it after any node you want to inspect
3. Connect the value you want to log to the value input
4. Run the script and check the console for the logged values

### Visual Execution

When running your script:
1. Active connections are highlighted
2. The current execution path is shown
3. You can see which branch is taken

### Breakpoint Node

1. Add a "Breakpoint" node where you want to pause execution
2. Run the script
3. Execution will pause at the breakpoint
4. Examine values and step through execution

## Next Steps

Now that you understand the basics of Visual Scripting, try these projects:

1. **Player Controller**: Create a script that moves an object with WASD keys
2. **Collectible System**: Make objects that disappear when clicked and add to a score
3. **Day/Night Cycle**: Create a script that gradually changes lighting over time

### Advanced Topics

Once you're comfortable with the basics, explore these advanced topics:

- [Advanced Visual Scripting](./AdvancedVisualScripting.md)
- [Character Control with Visual Scripting](./CharacterControlScripting.md)
- [Visual Scripting with Physics](./PhysicsScripting.md)

### Related Tutorials

- [Character Model Manager](./CharacterModelManager.md)
- [Basic Game Object Tutorial](./BasicObjectManipulation.md)
- [Creating UI with Visual Scripting](./UIVisualScripting.md)

---

Congratulations! You now understand the basics of Visual Scripting in GameStuAI Engine. With practice, you'll be able to create complex game behaviors without writing a single line of code. 