import { Scene } from './Scene.js';

export class FirstPersonGame extends Scene {
  constructor(canvas, systems) {
    super(canvas, systems);
  }

  async create(scene) {
    const canvas = this.canvas;
    
    // Scene styling
    scene.clearColor = new BABYLON.Color4(0.8, 0.9, 1.0, 1);
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.02;
    scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1.0);

    await canvas.enablePhysics(scene);

    // Lights
    canvas.add({
      type: 'light', name: 'sun',
      options: { type: 'hemispheric', intensity: 0.8 }
    });
    canvas.add({
        type: 'light', name: 'dir',
        options: { type: 'directional', direction: {x:-1, y:-2, z:-1}, intensity: 0.5, castShadows: true }
    });

    // Arena Walls
    const createWall = (x, z, w, h, d, rotY=0) => {
        canvas.add({
            type: 'box', name: `wall_${x}_${z}`,
            options: {
                position: {x, y: h/2, z},
                scaling: {x: w, y: h, z: d},
                rotation: {x:0, y:rotY, z:0},
                material: { type: 'standard', diffuseColor: {r:0.4, g:0.4, b:0.45} },
                physics: { mass: 0 },
                receiveShadows: true, castShadows: true
            }
        });
    };

    // Ground
    canvas.add({
      type: 'ground', name: 'floor',
      options: {
        width: 100, height: 100,
        material: { type: 'grid', gridColor: {r:0.5,g:0.5,b:0.5}, opacity: 1 },
        receiveShadows: true,
        physics: { mass: 0, friction: 0.5 } 
      }
    });

    // Simple Map
    createWall(0, 10, 20, 4, 1);
    createWall(0, -10, 20, 4, 1);
    createWall(10, 0, 20, 4, 1, Math.PI/2);
    createWall(-10, 0, 20, 4, 1, Math.PI/2);
    
    // Random columns
    for(let i=0; i<5; i++) {
        canvas.add({
            type: 'box', name: `col_${i}`,
            options: {
                position: { x: (Math.random()-0.5)*15, y: 1.5, z: (Math.random()-0.5)*15 },
                size: 3,
                material: { type: 'standard', diffuseColor: {r:0.8, g:0.2, b:0.2} },
                physics: { mass: 0 },
                castShadows: true
            }
        });
    }

    // Player (Capsule)
    const player = canvas.add({
        type: 'capsule', name: 'player',
        options: {
            position: { x: 0, y: 5, z: 0 }, 
            height: 2, radius: 0.8,
            material: { type: 'standard', diffuseColor: { r: 0, g: 0.5, b: 1 }, alpha: 0 }, // Invisible body
            physics: { mass: 1, friction: 0, restitution: 0 },
            checkCollisions: true
        }
    }).get('player');

    // FPS Camera attached to player
    const cam = canvas.add({
        type: 'camera', name: 'fpsCamera',
        options: {
            type: 'universal',
            position: { x: 0, y: 0.8, z: 0 }, 
            target: { x: 0, y: 0.8, z: 10 },
            minZ: 0.1,
            attachControl: true,
            parent: 'player'
        }
    }).get('fpsCamera');

    // Controls
    cam.keysUp = [87];    // W
    cam.keysDown = [83];  // S
    cam.keysLeft = [65];  // A
    cam.keysRight = [68]; // D
    cam.speed = 0.5;
    cam.inertia = 0.1;
    cam.angularSensibility = 800;

    // Click to lock pointer
    scene.onPointerDown = () => {
        canvas.core.canvas.requestPointerLock = canvas.core.canvas.requestPointerLock || canvas.core.canvas.mozRequestPointerLock;
        if(canvas.core.canvas.requestPointerLock) canvas.core.canvas.requestPointerLock();
    };

    // Physics movement sync
    scene.onBeforeRenderObservable.add(() => {
        if (!player || !player.physicsBody) return;
        
        player.physicsBody.setAngularVelocity(new BABYLON.Vector3(0,0,0));
        
        // Sync player rotation with camera look
        const yRotation = cam.rotation.y;
        player.rotation.y = yRotation;
        
        // Jumping
        if (cam.cameraDirection.y > 0) {
             // Basic jump check logic would go here
        }
        
        // Respawn
        if (player.position.y < -10) {
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(0,0,0));
            player.position.set(0, 5, 0);
        }
    });
  }
}