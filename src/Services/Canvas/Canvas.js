import { CoreSystem } from './Core-System.js';
import { ObserverSystem } from './Observer-System.js';
import { MaterialSystem } from './Material-System.js';
import { MeshSystem } from './Mesh-System.js';
import { LightSystem } from './Light-System.js';
import { CameraSystem } from './Camera-System.js';
import { ParticleSystem } from './Particle-System.js';
import { AnimationSystem } from './Animation-System.js';
import { BoneSystem } from './Bone-System.js';
import { PhysicsSystem } from './Physics-System.js';
import { ControlsSystem } from './Controls-System.js';

export class Canvas {
  constructor(selector) {
    this.isReady = false;
    this.commandQueue = [];
    
    this.core = new CoreSystem(selector);
    this.registry = new Map();
    
    this._initialize();
  }

  async _initialize() {
    try {
      await this.core.init();
      
      this.core.createScene('default');
      this.scene = this.core.activeScene;

      this.observer = new ObserverSystem();
      this.physics = new PhysicsSystem();

      this.materials = new MaterialSystem(this.scene);
      this.meshes = new MeshSystem(this.scene, this.materials, this.physics);
      this.lights = new LightSystem(this.scene);
      
      this.cameras = new CameraSystem(this.scene, this.core.canvas);
      this.controls = new ControlsSystem(this.scene, this.core.canvas);
      
      this.particles = new ParticleSystem(this.scene, this.registry);
      this.animations = new AnimationSystem(this.scene, this.registry);
      this.bones = new BoneSystem(this.scene, this.registry);

      this.core.startLoop(this.observer);
      
      this.isReady = true;
      this._flushQueue();
      
    } catch (err) {
      console.error("Canvas: Initialization failed", err);
    }
  }

  _flushQueue() {
      while(this.commandQueue.length > 0) {
          const cmd = this.commandQueue.shift();
          if (typeof this[cmd.method] === 'function') {
              this[cmd.method](...cmd.args);
          }
      }
  }

  _enqueue(method, args) {
      this.commandQueue.push({ method, args });
      return this;
  }

  debugger(show = true) {
    if (!this.isReady) return this._enqueue('debugger', [show]);
    
    if (show) {
      this.scene.debugLayer.show({ embedMode: true, overlay: true });
    } else {
      this.scene.debugLayer.hide();
    }
    return this;
  }

  add(config) {
    if (!this.isReady) return this._enqueue('add', [config]);

    let { type, name, options } = config;
    options = options || {};
    let entity;
    type = type.toLowerCase();

    switch (type) {
        case 'camera':
        case 'universal':
        case 'arc':
        case 'follow':
        case 'orthographic':
            const camType = (type === 'camera') ? (options.type || 'arc') : type;
            entity = this.cameras.create(name, camType, options, this.registry);
            break;
        case 'light':
        case 'point':
        case 'directional':
        case 'spot':
        case 'hemispheric':
             const lightType = (type === 'light') ? (options.type || 'hemispheric') : type;
            entity = this.lights.create(name, lightType, options);
            break;
        case 'particle':
            entity = this.particles.create(name, options);
            break;
        case 'bone':
        case 'skeleton':
            entity = this.bones.create(name, options);
            break;
        case 'ik':
        case 'ikcontroller':
            entity = this.bones.createIKController(name, options);
            break;
        default:
            entity = this.meshes.create(name, type, options, this.registry);
            break;
    }

    if (entity) {
        const regName = entity.name || name;
        this.registry.set(regName, entity);
    }
    return this;
  }

  get(name) {
    if (!this.isReady) {
        console.warn(`Canvas: .get('${name}') called before initialization complete.`);
        return undefined;
    }
    return this.registry.get(name);
  }

  remove(name) {
    if (!this.isReady) return this._enqueue('remove', [name]);

    const entity = this.registry.get(name);
    if (entity) {
        if (entity.dispose) entity.dispose();
        this.registry.delete(name);
    }
    return this;
  }
  
  animate(name, animations) {
      if (!this.isReady) return this._enqueue('animate', [name, animations]);
      this.animations.animate(name, animations);
      return this;
  }

