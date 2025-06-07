import  { ArcRotateCamera, Vector3 } from "@babylonjs/core";

export function freeCamera(name, scene, options = {}) {
    options = {
        position: new Vector3(0, 1, 0), // Default position
        ...options
    };
    let camera = scene.getEngine().chamber.entity.getEntity(name, 'camera');
    if(camera){
        return camera;
    }
    camera = new ArcRotateCamera(name, 3 * Math.PI / 4, Math.PI / 4, 4, Vector3.Zero(), scene);
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
    scene.getEngine().chamber.entity.setEntity(name, 'camera', camera);
    return camera;
}