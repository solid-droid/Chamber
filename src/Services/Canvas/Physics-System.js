// FIX: Robust import handling. 
// If using a module bundler, standard import is fine. 
// If using plain ES modules in browser without maps, this needs to be a URL.
// We'll keep the import but wrap the execution in a way that allows failure or fallbacks.
import HavokPhysics from "@babylonjs/havok";

export class PhysicsSystem {
  constructor() {
    this.havok = null;
  }

  async initialize() {
    try {
        // Try initialize Havok
        if (typeof HavokPhysics === 'function') {
            this.havok = await HavokPhysics({
                locateFile: () => './HavokPhysics.wasm' 
            });
        } else if (window.HavokPhysics) {
            // Fallback to global if loaded via script tag
            this.havok = await window.HavokPhysics();
        }
    } catch (e) {
        console.error("PhysicsSystem: Failed to initialize Havok.", e);
    }
  }

  add(mesh, options, scene) {
    if (!this.havok) {
        console.warn("PhysicsSystem: Havok not initialized. Cannot add physics body.");
        return null;
    }

    // Default to BOX
    let shapeType = BABYLON.PhysicsShapeType.BOX;

    // 1. Check for explicit shape in options
    if (options.shape) {
        shapeType = options.shape;
    } 
    // 2. Infer shape from mesh name
    else {
        const lowerName = mesh.name.toLowerCase();
        if (lowerName.includes("sphere")) {
            shapeType = BABYLON.PhysicsShapeType.SPHERE;
        } else if (lowerName.includes("cylinder")) {
            shapeType = BABYLON.PhysicsShapeType.CYLINDER;
        } else if (lowerName.includes("capsule")) {
            shapeType = BABYLON.PhysicsShapeType.CAPSULE;
        } else if (lowerName.includes("ground") || lowerName.includes("terrain")) {
            shapeType = BABYLON.PhysicsShapeType.BOX; 
        }
    }

    // Create the Physics Aggregate (Body + Shape)
    const aggregate = new BABYLON.PhysicsAggregate(
        mesh, 
        shapeType, 
        { 
            mass: options.mass ?? 0, 
            restitution: options.restitution ?? 0.0, 
            friction: options.friction ?? 0.5 
        }, 
        scene
    );

    return aggregate;
  }
}