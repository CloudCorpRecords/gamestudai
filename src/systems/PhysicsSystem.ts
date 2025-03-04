import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';

// Physics material presets similar to Unreal Engine
export enum PhysicsMaterial {
  DEFAULT = 'default',
  METAL = 'metal',
  WOOD = 'wood',
  CONCRETE = 'concrete',
  PLASTIC = 'plastic',
  RUBBER = 'rubber',
  GLASS = 'glass',
  ICE = 'ice',
  WATER = 'water',
  FABRIC = 'fabric',
  SPONGE = 'sponge'
}

// Material properties mapping (similar to Unreal's physical materials)
export const MATERIAL_PROPERTIES: Record<PhysicsMaterial, {
  friction: number;
  restitution: number;
  density: number;
  description: string;
}> = {
  [PhysicsMaterial.DEFAULT]: { 
    friction: 0.3, 
    restitution: 0.3, 
    density: 1.0, 
    description: 'Default material with balanced properties' 
  },
  [PhysicsMaterial.METAL]: { 
    friction: 0.2, 
    restitution: 0.2, 
    density: 7.8, 
    description: 'Heavy with low friction and bouncy like metal' 
  },
  [PhysicsMaterial.WOOD]: { 
    friction: 0.5, 
    restitution: 0.2, 
    density: 0.7, 
    description: 'Medium weight with good friction like wood' 
  },
  [PhysicsMaterial.CONCRETE]: { 
    friction: 0.7, 
    restitution: 0.1, 
    density: 2.4, 
    description: 'Heavy with high friction like concrete' 
  },
  [PhysicsMaterial.PLASTIC]: { 
    friction: 0.3, 
    restitution: 0.4, 
    density: 0.9, 
    description: 'Light with medium bounce like plastic' 
  },
  [PhysicsMaterial.RUBBER]: { 
    friction: 0.9, 
    restitution: 0.8, 
    density: 1.1, 
    description: 'High friction and very bouncy like rubber' 
  },
  [PhysicsMaterial.GLASS]: { 
    friction: 0.1, 
    restitution: 0.3, 
    density: 2.5, 
    description: 'Heavy with low friction like glass' 
  },
  [PhysicsMaterial.ICE]: { 
    friction: 0.02, 
    restitution: 0.3, 
    density: 0.9, 
    description: 'Very low friction like ice' 
  },
  [PhysicsMaterial.WATER]: { 
    friction: 0.05, 
    restitution: 0.0, 
    density: 1.0, 
    description: 'Low friction and no bounce like water' 
  },
  [PhysicsMaterial.FABRIC]: { 
    friction: 0.8, 
    restitution: 0.1, 
    density: 0.3, 
    description: 'Light with high friction like fabric' 
  },
  [PhysicsMaterial.SPONGE]: { 
    friction: 0.7, 
    restitution: 0.2, 
    density: 0.1, 
    description: 'Very light with high friction and low bounce like sponge' 
  }
};

// Collision shapes similar to Unreal Engine
export enum CollisionShape {
  BOX = 'box',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  CAPSULE = 'capsule',
  CONVEX_HULL = 'convex',
  COMPOUND = 'compound',
  TRIMESH = 'trimesh'
}

// Physics body types (similar to Unreal Engine)
export enum BodyType {
  STATIC = 'static',           // Non-moving objects (like terrain/walls)
  DYNAMIC = 'dynamic',         // Fully physics-driven objects
  KINEMATIC = 'kinematic',     // Manually moved objects that affect other physics objects
  SIMULATED = 'simulated'      // Special type for character controllers with physics response
}

// Physics constraints (similar to Unreal Engine constraints)
export enum ConstraintType {
  HINGE = 'hinge',             // Door-like rotation
  POINT_TO_POINT = 'p2p',      // Ball joint / ball-and-socket
  DISTANCE = 'distance',       // Fixed distance between bodies
  LOCK = 'lock',               // Locked position between bodies
  SPRING = 'spring'            // Spring-like behavior
}

// Physical properties for an object
export interface PhysicalProperties {
  enabled: boolean;
  bodyType: BodyType;
  material: PhysicsMaterial;
  shape: CollisionShape;
  mass: number;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
  fixedRotation?: boolean;
  isTrigger?: boolean;
  collisionGroup?: number;
  collisionMask?: number;
  customProps?: Record<string, any>;
}

