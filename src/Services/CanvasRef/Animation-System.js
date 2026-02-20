export class AnimationSystem {
  constructor(scene, registry) {
    this.scene = scene;
    this.registry = registry;
    this.animations = new Map();
  }

  animate(name, animations) {
    const entity = this.registry.get(name);
    if (!entity) {
        console.warn(`AnimationSystem: Entity '${name}' not found.`);
        return;
    }

    let delay = 0;
    
    // Convert single animation object to array
    const anims = Array.isArray(animations) ? animations : [animations];

    anims.forEach(anim => {
      // Use Babylon's setAndStartAnimation or similar if possible, 
      // but for chaining delays, setTimeout is acceptable in a simple wrapper.
      // Ideally, we'd use AnimationGroups for sequences.
      
      setTimeout(() => {
        let babylonAnim;
        if (anim.type === 'path' || anim.type === 'spline') {
          babylonAnim = this._createPathAnimation(entity, anim);
        } else if (anim.type === 'ik') {
          babylonAnim = this._createIKAnimation(entity, anim);
        } else {
          babylonAnim = this._createKeyframeAnimation(entity, anim);
        }

        if (babylonAnim) {
          const animatable = this.scene.beginAnimation(
            babylonAnim.target,
            babylonAnim.from,
            babylonAnim.to,
            anim.loop,
            anim.speedRatio,
            () => anim.onEnd && anim.onEnd(),
            null,
            () => anim.onStart && anim.onStart()
          );
          
          if (anim.onUpdate) {
              const observer = this.scene.onBeforeRenderObservable.add(() => {
                  if (animatable.masterFrame >= babylonAnim.from && animatable.masterFrame <= babylonAnim.to) {
                      anim.onUpdate(animatable.masterFrame);
                  }
                  // Cleanup observer if animation stops? 
                  // Babylon handles animatable disposal but not necessarily this custom observer.
              });
              // Attach observer to animatable to clean it up later if needed
              animatable.onAnimationEnd = () => {
                  this.scene.onBeforeRenderObservable.remove(observer);
                  if (anim.onEnd) anim.onEnd();
              };
          }

          this.animations.set(name, animatable);
        }
      }, delay);
      delay += (anim.duration || 0) * 1000 + (anim.delay || 0);
    });
  }

  _createKeyframeAnimation(entity, anim) {
    const prop = anim.property || 'position';
    const fps = anim.fps || 60;
    const duration = anim.duration || 1;

    // Determine animation type based on property value type
    let dataType = BABYLON.Animation.ANIMATIONTYPE_VECTOR3;
    let endValue;

    if (prop === 'rotation.y' || prop === 'rotation.x' || prop === 'rotation.z') {
        dataType = BABYLON.Animation.ANIMATIONTYPE_FLOAT;
        endValue = anim.to; // Assume simple float
    } else if (prop === 'scaling' || prop === 'position' || prop === 'rotation') {
        dataType = BABYLON.Animation.ANIMATIONTYPE_VECTOR3;
        endValue = new BABYLON.Vector3(anim.to.x, anim.to.y, anim.to.z);
    }

    const babylonAnim = new BABYLON.Animation(
      `${entity.name}_${prop}`,
      prop,
      fps,
      dataType,
      anim.loop ? BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE : BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Get current value safely
    let startValue;
    if (prop.includes('.')) {
        const parts = prop.split('.');
        startValue = entity[parts[0]][parts[1]];
    } else {
        startValue = entity[prop];
        if (startValue.clone) startValue = startValue.clone();
    }

    const keys = [
      { frame: 0, value: startValue },
      { frame: fps * duration, value: endValue }
    ];

    babylonAnim.setKeys(keys);
    if (anim.easing) this._applyEasing(babylonAnim, anim.easing);
    
    if(!entity.animations) entity.animations = [];
    entity.animations.push(babylonAnim);

    return { target: entity, from: 0, to: fps * duration };
  }

  _createIKAnimation(entity, anim) {
    const ikController = this.registry.get(entity.name);
    if (!ikController) return;

    const prop = 'position';
    const fps = anim.fps || 60;
    const duration = anim.duration || 1;

    const babylonAnim = new BABYLON.Animation(
      `${entity.name}_${prop}`,
      prop,
      fps,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      anim.loop ? BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE : BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keys = [
      { frame: 0, value: ikController.targetMesh.position.clone() },
      { frame: fps * duration, value: new BABYLON.Vector3(anim.to.x, anim.to.y, anim.to.z) }
    ];

    babylonAnim.setKeys(keys);
    if (anim.easing) this._applyEasing(babylonAnim, anim.easing);
    ikController.targetMesh.animations.push(babylonAnim);

    return { target: ikController.targetMesh, from: 0, to: fps * duration };
  }

  _createPathAnimation(entity, anim) {
    if (!anim.points) return;
    const vectors = anim.points.map(p => new BABYLON.Vector3(p.x, p.y, p.z));
    const path = new BABYLON.Path3D(vectors);
    const curve = path.getCurve();

    if (anim.drawPath) {
      BABYLON.MeshBuilder.CreateLines("path_" + entity.name, { points: curve }, this.scene);
    }

    const fps = anim.fps || 60;
    const duration = anim.duration || 1;
    const totalFrames = fps * duration;

    const positionAnim = new BABYLON.Animation(
      `${entity.name}_position`,
      'position',
      fps,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      anim.loop ? BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE : BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keys = [];
    if (anim.speedControl) {
      const distances = path.getDistances();
      const totalDistance = distances[distances.length - 1];
      for (let i = 0; i <= totalFrames; i++) {
        const speed = anim.speedControl(i / totalFrames);
        const distance = totalDistance * speed;
        // Basic linear interpolation for point at distance
        // Path3D doesn't have getPointAtDistance natively like Curve3 might, so we approximate or use curve index
        const pointIndex = Math.floor((distance / totalDistance) * (curve.length - 1));
        const point = curve[pointIndex];
        keys.push({ frame: i, value: point });
      }
    } else {
      for (let i = 0; i <= totalFrames; i++) {
        const point = curve[Math.floor(i * (curve.length - 1) / totalFrames)];
        keys.push({ frame: i, value: point });
      }
    }

    positionAnim.setKeys(keys);
    if (anim.easing) {
        if (typeof anim.easing === 'function') {
            const easingFunction = new BABYLON.CustomEasingFunction(anim.easing);
            positionAnim.setEasingFunction(easingFunction);
        } else {
            this._applyEasing(positionAnim, anim.easing);
        }
    }
    
    if(!entity.animations) entity.animations = [];
    entity.animations.push(positionAnim);

    if (anim.lookAt) {
      // We attach a render observer to update rotation
      this.scene.onBeforeRenderObservable.add(() => {
          const animatable = this.animations.get(entity.name);
          if (animatable) {
              const currentFrame = animatable.masterFrame;
              // Simple approximation of look ahead
              const idx = Math.min(Math.floor(currentFrame * (curve.length / totalFrames)) + 1, curve.length - 1);
              const point = curve[idx];
              if(point) entity.lookAt(point);
          }
      });
    }

    return { target: entity, from: 0, to: totalFrames };
  }

  _applyEasing(babylonAnim, easingType) {
    const EasingClass = BABYLON[easingType + "Ease"] || BABYLON.CubicEase;
    const ease = new EasingClass();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    babylonAnim.setEasingFunction(ease);
  }

  pause(name) {
    const animatable = this.animations.get(name);
    if (animatable) animatable.pause();
  }

  resume(name) {
    const animatable = this.animations.get(name);
    if (animatable) animatable.restart();
  }

  reset(name) {
    const animatable = this.animations.get(name);
    if (animatable) animatable.reset();
  }

  goToFrame(name, frame) {
    const animatable = this.animations.get(name);
    if (animatable) animatable.goToFrame(frame);
  }

  setSpeedRatio(name, ratio) {
    const animatable = this.animations.get(name);
    if (animatable) animatable.speedRatio = ratio;
  }
}