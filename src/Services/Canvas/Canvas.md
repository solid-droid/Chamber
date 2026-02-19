# Canvas.js API Reference

Canvas.js is a chainable, easy-to-use wrapper around Babylon.js designed to streamline 3D web development.
It manages the engine, scenes, and systems (Meshes, Lights, Physics, Inputs, UI) through a unified API.

---

# 1. Initialization & Core

Initialize the application by targeting a DOM element. The constructor returns the instance immediately, queuing operations until the engine is ready.

## Basic Setup

```js
const app = new Canvas('#renderCanvas');
```

## With Options (WebGPU)

> To use WebGPU, ensure your URL contains `?webgpu` or modify `Core-System.js`.

```js
const app = new Canvas(document.getElementById('game-container'));
```

## Debugger

Toggles the Babylon.js Inspector overlay:

```js
app.debugger(true);
```

---

# 2. Scene Management

Canvas.js supports multiple scenes with seamless switching.
Entities added via `.add()` always go to the **active scene**.

## Creating and Switching

```js
app
  .createScene('menu')
  .switchScene('menu')
  .add({ type: 'camera' });
```

## Loading External Scene Modules

Best for organizing game levels. The class must extend `Scene`.
This creates the scene, instantiates the class, and calls its `.create()` method.

```js
await app.loadScene('level1', 'FirstPersonGame');
app.switchScene('level1');
```

---

# 3. Adding Entities (.add)

The `.add(config)` method is the primary factory.

**Config Structure:**

```js
{ type: string, name: string, options: object }
```

---

## Primitive Meshes

### Box

```js
app.add({
  type: 'box',
  name: 'crate',
  options: {
    size: 2,
    position: { x: 0, y: 1, z: 0 },
    rotation: { x: 0, y: Math.PI/4, z: 0 },
    material: {
      type: 'standard',
      diffuseColor: { r: 1, g: 0.5, b: 0 }
    },
    checkCollisions: true
  }
});
```

### Sphere

```js
app.add({
  type: 'sphere',
  name: 'ball',
  options: { diameter: 1.5, segments: 16 }
});
```

### Ground

```js
app.add({
  type: 'ground',
  name: 'floor',
  options: { width: 50, height: 50, receiveShadows: true }
});
```

### Capsule

```js
app.add({
  type: 'capsule',
  name: 'playerBody',
  options: { height: 2, radius: 0.5, position: { y: 1 } }
});
```

---

## Importing Models

```js
app.add({
  type: 'model',
  name: 'hero',
  options: {
    rootUrl: './assets/',
    fileName: 'hero.glb',
    position: { x: 0, y: 0, z: 0 },
    scaling: 1.5,
    onLoaded: (root, meshes, particleSystems, skeletons, animGroups) => {
      console.log("Hero Loaded");
      root.rotation.y = Math.PI;
    }
  }
});
```

---

# 4. Materials

Defined inline within mesh options.

## Standard Material

```js
material: {
  type: 'standard',
  diffuseColor: { r: 1, g: 0, b: 0 },
  specularColor: { r: 0.2, g: 0.2, b: 0.2 },
  emissiveColor: { r: 0, g: 0, b: 0.1 },
  alpha: 1.0,
  texture: './textures/wood.png'
}
```

## PBR Material

```js
material: {
  type: 'pbr',
  albedoColor: { r: 1, g: 1, b: 1 },
  metallic: 1.0,
  roughness: 0.3
}
```

## Grid Material

```js
material: {
  type: 'grid',
  gridColor: { r: 0, g: 1, b: 0 },
  opacity: 0.5
}
```

---

# 5. Physics System (Havok)

Canvas.js uses the Havok engine. Physics must be enabled per scene.

## Initialization

```js
await app.enablePhysics({ x: 0, y: -9.81, z: 0 });
```

## Static Bodies

```js
app.add({
  type: 'box',
  name: 'wall',
  options: {
    size: 10,
    physics: { mass: 0, friction: 0.5, restitution: 0.1 }
  }
});
```

## Dynamic Bodies

```js
app.add({
  type: 'sphere',
  name: 'ball',
  options: {
    diameter: 1,
    physics: {
      mass: 1,
      friction: 0.5,
      restitution: 0.8,
      shape: BABYLON.PhysicsShapeType.SPHERE
    }
  }
});
```

## Applying Forces

