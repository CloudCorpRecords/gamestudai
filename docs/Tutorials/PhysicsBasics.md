# Physics Simulation in GameStuAI Engine

This tutorial will teach you how to use the advanced physics system in GameStuAI Engine, which is inspired by Unreal Engine's powerful physics capabilities.

## Overview

GameStuAI Engine includes a robust physics simulation system powered by Cannon.js with an interface and feature set similar to Unreal Engine. This allows you to create realistic physical behaviors for objects in your game, including:

- Realistic collision detection and response
- Various material types with different physical properties
- Multiple collision shape types for accurate simulation
- Different body types for different simulation needs
- Constraints for creating complex mechanical setups

## Getting Started with Physics

### Enabling Physics for an Object

1. Create or select an object in the Object Placement tool
2. In the Properties Panel, find the "Physics" section
3. Check the "Enable Physics" checkbox to enable physics for the object
4. Configure the physics properties as needed

### Understanding Body Types

GameStuAI offers four body types inspired by Unreal Engine:

- **Static**: Immovable objects that don't react to forces (like terrain, buildings)
- **Dynamic**: Fully simulated objects that respond to gravity and forces
- **Kinematic**: User-controlled objects that can affect other physics objects but aren't affected by forces themselves
- **Simulated**: Special type for character controllers with physical responses

Choose the appropriate body type based on how you want your object to behave in the game.

## Physics Materials

Physics materials define how objects interact when they collide. GameStuAI includes several predefined materials inspired by Unreal Engine:

- **Default**: Balanced properties for general use
- **Metal**: Heavy with low friction and moderate bounce
- **Wood**: Medium weight with good friction and low bounce
- **Concrete**: Heavy with high friction and very low bounce
- **Plastic**: Light with medium friction and bounce
- **Rubber**: Medium weight with high friction and very high bounce
- **Glass**: Heavy with low friction and moderate bounce
- **Ice**: Medium weight with very low friction
- **Water**: Medium weight with low friction and no bounce
- **Fabric**: Very light with high friction and low bounce
- **Sponge**: Extremely light with high friction and low bounce

### Material Properties

Each material defines these key properties:

- **Friction**: How much objects resist sliding against each other (0-1)
- **Restitution** (Bounciness): How much objects bounce off each other (0-1)
- **Density**: How heavy the material is relative to its size

## Collision Shapes

For accurate collision detection, you can choose from various collision shape types:

- **Box**: Simple rectangular shape (best for basic rectangular objects)
- **Sphere**: Perfectly round shape (best for balls, round objects)
- **Cylinder**: Cylindrical shape (for pipes, columns, etc.)
- **Capsule**: Cylinder with rounded ends (great for character controllers)
- **Convex Hull**: Simplified convex shape that wraps the object (good for irregular shapes)
- **Compound**: Multiple shapes combined (best for complex objects)
- **Trimesh**: Detailed mesh-based collision (highest accuracy but most performance-intensive)

Choose simpler shapes when possible for better performance.

## Advanced Physics Properties

### Mass

Mass determines how heavy an object is and affects its response to forces. Higher mass objects require more force to move and have more momentum.

### Friction

Friction determines how much objects resist sliding against each other. A value of 0 means no friction (like ice), while 1 means maximum friction.

### Bounciness (Restitution)

Bounciness determines how much objects bounce when they collide. A value of 0 means no bounce, while 1 means perfect bounce (like a super-bouncy ball).

### Damping

- **Linear Damping**: Reduces an object's linear velocity over time (like air resistance)
- **Angular Damping**: Reduces an object's rotational velocity over time

### Fixed Rotation

When enabled, the object won't rotate due to physics forces, which can be useful for character controllers or objects that should stay upright.

### Trigger

When enabled, the object becomes a "trigger" that detects collisions but doesn't physically respond to them. This is useful for trigger zones and detecting when objects enter certain areas.

## Tutorial: Creating a Physics-Based Marble Run

Let's build a simple marble run to demonstrate the physics system:

1. **Create the Base**:
   - Add a large static cube as the base
   - Enable physics with "Static" body type and "Wood" material

2. **Create Ramps**:
   - Add several elongated cubes at angles to serve as ramps
   - Enable physics with "Static" body type and "Wood" material
   - Position them to create a path for marbles to roll down

3. **Add Obstacles**:
   - Add cylinders and boxes as obstacles
   - Enable physics with "Static" body type
   - Try different materials to see how they affect the marbles

4. **Create Marbles**:
   - Add sphere objects to serve as marbles
   - Enable physics with "Dynamic" body type
   - Try different materials (metal, glass, rubber) to see how they roll differently
   - Place them at the top of your ramp

5. **Run the Simulation**:
   - Press Play to see your marbles roll down the ramp
   - Observe how different materials and shapes interact
   - Make adjustments to create an interesting path

## Physics Debugging

When working with physics, it can be helpful to visualize the collision shapes:

1. Green wireframes appear around physics-enabled objects showing their collision shapes
2. These wireframes help you understand how the physics system "sees" your objects

## Performance Tips

Physics simulation can be resource-intensive. Here are some tips for optimal performance:

1. Use simpler collision shapes when possible (boxes and spheres are faster than trimeshes)
2. Limit the number of dynamic physics objects in your scene
3. Use "Sleep" settings to make inactive objects stop simulating
4. For distant or less important objects, use simplified physics settings
5. Group small objects together when appropriate

## Advanced: Physics Constraints

For advanced setups like doors, hinges, or chains, you can use physics constraints. These will be covered in the Advanced Physics tutorial.

## Next Steps

Now that you understand the basics of the physics system, try:

- Creating a physics-based puzzle game
- Building a vehicle with the physics system
- Experimenting with different materials and shapes to see how they interact
- Exploring the Visual Scripting nodes for physics interactions

## Related Tutorials

- [Advanced Physics: Constraints and Joints](./AdvancedPhysics.md)
- [Visual Scripting with Physics](./PhysicsScripting.md)
- [Creating a Physics-Based Game](./PhysicsGame.md)

Happy physics simulating! 