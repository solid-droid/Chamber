export class MeshSystem {
  constructor(scene, materialSystem, physicsSystem = null) {
    this.scene = scene;
    this.materialSystem = materialSystem;
    this.physics = physicsSystem;
    
    // Bind creators to 'this'
    this.meshCreators = {
      group: (name) => new BABYLON.TransformNode(name, this.scene),
      model: (name, opts) => this._createModel(name, opts),
      instance: (name, opts, registry) => this._createInstance(name, opts, registry),
      lines: (name, opts) => this._createLines(name, opts),
      curve: (name, opts) => this._createLines(name, { ...opts, useSpline: true }),
      ribbon: (name, opts) => this._createRibbon(name, opts),
      surface: (name, opts) => this._createRibbon(name, opts),
      polygon: (name, opts) => this._createPolygon(name, opts),
      shape: (name, opts) => this._createPolygon(name, opts),
      plane: (name, opts) => BABYLON.MeshBuilder.CreatePlane(name, opts, this.scene),
      disc: (name, opts) => BABYLON.MeshBuilder.CreateDisc(name, opts, this.scene),
      ground: (name, opts) => BABYLON.MeshBuilder.CreateGround(name, opts, this.scene),
      box: (name, opts) => BABYLON.MeshBuilder.CreateBox(name, opts, this.scene),
      sphere: (name, opts) => BABYLON.MeshBuilder.CreateSphere(name, opts, this.scene),
      cylinder: (name, opts) => BABYLON.MeshBuilder.CreateCylinder(name, opts, this.scene),
      torus: (name, opts) => BABYLON.MeshBuilder.CreateTorus(name, opts, this.scene),
      capsule: (name, opts) => BABYLON.MeshBuilder.CreateCapsule(name, opts, this.scene),
    };
  }

  _createModel(name, opts) {
    const root = new BABYLON.TransformNode(name, this.scene);
    
    // FIX: Ensure SceneLoader exists
    if (BABYLON.SceneLoader) {
      const loadPromise = BABYLON.SceneLoader.ImportMeshAsync("", opts.rootUrl || "./", opts.fileName || "", this.scene);
      
      loadPromise.then((result) => {
        result.meshes.forEach(m => {
          // Only parent top-level meshes to avoid flattening hierarchy logic
          if (!m.parent) m.parent = root;
        });
        
        // FIX: Handle Animation Groups for Models
        if (result.animationGroups && result.animationGroups.length > 0) {
             // attach to root so user can access them? 
             root.animationGroups = result.animationGroups;
        }

        if (opts.onLoaded && typeof opts.onLoaded === 'function') {
          opts.onLoaded(root, result.meshes, result.particleSystems, result.skeletons, result.animationGroups);
        }
      }).catch(err => {
        console.error(`MeshSystem: Failed to load model ${name}`, err);
      });
    }
    return root;
  }

  _createInstance(name, opts, registry) {
    const source = registry.get(opts.source);
    if (source) {
       // Check if it's a Mesh (which has createInstance)
       if (source.createInstance) {
           return source.createInstance(name);
       } 
       // If it's a TransformNode or Group, we can't "Instance" it in the WebGL sense efficiently without checking children
       // Fallback: Clone
       if (source.clone) {
           return source.clone(name, null);
       }
    }
    console.warn(`MeshSystem: Instance source "${opts.source}" not found or invalid.`);
    return null;
  }

  _createLines(name, opts) {
    let points = (opts.points || []).map(p => new BABYLON.Vector3(p.x ?? 0, p.y ?? 0, p.z ?? 0));
    if (opts.useSpline && points.length > 1) {
      const tessellation = opts.tessellation || 20;
      const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, tessellation, opts.closed);
      points = catmullRom.getPoints();
    }
    return BABYLON.MeshBuilder.CreateLines(name, { points: points, updatable: true }, this.scene);
  }

  _createRibbon(name, opts) {
    if (opts.paths) {
      const pathArray = opts.paths.map(path => path.map(p => new BABYLON.Vector3(p.x ?? 0, p.y ?? 0, p.z ?? 0)));
      return BABYLON.MeshBuilder.CreateRibbon(name, {
        pathArray: pathArray,
        closeArray: opts.closeArray,
        closePath: opts.closePath,
        updatable: true
      }, this.scene);
    }
    return null;
  }

  _createPolygon(name, opts) {
    if (opts.points) {
      const shape = opts.points.map(p => new BABYLON.Vector3(p.x ?? 0, p.y ?? 0, p.z ?? 0));
      // FIX: Check for earcut globally
      if (!window.earcut) {
        console.error("MeshSystem: 'polygon' type requires Earcut.js library (window.earcut).");
        return null;
      }
      try {
        return BABYLON.MeshBuilder.CreatePolygon(name, { 
          shape: shape, 
          sideOrientation: BABYLON.Mesh.DOUBLESIDE, 
          updatable: true 
        }, this.scene, window.earcut);
      } catch (e) {
        console.error("MeshSystem: Error creating polygon", e);
      }
    }
    return null;
  }

  create(name, type, opts, registry) {
    let node = null;
    const lowerType = type.toLowerCase();

    if (this.meshCreators[lowerType]) {
      node = this.meshCreators[lowerType](name, opts, registry);
    }

    if (node) {
      // Ensure name is set if builder didn't set it correctly (sometimes builders use default names)
      if (node.name !== name) node.name = name;
        
      this._applyTransforms(node, opts, registry);
      this._applyProps(node, opts);
      this._applyActions(node, opts);
      this._applyHierarchy(node, opts, registry);
    }
    return node;
  }

  _applyTransforms(node, opts, registry) {
    if (opts.position) node.position = new BABYLON.Vector3(opts.position.x ?? 0, opts.position.y ?? 0, opts.position.z ?? 0);
    
    // Priority to Quaternion if provided, otherwise Euler angles
    if (opts.rotationQuaternion) {
        node.rotationQuaternion = new BABYLON.Quaternion(opts.rotationQuaternion.x, opts.rotationQuaternion.y, opts.rotationQuaternion.z, opts.rotationQuaternion.w);
    } else if (opts.rotation) {
        node.rotation = new BABYLON.Vector3(opts.rotation.x ?? 0, opts.rotation.y ?? 0, opts.rotation.z ?? 0);
    }

    if (opts.scaling) {
        if (typeof opts.scaling === 'number') {
             // Uniform scaling
             node.scaling = new BABYLON.Vector3(opts.scaling, opts.scaling, opts.scaling);
        } else {
             node.scaling = new BABYLON.Vector3(opts.scaling.x ?? 1, opts.scaling.y ?? 1, opts.scaling.z ?? 1);
        }
    }

    // LookAt functionality
    if (opts.lookAt) {
        if (typeof opts.lookAt === 'string' && registry) {
            const target = registry.get(opts.lookAt);
            if (target) node.lookAt(target.position);
        } else if (opts.lookAt.x !== undefined) {
            node.lookAt(new BABYLON.Vector3(opts.lookAt.x, opts.lookAt.y, opts.lookAt.z));
        }
    }
    
    return node;
  }

  _applyProps(node, opts) {
    const _parseColor = (c) => {
      if (!c) return new BABYLON.Color3(1, 1, 1);
      if (c instanceof BABYLON.Color3) return c;
      if (Array.isArray(c)) return new BABYLON.Color3(c[0] ?? 1, c[1] ?? 1, c[2] ?? 1);
      return new BABYLON.Color3(c.r ?? c.x ?? 1, c.g ?? c.y ?? 1, c.b ?? c.z ?? 1);
    }

    // General Node Props
    if (opts.enabled !== undefined) node.setEnabled(opts.enabled);
    if (opts.billboardMode !== undefined) node.billboardMode = opts.billboardMode;

    if (node instanceof BABYLON.AbstractMesh) {
      // Materials
      if (opts.material) {
        const matProps = { ...opts.material };
        ['albedoColor', 'diffuseColor', 'emissiveColor', 'specularColor'].forEach(prop => {
          if (matProps[prop]) matProps[prop] = _parseColor(matProps[prop]);
        });
        node.material = this.materialSystem.create(node.name + "_mat", matProps);
      } else if (opts.color) {
        node.material = this.materialSystem.create(node.name + "_col", { 
          type: 'standard', 
          diffuseColor: _parseColor(opts.color) 
        });
      }
      
      // Visibility & Rendering
      if (opts.visibility !== undefined) node.visibility = opts.visibility;
      if (opts.renderingGroupId !== undefined) node.renderingGroupId = opts.renderingGroupId;
      if (opts.layerMask !== undefined) node.layerMask = opts.layerMask;
      if (opts.isPickable !== undefined) node.isPickable = opts.isPickable;
      if (opts.checkCollisions !== undefined) node.checkCollisions = opts.checkCollisions;

      // Shadows
      if (opts.receiveShadows !== undefined) node.receiveShadows = opts.receiveShadows;
      if (opts.castShadows) {
        this.scene.lights.forEach(light => {
          // Safety check
          if (light.getShadowGenerator) {
              const generator = light.getShadowGenerator();
              if (generator) generator.addShadowCaster(node);
          }
        });
      }

      // Physics
      if (opts.physics && this.physics) {
        // We delay physics slightly to ensure node is in scene/world matrix computed
        // but typically synchronous is fine in Babylon if enabled
        this.physics.add(node, opts.physics, this.scene);
      }
    }
  }

  _applyActions(node, opts) {
    if (opts.onClick && node instanceof BABYLON.AbstractMesh) {
        if (!node.actionManager) {
            node.actionManager = new BABYLON.ActionManager(this.scene);
        }
        node.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                (evt) => opts.onClick(evt, node)
            )
        );
    }
  }

  _applyHierarchy(node, opts, registry) {
    if (opts.parent) {
      const parent = registry.get(opts.parent);
      if (parent) node.parent = parent;
    }
    if (opts.children && Array.isArray(opts.children)) {
      opts.children.forEach(childName => {
        const child = registry.get(childName);
        if (child) child.parent = node;
      });
    }
  }
}