// Default physical properties
export const DEFAULT_PHYSICAL_PROPERTIES: PhysicalProperties = {
  enabled: true,
  bodyType: BodyType.DYNAMIC,
  material: PhysicsMaterial.DEFAULT,
  shape: CollisionShape.BOX,
  mass: 1,
  friction: 0.3,
  restitution: 0.3,
  linearDamping: 0.1,
  angularDamping: 0.1,
  fixedRotation: false,
  isTrigger: false,
  collisionGroup: 1,
  collisionMask: -1
};

// Main physics system class
export class PhysicsSystem {
  world: CANNON.World;
  bodies: Map<string, CANNON.Body>;
  constraints: Map<string, CANNON.Constraint>;
  materials: Map<PhysicsMaterial, CANNON.Material>;
  contactMaterials: Map<string, CANNON.ContactMaterial>;
  debug: boolean;
  
  constructor(gravity = new CANNON.Vec3(0, -9.82, 0), debug = false) {
    this.world = new CANNON.World();
    this.world.gravity.copy(gravity);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.solver.iterations = 10; // Higher for better accuracy, similar to Unreal
    this.world.allowSleep = true; // Performance optimization
    
    this.bodies = new Map();
    this.constraints = new Map();
    this.materials = new Map();
    this.contactMaterials = new Map();
    this.debug = debug;
    
    // Initialize default materials
    this.initMaterials();
  }
  
  setGravity(x: number, y: number, z: number) {
    this.world.gravity.set(x, y, z);
  }
  
  update(deltaTime: number) {
    this.world.step(1/60, deltaTime, 3);
  }
  
  initMaterials() {
    // Create all predefined materials
    Object.keys(MATERIAL_PROPERTIES).forEach(material => {
      const materialName = material as PhysicsMaterial;
      const props = MATERIAL_PROPERTIES[materialName];
      const cannonMaterial = new CANNON.Material(materialName);
      this.materials.set(materialName, cannonMaterial);
    });
    
    // Create contact materials for common interactions
    this.createContactMaterials();
  }
  
  createContactMaterials() {
    // Create contact materials for each possible material combination
    const materialNames = Object.keys(MATERIAL_PROPERTIES) as PhysicsMaterial[];
    
    for (let i = 0; i < materialNames.length; i++) {
      for (let j = i; j < materialNames.length; j++) {
        const mat1 = materialNames[i];
        const mat2 = materialNames[j];
        const props1 = MATERIAL_PROPERTIES[mat1];
        const props2 = MATERIAL_PROPERTIES[mat2];
        
        const contactKey = `${mat1}_${mat2}`;
        const cannonMat1 = this.materials.get(mat1)!;
        const cannonMat2 = this.materials.get(mat2)!;
        
        // Compute combined properties (similar to how Unreal combines physical materials)
        const friction = Math.sqrt(props1.friction * props2.friction);
        const restitution = Math.max(props1.restitution, props2.restitution);
        
        const contactMaterial = new CANNON.ContactMaterial(cannonMat1, cannonMat2, {
          friction,
          restitution
        });
        
        this.world.addContactMaterial(contactMaterial);
        this.contactMaterials.set(contactKey, contactMaterial);
      }
    }
  }
  
  createBody(id: string, threeObj: THREE.Object3D, properties: PhysicalProperties): CANNON.Body {
    if (this.bodies.has(id)) {
      throw new Error(`Body with id ${id} already exists`);
    }
    
    // Get the appropriate material
    const material = this.materials.get(properties.material) || this.materials.get(PhysicsMaterial.DEFAULT)!;
    
    // Create body with appropriate type
    const bodyOptions: CANNON.BodyOptions = {
      mass: properties.bodyType === BodyType.STATIC ? 0 : (properties.mass || 1),
      material,
      type: this.getCannonBodyType(properties.bodyType),
      linearDamping: properties.linearDamping ?? 0.1,
      angularDamping: properties.angularDamping ?? 0.1,
      fixedRotation: properties.fixedRotation ?? false,
      collisionFilterGroup: properties.collisionGroup ?? 1,
      collisionFilterMask: properties.collisionMask ?? -1,
      isTrigger: properties.isTrigger ?? false
    };
    
    const body = new CANNON.Body(bodyOptions);
    
    // Set the position and rotation from the Three.js object
    const position = new CANNON.Vec3();
    position.copy(threeObj.position as any);
    body.position.copy(position);
    
    // Get quaternion from Three.js object
    const quaternion = new CANNON.Quaternion();
    quaternion.copy(threeObj.quaternion as any);
    body.quaternion.copy(quaternion);
    
    // Add appropriate collision shape
    this.addShapeToBody(body, threeObj, properties.shape);
    
    // Add the body to the world and our internal map
    this.world.addBody(body);
    this.bodies.set(id, body);
    
    return body;
  }
  
