import { Scene } from './Scene.js';

export class Isometric2D extends Scene {
  constructor(canvas, systems) {
    super(canvas, systems);
  }

  async create(scene) {
    const canvas = this.canvas;
    scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.25, 1);

    await canvas.enablePhysics(scene);

    // 1. Iso Camera
    canvas.add({
        type: 'camera', name: 'isoCamera',
        options: {
            type: 'universal',
            position: { x: 30, y: 30, z: -30 }, // Classic Iso angle
            target: { x: 0, y: 0, z: 0 },
            mode: 1, // ORTHOGRAPHIC
            orthoSize: 15,
            attachControl: false
        }
    });

    // 2. Lights
    canvas.add({
      type: 'light', name: 'hemi',
      options: { type: 'hemispheric', intensity: 0.6, direction: {x:0,y:1,z:0} }
    });
    canvas.add({
      type: 'light', name: 'dir',
      options: { 
          type: 'directional', intensity: 0.7, 
          direction: { x: -0.5, y: -1, z: 0.2 }, 
          castShadows: true, shadowMapSize: 2048 
      }
    });

    // 3. Grid Ground
    canvas.add({
        type: 'ground', name: 'ground',
        options: {
            width: 40, height: 40,
            material: { type: 'grid', gridColor: {r:0.5,g:0.8,b:1}, opacity: 0.8 },
            receiveShadows: true,
            physics: { mass: 0, friction: 0.5 }
        }
    });

    // 4. Colorful Blocks
    const colors = [
        {r:1, g:0.2, b:0.2}, {r:0.2, g:1, b:0.2}, {r:0.2, g:0.2, b:1}, {r:1, g:1, b:0.2}
    ];
    
    for(let i=0; i<10; i++) {
        const x = Math.floor((Math.random() - 0.5) * 20) * 2;
        const z = Math.floor((Math.random() - 0.5) * 20) * 2;
        const col = colors[i % colors.length];
        
        canvas.add({
            type: 'box', name: `block_${i}`,
            options: {
                size: 1.8,
                position: { x, y: 0.9, z },
                material: { type: 'standard', diffuseColor: col },
                physics: { mass: 1, friction: 0.5, restitution: 0.1 },
                castShadows: true, receiveShadows: true
            }
        });
    }

    // 5. Player
    const player = canvas.add({
        type: 'cylinder', name: 'player',
        options: {
            diameter: 1, height: 2,
            position: { y: 2, x: 0, z: 0 },
            material: { type: 'standard', diffuseColor: { r: 1, g: 1, b: 1 }, emissiveColor: {r:0.2, g:0.2, b:0.2} },
            physics: { mass: 1, friction: 0.5 },
            castShadows: true
        }
    }).get('player');

    // 6. Controls (Rotated for Iso)
    const inputMap = {};
    scene.onKeyboardObservable.add((kb) => {
        inputMap[kb.event.key.toLowerCase()] = kb.type === BABYLON.KeyboardEventTypes.KEYDOWN;
    });

    scene.onBeforeRenderObservable.add(() => {
        if (!player || !player.physicsBody) return;
        
        const speed = 6;
        const vel = player.physicsBody.getLinearVelocity();
        let x = 0, z = 0;

        // In Isometric, Up (W) moves -X +Z visually
        if (inputMap['w']) { x -= speed; z += speed; }
        if (inputMap['s']) { x += speed; z -= speed; }
        if (inputMap['a']) { x -= speed; z -= speed; }
        if (inputMap['d']) { x += speed; z += speed; }

        if (x !== 0 || z !== 0) {
            // Normalize so diagonal isn't faster
            const len = Math.sqrt(x*x + z*z);
            x = (x/len) * speed;
            z = (z/len) * speed;
            
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(x, vel.y, z));
        } else {
             player.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, vel.y, 0));
        }
        
        // Prevent tipping
        player.physicsBody.setAngularVelocity(new BABYLON.Vector3(0,0,0));
    });
  }
}