```js
scene.onBeforeRenderObservable.add(() => {
  const player = app.get('player');
  if (player && player.physicsBody) {
    player.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 5));
    player.physicsBody.applyImpulse(
      new BABYLON.Vector3(0, 10, 0),
      player.absolutePosition
    );
  }
});
```

---

# 6. Controls System

Access via:

```js
app.controls
```

## Binding Keys

```js
app.controls.bind('move_forward', 'w', 'arrowup');
app.controls.bind('jump', ' ');
app.controls.bind('sprint', 'shift');
```

## Checking Input

```js
if (app.controls.isActive('move_forward')) {
  // Move forward
}

if (app.controls.isPressed('a')) {
  // Direct key check
}
```

## Mouse Handling

```js
const { x, y, left, right } = app.controls.mouse;
const { x: dx, y: dy } = app.controls.readMouseDelta();

canvasElement.addEventListener('click', () => {
  app.controls.lockPointer();
});
```

---

# 7. Cameras

## Universal (FPS)

```js
app.add({
  type: 'camera',
  name: 'fpsCam',
  options: {
    type: 'universal',
    position: { x: 0, y: 1.8, z: 0 },
    target: { x: 0, y: 1.8, z: 10 },
    attachControl: true,
    minZ: 0.1
  }
});
```

## Follow (Third Person)

```js
app.add({
  type: 'camera',
  name: 'tpsCam',
  options: {
    type: 'follow',
    lockedTarget: 'player',
    radius: 10,
    heightOffset: 4,
    rotationOffset: 180,
    cameraAcceleration: 0.05,
    maxCameraSpeed: 20
  }
});
```

## Orthographic (2D / Isometric)

```js
app.add({
  type: 'camera',
  name: 'isoCam',
  options: {
    type: 'orthographic',
    position: { x: 20, y: 20, z: -20 },
    target: { x: 0, y: 0, z: 0 },
    orthoSize: 10,
    attachControl: false
  }
});
```

---

# 8. Lights & Shadows

## Hemispheric

```js
app.add({
  type: 'light',
  name: 'hemi',
  options: {
    type: 'hemispheric',
    intensity: 0.7,
    direction: { x: 0, y: 1, z: 0 }
  }
});
```

## Directional

```js
app.add({
  type: 'light',
  name: 'sun',
  options: {
    type: 'directional',
    intensity: 1.2,
    direction: { x: -1, y: -2, z: -1 },
    castShadows: true,
    shadowMapSize: 2048
  }
});
```

## Shadow Config

```js
app.add({
  type: 'box',
  options: {
    castShadows: true,
    receiveShadows: true
  }
});
```

---

# 9. Animation

## Simple Keyframe

```js
app.animate('box', {
  property: 'position',
  to: { x: 5, y: 2, z: 0 },
  duration: 2,
  loop: true,
  easing: 'Bounce'
});
```

## Path Animation

```js
app.animate('enemy', {
  type: 'path',
  points: [
    { x: 0, y: 0, z: 0 },
    { x: 5, y: 0, z: 5 },
    { x: 10, y: 0, z: 0 }
  ],
  duration: 10,
  lookAt: true,
  drawPath: false
});
```

---

# 10. Particle System

```js
app.add({
  type: 'particle',
  name: 'fire',
  options: {
    emitter: 'torch',
    texture: 'https://www.babylonjs.com/assets/flare.png',
    capacity: 2000,
    rate: 100,
    color1: { r: 1, g: 0.5, b: 0, a: 1 },
    colorDead: { r: 0.1, g: 0, b: 0, a: 0 },
    minSize: 0.1,
    maxSize: 0.5,
    gravity: { x: 0, y: 1, z: 0 }
  }
});
```

---

# 11. UI (2D & 3D)

Access Babylon GUI:

```js
const GUI = window.CANVAS.GUI;
```

## 2D Fullscreen UI

```js
const advancedTexture =
  GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

const button = GUI.Button.CreateSimpleButton("btn", "Click Me");
advancedTexture.addControl(button);
```

---

# 12. Utilities

## Get Entity

```js
const mesh = app.get('playerName');
```

## Update Entity

```js
app.update('playerName', { position: { x: 5 } });
```

## Remove Entity

```js
app.remove('enemy');
```

## Check Memory

```js
app.observer.updateMemory(scene);
console.log(app.observer.memory);
```
