import { Plane , Vector3, Matrix } from '@babylonjs/core';

export function onClick(scene, callback){
        let pointerDownPos = null;
        const camera = scene.activeCamera || scene.cameras[0];
        const canvas = scene.getEngine().getRenderingCanvas();
        canvas.addEventListener('pointerdown', (evt) => {
            pointerDownPos = { x: evt.clientX, y: evt.clientY };
        });

        canvas.addEventListener('pointerup', (evt) => {
            if (!pointerDownPos) return;
            const dx = evt.clientX - pointerDownPos.x;
            const dy = evt.clientY - pointerDownPos.y;
            const distanceMoved = Math.sqrt(dx * dx + dy * dy);
            pointerDownPos = null;
            if (distanceMoved < 5) { // 5 pixels tolerance for minor hand movement
                const pickResult = scene.pick(scene.pointerX, scene.pointerY);
                if (pickResult.hit) {
                    callback(pickResult);
                } else {
                    const groundPlane = Plane.FromPositionAndNormal(Vector3.Zero(), Vector3.Up());
                    const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera);
                    const distance = ray.intersectsPlane(groundPlane);
                    if (distance !== null) {
                        const pickedPoint = ray.origin.add(ray.direction.scale(distance));
                        pickResult.pickedPoint = pickedPoint;
                        pickResult.distance = distance;
                        callback(pickResult);
                    }
                }
            }
                        
        });
    }