export class LightSystem {
  constructor(scene) {
    this.scene = scene;
    this.shadowGenerators = {};
  }

  create(name, type, opts) {
    let light;
    const pos = opts.position ? new BABYLON.Vector3(opts.position.x, opts.position.y, opts.position.z) : new BABYLON.Vector3(0, 10, 0);
    const dir = opts.direction ? new BABYLON.Vector3(opts.direction.x, opts.direction.y, opts.direction.z) : new BABYLON.Vector3(0, -1, 0);

    switch(type?.toLowerCase()) {
      case 'directional': 
        light = new BABYLON.DirectionalLight(name, dir, this.scene);
        if (opts.castShadows) this._setupShadows(name, light, opts);
        break;
      case 'point': 
        light = new BABYLON.PointLight(name, pos, this.scene);
        break;
      case 'spot':
        light = new BABYLON.SpotLight(name, pos, dir, opts.angle ?? Math.PI/3, opts.exponent ?? 2, this.scene);
        if (opts.castShadows) this._setupShadows(name, light, opts);
        break;
      default: // Hemispheric
        light = new BABYLON.HemisphericLight(name, dir, this.scene);
    }

    if (opts.intensity !== undefined) light.intensity = opts.intensity;
    if (opts.range !== undefined) light.range = opts.range;
    if (opts.radius !== undefined) light.radius = opts.radius;

    // Color Support
    if (opts.color) light.diffuse = new BABYLON.Color3(opts.color.r, opts.color.g, opts.color.b);
    if (opts.specular) light.specular = new BABYLON.Color3(opts.specular.r, opts.specular.g, opts.specular.b);
    if (opts.groundColor && light instanceof BABYLON.HemisphericLight) {
        light.groundColor = new BABYLON.Color3(opts.groundColor.r, opts.groundColor.g, opts.groundColor.b);
    }

    return light;
  }

  _setupShadows(name, light, opts) {
     this.shadowGenerators[name] = new BABYLON.ShadowGenerator(opts.shadowMapSize || 1024, light);
     this.shadowGenerators[name].useBlurExponentialShadowMap = true;
     this.shadowGenerators[name].blurKernel = 32;
  }
  
  update(light, opts) {
      if (opts.intensity !== undefined) light.intensity = opts.intensity;
      if (opts.color) light.diffuse = new BABYLON.Color3(opts.color.r, opts.color.g, opts.color.b);
  }
}