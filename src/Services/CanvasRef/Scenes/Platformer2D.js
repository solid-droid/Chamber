import { Scene } from './Scene.js';

export class Platformer2D extends Scene {
    constructor(canvas, systems) {
        super(canvas);
        this.systems = systems;
    }

  async create(scene) {
    const canvas = this.canvas;
    scene.clearColor = new BABYLON.Color4(0.2, 0.7, 0.9, 1); // Sky blue
    
    await canvas.enablePhysics(scene);

    // 1. Camera (Orthographic Side View)
    const camera = this.systems.cameras.create('mainCam', '2d', {
        position: { x: 0, y: 5, z: -30 },
        orthoSize: 10
    }, canvas.registry);
    scene.activeCamera = camera;

    // 2. Light
    canvas.add({
      type: 'light', name: 'light',
      options: { type: 'hemispheric', intensity: 0.8, direction: {x: 0, y: 1, z: 0} }
    });
    canvas.add({
      type: 'light', name: 'sun',
      options: { type: 'directional', intensity: 0.6, direction: {x: -0.5, y: -1, z: 0.5}, castShadows: true }
    });

    // 3. Player
    const player = canvas.add({
        type: 'sphere', name: 'player',
        options: {
            diameter: 1,
            position: { y: 2, x: -8 },
            material: { type: 'standard', diffuseColor: {r:1, g:0.2, b:0.2}, emissiveColor: {r:0.2, g:0, b:0} },
            physics: { mass: 1, friction: 0.5, restitution: 0.2 },
            castShadows: true
        }
    }).get('player');

    // Camera follow player on X/Y only
    scene.onBeforeRenderObservable.add(() => {
        camera.position.x = player.position.x;
        camera.position.y = Math.max(player.position.y + 2, 5);
    });

    // 4. Level Building
    const matGrass = { type: 'standard', diffuseColor: {r:0.2, g:0.8, b:0.2} };
    const matStone = { type: 'standard', diffuseColor: {r:0.5, g:0.5, b:0.5} };

    const createPlat = (x, y, w, type='grass') => {
        canvas.add({
            type: 'box', name: `plat_${x}_${y}`,
            options: {
                position: { x, y, z: 0 },
                scaling: { x: w, y: 1, z: 2 },
                material: type === 'grass' ? matGrass : matStone,
                physics: { mass: 0, friction: 1 },
                receiveShadows: true, castShadows: true
            }
        });
    };

    createPlat(0, -2, 40, 'stone'); // Floor
    createPlat(-5, 1, 4);
    createPlat(2, 3, 4);
    createPlat(9, 5, 4);
    createPlat(16, 3, 2);
    createPlat(22, 6, 6, 'stone');

    // 5. Controls
    const inputMap = {};
    scene.onKeyboardObservable.add((kb) => {
        inputMap[kb.event.key.toLowerCase()] = kb.type === BABYLON.KeyboardEventTypes.KEYDOWN;
    });

    scene.onBeforeRenderObservable.add(() => {
        if (!player || !player.physicsBody) return;
        
        const vel = player.physicsBody.getLinearVelocity();
        const speed = 7;

        if (inputMap['a'] || inputMap['arrowleft']) {
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(-speed, vel.y, 0));
        } else if (inputMap['d'] || inputMap['arrowright']) {
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(speed, vel.y, 0));
        } else {
            // Stop horizontal
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(vel.x * 0.9, vel.y, 0));
        }

        // Jump
        if ((inputMap[' '] || inputMap['w']) && Math.abs(vel.y) < 0.1) {
            player.physicsBody.applyImpulse(new BABYLON.Vector3(0, 7, 0), player.getAbsolutePosition());
        }

        // Lock Z plane
        if (Math.abs(player.position.z) > 0.1) {
            player.position.z = 0;
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(vel.x, vel.y, 0));
        }
        
        // Respawn
        if (player.position.y < -10) {
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(0,0,0));
            player.position.set(-8, 2, 0);
        }
    });
  }
}