export class CameraSystem {
  constructor(scene, canvasDOM) {
    this.scene = scene;
    this.canvasDOM = canvasDOM;
  }

  create(name, type, opts, registry) {
    let camera;
    const pos = opts.position ? new BABYLON.Vector3(opts.position.x, opts.position.y, opts.position.z) : new BABYLON.Vector3(0, 5, -10);
    const target = opts.target ? new BABYLON.Vector3(opts.target.x, opts.target.y, opts.target.z) : BABYLON.Vector3.Zero();

    switch (type) {
      case '2d':
      case 'orthographic':
        camera = new BABYLON.FreeCamera(name, new BABYLON.Vector3(0, 0, -10), this.scene);
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        const size = opts.orthoSize || 5;
        camera.orthoTop = size;
        camera.orthoBottom = -size;
        camera.orthoLeft = -size;
        camera.orthoRight = size;
        break;
      case 'universal':
        camera = new BABYLON.UniversalCamera(name, pos, this.scene);
        camera.setTarget(target);
        break;
      case 'follow':
        camera = new BABYLON.FollowCamera(name, pos, this.scene);
        if (opts.lockedTarget) {
          const t = registry.get(opts.lockedTarget);
          if (t) camera.lockedTarget = t;
        }
        camera.radius = opts.radius ?? 10;
        camera.heightOffset = opts.heightOffset ?? 4;
        camera.rotationOffset = opts.rotationOffset ?? 0;
        camera.cameraAcceleration = opts.cameraAcceleration ?? 0.05;
        camera.maxCameraSpeed = opts.maxCameraSpeed ?? 20;
        break;
      case 'arc':
      case 'camera':
      default:
        camera = new BABYLON.ArcRotateCamera(name, opts.alpha ?? 1.57, opts.beta ?? 1.2, opts.radius ?? 10, target, this.scene);
        break;
    }

    if (opts.parent) {
        const parent = registry.get(opts.parent);
        if (parent) camera.parent = parent;
    }

    // FIX: Respect the attachControl option (defaulting to true if undefined)
    if (opts.attachControl !== false) {
        camera.attachControl(this.canvasDOM, true);
    }
    
    return camera;
  }
  
  update(camera, opts) {
      if (opts.position) camera.position = new BABYLON.Vector3(opts.position.x, opts.position.y, opts.position.z);
      if (opts.target && camera.setTarget) camera.setTarget(new BABYLON.Vector3(opts.target.x, opts.target.y, opts.target.z));
      if (opts.alpha !== undefined) camera.alpha = opts.alpha;
      if (opts.beta !== undefined) camera.beta = opts.beta;
      if (opts.radius !== undefined) camera.radius = opts.radius;
  }
}