  // Helper for mapping BodyType to CANNON values
  private getCannonBodyType(bodyType: BodyType): CANNON.BodyType {
    switch (bodyType) {
      case BodyType.STATIC: return CANNON.BODY_TYPES.STATIC;
      case BodyType.DYNAMIC: return CANNON.BODY_TYPES.DYNAMIC;
      case BodyType.KINEMATIC: return CANNON.BODY_TYPES.KINEMATIC;
      case BodyType.SIMULATED: return CANNON.BODY_TYPES.DYNAMIC; // We'll handle simulated specially
      default: return CANNON.BODY_TYPES.DYNAMIC;
    }
  }
  
  // Add appropriate shape to the body based on object geometry
  private addShapeToBody(body: CANNON.Body, threeObj: THREE.Object3D, shapeType: CollisionShape) {
    switch (shapeType) {
      case CollisionShape.BOX:
        this.addBoxShape(body, threeObj);
        break;
      case CollisionShape.SPHERE:
        this.addSphereShape(body, threeObj);
        break;
      case CollisionShape.CYLINDER:
        this.addCylinderShape(body, threeObj);
        break;
      case CollisionShape.CAPSULE:
        this.addCapsuleShape(body, threeObj);
        break;
      case CollisionShape.CONVEX_HULL:
        this.addConvexShape(body, threeObj);
        break;
      case CollisionShape.TRIMESH:
        this.addTrimeshShape(body, threeObj);
        break;
      case CollisionShape.COMPOUND:
        this.addCompoundShape(body, threeObj);
        break;
      default:
        this.addBoxShape(body, threeObj);
    }
  }
  
  // Get the dimensions of an object and its children
  private getObjectDimensions(obj: THREE.Object3D): { 
    size: THREE.Vector3, 
    center: THREE.Vector3 
  } {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // Get the position relative to the object
    center.sub(obj.position);
    
    return { size, center };
  }
  
  private addBoxShape(body: CANNON.Body, obj: THREE.Object3D) {
    const { size, center } = this.getObjectDimensions(obj);
    const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
    const shape = new CANNON.Box(halfExtents);
    
    // Account for offset center
    const offsetPosition = new CANNON.Vec3(center.x, center.y, center.z);
    body.addShape(shape, offsetPosition);
  }
  
  private addSphereShape(body: CANNON.Body, obj: THREE.Object3D) {
    const { size } = this.getObjectDimensions(obj);
    // Use the largest dimension as radius
    const radius = Math.max(size.x, size.y, size.z) / 2;
    const shape = new CANNON.Sphere(radius);
    body.addShape(shape);
  }
  
  private addCylinderShape(body: CANNON.Body, obj: THREE.Object3D) {
    const { size, center } = this.getObjectDimensions(obj);
    // Default to Y-axis cylinder
    const radiusTop = size.x / 2;
    const radiusBottom = size.x / 2;
    const height = size.y;
    const numSegments = 16; // Higher for better accuracy
    
    const shape = new CANNON.Cylinder(
      radiusTop, 
      radiusBottom, 
      height, 
      numSegments
    );
    
    // Rotate the cylinder to align with Y-axis (Cannon.js cylinders are along Z by default)
    const quat = new CANNON.Quaternion();
    quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    
    // Account for offset center
    const offsetPosition = new CANNON.Vec3(center.x, center.y, center.z);
    body.addShape(shape, offsetPosition, quat);
  }
  
  private addCapsuleShape(body: CANNON.Body, obj: THREE.Object3D) {
    // Capsule is implemented as a cylinder with spheres at both ends
    const { size, center } = this.getObjectDimensions(obj);
    
    // Dimensions
    const radius = size.x / 2;
    const height = size.y - size.x; // Subtract diameter from height for actual cylinder part
    
    // Create cylinder for the middle
    if (height > 0) {
      const cylinderShape = new CANNON.Cylinder(radius, radius, height, 16);
      const quat = new CANNON.Quaternion();
      quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
      body.addShape(cylinderShape, new CANNON.Vec3(center.x, center.y, center.z), quat);
    }
    
    // Create spheres for the caps
    const sphereShape1 = new CANNON.Sphere(radius);
    const sphereShape2 = new CANNON.Sphere(radius);
    const sphereOffset = height / 2;
    
    body.addShape(
      sphereShape1, 
      new CANNON.Vec3(center.x, center.y + sphereOffset, center.z)
    );
    body.addShape(
      sphereShape2, 
      new CANNON.Vec3(center.x, center.y - sphereOffset, center.z)
    );
  }
  
