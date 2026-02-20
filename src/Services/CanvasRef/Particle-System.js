export class ParticleSystem {
  constructor(scene, registry) {
    this.scene = scene;
    this.registry = registry;
  }

  create(name, opts) {
    // 1. Create System
    const capacity = opts.capacity || 2000;
    const ps = new BABYLON.ParticleSystem(name, capacity, this.scene);

    // 2. Texture
    if (opts.texture) {
        ps.particleTexture = new BABYLON.Texture(opts.texture, this.scene);
    }

    // 3. Emitter
    if (opts.emitter) {
        if (typeof opts.emitter === 'string') {
            const mesh = this.registry.get(opts.emitter);
            if (mesh) ps.emitter = mesh;
        } else if (opts.emitter.x !== undefined) {
            ps.emitter = new BABYLON.Vector3(opts.emitter.x, opts.emitter.y, opts.emitter.z);
        }
    } else {
        ps.emitter = BABYLON.Vector3.Zero();
    }

    // 4. Colors
    if (opts.color1) ps.color1 = new BABYLON.Color4(opts.color1.r, opts.color1.g, opts.color1.b, opts.color1.a ?? 1);
    if (opts.color2) ps.color2 = new BABYLON.Color4(opts.color2.r, opts.color2.g, opts.color2.b, opts.color2.a ?? 1);
    if (opts.colorDead) ps.colorDead = new BABYLON.Color4(opts.colorDead.r, opts.colorDead.g, opts.colorDead.b, opts.colorDead.a ?? 0);

    // 5. Size
    if (opts.minSize) ps.minSize = opts.minSize;
    if (opts.maxSize) ps.maxSize = opts.maxSize;

    // 6. Life
    if (opts.minLife) ps.minLifeTime = opts.minLife;
    if (opts.maxLife) ps.maxLifeTime = opts.maxLife;

    // 7. Rate
    ps.emitRate = opts.rate || 100;

    // 8. Gravity / Direction
    if (opts.gravity) ps.gravity = new BABYLON.Vector3(opts.gravity.x, opts.gravity.y, opts.gravity.z);
    if (opts.direction1) ps.direction1 = new BABYLON.Vector3(opts.direction1.x, opts.direction1.y, opts.direction1.z);
    if (opts.direction2) ps.direction2 = new BABYLON.Vector3(opts.direction2.x, opts.direction2.y, opts.direction2.z);

    // 9. Speed
    if (opts.minSpeed !== undefined) ps.minEmitPower = opts.minSpeed;
    if (opts.maxSpeed !== undefined) ps.maxEmitPower = opts.maxSpeed;
    ps.updateSpeed = opts.updateSpeed || 0.01;

    // 10. Blend Mode
    if (opts.blendMode) {
        switch(opts.blendMode) {
            case 'add': ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD; break;
            case 'multiply': ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_MULTIPLY; break;
            case 'standard': ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD; break;
        }
    }

    ps.start();
    return ps;
  }

  update(ps, opts) {
      if (opts.rate !== undefined) ps.emitRate = opts.rate;
      if (opts.minSpeed !== undefined) ps.minEmitPower = opts.minSpeed;
      if (opts.maxSpeed !== undefined) ps.maxEmitPower = opts.maxSpeed;
      if (opts.start !== undefined) {
          if (opts.start) ps.start();
          else ps.stop();
      }
  }
}