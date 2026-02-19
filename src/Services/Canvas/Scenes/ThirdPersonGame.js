import { Scene } from './Scene.js';

export class ThirdPersonGame extends Scene {
  constructor(canvas, systems) {
    super(canvas, systems);
  }

  async create(scene) {
    const canvas = this.canvas;
    
    // Environment setup
    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);
    scene.ambientColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    // 1. Physics
    await canvas.enablePhysics(scene, { x: 0, y: -9.81, z: 0 });

    // 2. Lights
    canvas.add({
      type: 'light', name: 'sun',
      options: { 
          type: 'directional', 
          intensity: 1.0, 
          direction: { x: -1, y: -2, z: -1 }, 
          castShadows: true, 
          shadowMapSize: 2048 
      }
    });

    canvas.add({
        type: 'light', name: 'ambient',
        options: { type: 'hemispheric', intensity: 0.5, direction: { x: 0, y: 1, z: 0 }, groundColor: {r:0.1, g:0.1, b:0.2} }
    });

    // 3. Ground
    canvas.add({
      type: 'ground', name: 'floor',
      options: { 
        width: 100, height: 100, receiveShadows: true, 
        material: { type: 'standard', diffuseColor: { r: 0.2, g: 0.25, b: 0.3 }, specularColor: {r:0,g:0,b:0} },
        physics: { mass: 0, friction: 0.8, restitution: 0.1 }
      }
    });

    // Add random obstacles
    for(let i=0; i<15; i++) {
        const x = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        canvas.add({
            type: 'box', name: `obs_${i}`,
            options: {
                size: Math.random() * 3 + 1,
                position: {x, y: 1.5, z},
                material: { type: 'standard', diffuseColor: { r: 0.3, g: 0.4, b: 0.5 } },
                physics: { mass: 0 }, 
                castShadows: true, receiveShadows: true
            }
        });
    }

    // 4. Player
    const player = canvas.add({
      type: 'box', name: 'player',
      options: {
        size: 1, position: { x: 0, y: 5, z: 0 },
        material: { type: 'standard', diffuseColor: { r: 1, g: 0.6, b: 0.0 }, emissiveColor: {r:0.1, g:0.06, b:0} },
        physics: { mass: 1, friction: 0, restitution: 0.0 }, // 0 friction to prevent sticking to walls
        castShadows: true
      }
    }).get('player');

    // 5. Camera
    canvas.add({
        type: 'camera', name: 'tpsCam',
        options: {
            type: 'follow', lockedTarget: 'player',
            radius: 12, heightOffset: 6, rotationOffset: 180,
            cameraAcceleration: 0.05, maxCameraSpeed: 20,
            attachControl: true
        }
    });

    // 6. Controls
    this._setupControls(scene, player);
  }

  _setupControls(scene, player) {
    const inputMap = {};
    scene.onKeyboardObservable.add((kbInfo) => {
        const type = kbInfo.type;
        if (type === BABYLON.KeyboardEventTypes.KEYDOWN) inputMap[kbInfo.event.key.toLowerCase()] = true;
        if (type === BABYLON.KeyboardEventTypes.KEYUP) inputMap[kbInfo.event.key.toLowerCase()] = false;
    });

    scene.onBeforeRenderObservable.add(() => {
        if (!player || !player.physicsBody) return;
        
        // Prevent tipping
        player.physicsBody.setAngularVelocity(new BABYLON.Vector3(0,0,0));
        
        const speed = 10.0;
        const velocity = player.physicsBody.getLinearVelocity();
        const moveDir = new BABYLON.Vector3(0, 0, 0);

        if (inputMap["w"] || inputMap["arrowup"]) moveDir.z = 1;
        if (inputMap["s"] || inputMap["arrowdown"]) moveDir.z = -1;
        if (inputMap["a"] || inputMap["arrowleft"]) moveDir.x = -1;
        if (inputMap["d"] || inputMap["arrowright"]) moveDir.x = 1;

        if (moveDir.length() > 0) {
            moveDir.normalize();
            
            // Lerp velocity for smooth acceleration
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(
                BABYLON.Scalar.Lerp(velocity.x, moveDir.x * speed, 0.1),
                velocity.y,
                BABYLON.Scalar.Lerp(velocity.z, moveDir.z * speed, 0.1)
            ));
            
            // Rotate visual to face movement
            const angle = Math.atan2(moveDir.x, moveDir.z);
            const targetRot = BABYLON.Quaternion.FromEulerAngles(0, angle, 0);
            if(!player.rotationQuaternion) player.rotationQuaternion = BABYLON.Quaternion.Identity();
            BABYLON.Quaternion.SlerpToRef(player.rotationQuaternion, targetRot, 0.2, player.rotationQuaternion);
        } else {
            // Dampen velocity to stop
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(
                velocity.x * 0.9,
                velocity.y,
                velocity.z * 0.9
            ));
        }

        if (inputMap[" "] && Math.abs(velocity.y) < 0.1) {
             player.physicsBody.applyImpulse(new BABYLON.Vector3(0, 7, 0), player.getAbsolutePosition());
        }
        
        // Respawn
        if (player.position.y < -20) {
            player.physicsBody.setLinearVelocity(new BABYLON.Vector3(0,0,0));
            player.position.set(0, 5, 0);
        }
    });
  }
}