  update(name, options) {
    if (!this.isReady) return this._enqueue('update', [name, options]);

    const entity = this.registry.get(name);
    if (entity) {
        if (entity instanceof BABYLON.AbstractMesh) {
             if(this.meshes.update) this.meshes.update(entity, options);
        } else if (entity instanceof BABYLON.Light) {
             if(this.lights.update) this.lights.update(entity, options);
        } else if (entity instanceof BABYLON.Camera) {
             if(this.cameras.update) this.cameras.update(entity, options);
        }
    }
    return this;
  }

  switchScene(name) {
    if (!this.isReady) return this._enqueue('switchScene', [name]);

    this.core.switchScene(name);
    this.scene = this.core.activeScene;
    this._updateSystemsScene(this.scene);
    return this;
  }
  
  _updateSystemsScene(scene) {
    if (this.materials) this.materials.scene = scene;
    if (this.meshes) this.meshes.scene = scene;
    if (this.lights) this.lights.scene = scene;
    if (this.cameras) this.cameras.scene = scene;
    if (this.particles) this.particles.scene = scene;
    if (this.animations) this.animations.scene = scene;
    if (this.bones) this.bones.scene = scene;
    if (this.controls) this.controls.scene = scene;
  }

  async loadScene(name, sceneName) {
    if (!this.isReady) {
         await new Promise(resolve => {
             const check = setInterval(() => {
                 if (this.isReady) { clearInterval(check); resolve(); }
             }, 10);
         });
    }

    const scene = this.core.createScene(name);
    
    // BACKUP current context
    const previousState = {
        scene: this.scene,
        materials: this.materials,
        meshes: this.meshes,
        lights: this.lights,
        cameras: this.cameras,
        particles: this.particles,
        animations: this.animations,
        bones: this.bones,
        controls: this.controls
    };

    // CREATE context for new scene
    const newMaterials = new MaterialSystem(scene);
    const newSystems = {
        materials: newMaterials,
        meshes: new MeshSystem(scene, newMaterials, this.physics),
        lights: new LightSystem(scene),
        cameras: new CameraSystem(scene, this.core.canvas),
        particles: new ParticleSystem(scene, this.registry),
        animations: new AnimationSystem(scene, this.registry),
        bones: new BoneSystem(scene, this.registry),
        controls: new ControlsSystem(scene, this.core.canvas)
    };

    // SWITCH to new context so canvas.add() works on the new scene
    this.scene = scene;
    this.materials = newSystems.materials;
    this.meshes = newSystems.meshes;
    this.lights = newSystems.lights;
    this.cameras = newSystems.cameras;
    this.particles = newSystems.particles;
    this.animations = newSystems.animations;
    this.bones = newSystems.bones;
    this.controls = newSystems.controls;
    
    try {
        const module = await import(`./Scenes/${sceneName}.js`);
        const SceneClass = module.default || module[sceneName];
        if (SceneClass) {
            const sceneInstance = new SceneClass(this, newSystems);
            await sceneInstance.create(scene);
        }
    } catch (e) {
        console.error(`Canvas: Could not load scene module Scenes/${sceneName}.js`, e);
    } finally {
        // RESTORE context to what it was before loadScene
        this.scene = previousState.scene;
        this.materials = previousState.materials;
        this.meshes = previousState.meshes;
        this.lights = previousState.lights;
        this.cameras = previousState.cameras;
        this.particles = previousState.particles;
        this.animations = previousState.animations;
        this.bones = previousState.bones;
        this.controls = previousState.controls;
    }
    
    return this;
  }

  async enablePhysics(gravity = {x:0, y:-9.81, z:0}) {
    if (!this.isReady) return this._enqueue('enablePhysics', [gravity]);
    
    if (this.physics) {
        await this.physics.initialize();
        if (this.physics.havok) {
            const havokPlugin = new BABYLON.HavokPlugin(true, this.physics.havok);
            this.scene.enablePhysics(new BABYLON.Vector3(gravity.x, gravity.y, gravity.z), havokPlugin);
        }
    }
    return this;
  }

  dispose() {
    this.core.dispose();
    this.registry.forEach(e => e.dispose && e.dispose());
    this.registry.clear();
  }
}