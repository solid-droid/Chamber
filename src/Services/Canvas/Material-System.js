export class MaterialSystem {
  constructor(scene) {
    this.scene = scene;
  }

  create(name, opts = {}) {
    const type = (opts.type || 'standard').toLowerCase();
    let mat;

    switch (type) {
      case 'pbr':
        mat = new BABYLON.PBRMaterial(name + "_mat", this.scene);
        mat.metallic = opts.metallic ?? 0;
        mat.roughness = opts.roughness ?? 0.5;
        if (opts.albedoColor) mat.albedoColor = new BABYLON.Color3(opts.albedoColor.r, opts.albedoColor.g, opts.albedoColor.b);
        break;
      case 'shader':
        mat = new BABYLON.ShaderMaterial(name + "_mat", this.scene, opts.shaderPath || {
          vertex: opts.vertexSource || "position",
          fragment: opts.fragmentSource || "color"
        }, {
          attributes: ["position", "normal", "uv"],
          uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time"]
        });
        if (opts.backFaceCulling === false) mat.backFaceCulling = false;
        if (opts.floats) {
            for (const [key, value] of Object.entries(opts.floats)) mat.setFloat(key, value);
        }
        break;
      case 'grid':
        mat = new CANVAS.MATERIALS.GridMaterial(name + "_mat", this.scene);
        if (opts.gridColor) mat.mainColor = new BABYLON.Color3(opts.gridColor.r, opts.gridColor.g, opts.gridColor.b);
        mat.opacity = opts.opacity ?? 0.5;
        break;
      default:
        mat = new BABYLON.StandardMaterial(name + "_mat", this.scene);
        if (opts.diffuseColor) mat.diffuseColor = new BABYLON.Color3(opts.diffuseColor.r, opts.diffuseColor.g, opts.diffuseColor.b);
    }

    if (opts.alpha !== undefined) mat.alpha = opts.alpha;
    if (opts.texture) {
      const tex = new BABYLON.Texture(opts.texture, this.scene);
      if (mat instanceof BABYLON.PBRMaterial) mat.albedoTexture = tex;
      else mat.diffuseTexture = tex;
    }

    return mat;
  }
}