  private addConvexShape(body: CANNON.Body, obj: THREE.Object3D) {
    // Find a mesh in the object or its children
    let mesh: THREE.Mesh | null = null;
    
    if (obj instanceof THREE.Mesh) {
      mesh = obj;
    } else {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && !mesh) {
          mesh = child;
        }
      });
    }
    
    if (!mesh || !mesh.geometry) {
      // Fallback to box if no mesh found
      this.addBoxShape(body, obj);
      return;
    }
    
    // Create convex hull
    let vertices: number[] = [];
    const positions = mesh.geometry.getAttribute('position');
    
    // Extract vertices
    for (let i = 0; i < positions.count; i++) {
      vertices.push(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
    }
    
    // Create shape
    const shape = new CANNON.ConvexPolyhedron({
      vertices: vertices.map((v, i) => 
        new CANNON.Vec3(
          vertices[i * 3], 
          vertices[i * 3 + 1], 
          vertices[i * 3 + 2]
        )
      ),
      faces: []
    });
    
    body.addShape(shape);
  }
  
  private addTrimeshShape(body: CANNON.Body, obj: THREE.Object3D) {
    // Find a mesh in the object or its children
    let mesh: THREE.Mesh | null = null;
    
    if (obj instanceof THREE.Mesh) {
      mesh = obj;
    } else {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && !mesh) {
          mesh = child;
        }
      });
    }
    
    if (!mesh || !mesh.geometry) {
      // Fallback to box if no mesh found
      this.addBoxShape(body, obj);
      return;
    }
    
    // Create tri-mesh
    const vertices: number[] = [];
    const indices: number[] = [];
    
    // Get vertices
    const positions = mesh.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      vertices.push(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
    }
    
    // Get indices - if available
    if (mesh.geometry.index) {
      const meshIndices = mesh.geometry.index;
      for (let i = 0; i < meshIndices.count; i++) {
        indices.push(meshIndices.getX(i));
      }
    } else {
      // No index buffer, create one (assume mesh is set of triangles)
      for (let i = 0; i < positions.count; i++) {
        indices.push(i);
      }
    }
    
    // Create shape
    const shape = new CANNON.Trimesh(vertices, indices);
    body.addShape(shape);
  }
  
  private addCompoundShape(body: CANNON.Body, obj: THREE.Object3D) {
    // For compound shapes, we add a shape for each child mesh
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        // Use bounding box for simple compound shapes
        const box = new THREE.Box3().setFromObject(child);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // Create position relative to parent
        const localPosition = center.clone().sub(obj.position);
        
        // Add a box shape at the correct local position
        const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
        const shape = new CANNON.Box(halfExtents);
        
        // Convert Three.js vector to Cannon.js vector
        const position = new CANNON.Vec3(
          localPosition.x,
          localPosition.y,
          localPosition.z
        );
        
        body.addShape(shape, position);
      }
    });
    
    // If no shapes were added, fall back to a simple box
    if (body.shapes.length === 0) {
      this.addBoxShape(body, obj);
    }
  }
  
  removeBody(id: string) {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(id);
    }
  }
  
  createConstraint(id: string, type: ConstraintType, bodyA: CANNON.Body, bodyB: CANNON.Body, options: any) {
    let constraint: CANNON.Constraint;
    
    // Create the appropriate constraint type
    switch (type) {
      case ConstraintType.HINGE:
        constraint = new CANNON.HingeConstraint(bodyA, bodyB, options);
        break;
      case ConstraintType.POINT_TO_POINT:
        constraint = new CANNON.PointToPointConstraint(
          bodyA, 
          options.pivotA || new CANNON.Vec3(), 
          bodyB, 
          options.pivotB || new CANNON.Vec3(), 
          options.maxForce || undefined
        );
        break;
      case ConstraintType.DISTANCE:
        constraint = new CANNON.DistanceConstraint(
          bodyA, 
          bodyB, 
          options.distance || undefined, 
          options.maxForce || undefined
        );
        break;
      case ConstraintType.LOCK:
        constraint = new CANNON.LockConstraint(
          bodyA, 
          bodyB, 
          options
        );
        break;
      case ConstraintType.SPRING:
        // Implementation specific to our needs
        // Create a spring force that's not a true constraint
        const spring = new CANNON.Spring(bodyA, bodyB, {
          localAnchorA: options.localAnchorA || new CANNON.Vec3(),
          localAnchorB: options.localAnchorB || new CANNON.Vec3(),
          restLength: options.restLength || 0,
          stiffness: options.stiffness || 50,
          damping: options.damping || 1,
        });
        
        // We'll need to apply the spring manually in each step
        const stepListener = () => {
          spring.applyForce();
        };
        
        this.world.addEventListener('postStep', stepListener);
        
        // Store the spring and the callback for later cleanup
        const customConstraint = {
          spring,
          stepListener,
          disable: () => {
            this.world.removeEventListener('postStep', stepListener);
          },
          enable: () => {
            this.world.addEventListener('postStep', stepListener);
          },
          update: (params: any) => {
            Object.assign(spring, params);
          }
        };
        
        this.constraints.set(id, customConstraint as any);
        return customConstraint;
      default:
        throw new Error(`Constraint type ${type} not supported`);
    }
    
    this.world.addConstraint(constraint);
    this.constraints.set(id, constraint);
    
    return constraint;
  }
  
  removeConstraint(id: string) {
    const constraint = this.constraints.get(id);
    if (!constraint) return;
    
    if ('disable' in constraint) {
      // Custom constraint (like spring)
      constraint.disable();
    } else {
      // Standard Cannon.js constraint
      this.world.removeConstraint(constraint);
    }
    
    this.constraints.delete(id);
  }
  
  rayTest(from: THREE.Vector3, to: THREE.Vector3): {
    hasHit: boolean,
    distance: number,
    hitPoint: THREE.Vector3,
    hitNormal: THREE.Vector3,
    hitBody: CANNON.Body | null
  } {
    const start = new CANNON.Vec3(from.x, from.y, from.z);
    const end = new CANNON.Vec3(to.x, to.y, to.z);
    
    // Create ray test callback
    const result: { hasHit: boolean, distance: number, hitPoint: THREE.Vector3, hitNormal: THREE.Vector3, hitBody: CANNON.Body | null } = {
      hasHit: false,
      distance: Infinity,
      hitPoint: new THREE.Vector3(),
      hitNormal: new THREE.Vector3(),
      hitBody: null
    };
    
    // Callback function for ray test
    const callback = (res: any) => {
      result.hasHit = true;
      result.hitBody = res.body;
      result.hitPoint.copy(res.hitPointWorld as any);
      result.hitNormal.copy(res.hitNormalWorld as any);
      
      // Calculate distance
      const hitVec = new THREE.Vector3(res.hitPointWorld.x, res.hitPointWorld.y, res.hitPointWorld.z);
      result.distance = from.distanceTo(hitVec);
    };
    
    // Perform the ray test
    this.world.rayTest(start, end, { callback });
    
    return result;
  }
  
  applyForce(bodyId: string, force: THREE.Vector3, worldPoint?: THREE.Vector3) {
    const body = this.bodies.get(bodyId);
    if (!body) return;
    
    const forceVec = new CANNON.Vec3(force.x, force.y, force.z);
    
    if (worldPoint) {
      const pointVec = new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z);
      body.applyForce(forceVec, pointVec);
    } else {
      body.applyForce(forceVec, body.position);
    }
  }
  
  applyImpulse(bodyId: string, impulse: THREE.Vector3, worldPoint?: THREE.Vector3) {
    const body = this.bodies.get(bodyId);
    if (!body) return;
    
    const impulseVec = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
    
    if (worldPoint) {
      const pointVec = new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z);
      body.applyImpulse(impulseVec, pointVec);
    } else {
      body.applyImpulse(impulseVec, body.position);
    }
  }
  
  // Enable or disable sleeping for a body
  setSleepState(bodyId: string, isSleeping: boolean) {
    const body = this.bodies.get(bodyId);
    if (!body) return;
    
    if (isSleeping) {
      body.sleep();
    } else {
      body.wakeUp();
    }
  }
  
  // Update the position and rotation of a Three.js object based on physics
  syncMeshWithBody(mesh: THREE.Object3D, bodyId: string) {
    const body = this.bodies.get(bodyId);
    if (!body) return;
    
    mesh.position.copy(body.position as any);
    mesh.quaternion.copy(body.quaternion as any);
  }
  
  // Clean up everything
  dispose() {
    this.bodies.clear();
    this.constraints.clear();
    this.materials.clear();
    this.contactMaterials.clear();
  }
}

// React hook for using the physics system in components
export function usePhysics(gravity = { x: 0, y: -9.82, z: 0 }, debug = false) {
  const [system] = useState(() => new PhysicsSystem(
    new CANNON.Vec3(gravity.x, gravity.y, gravity.z),
    debug
  ));
  
  useEffect(() => {
    return () => {
      system.dispose();
    };
  }, [system]);
  
  return system;
} 