import { MeshBuilder } from "@babylonjs/core";

export function Box(name, scene, options = {}) {
    options = {
        ...options
    };
    let box = scene.getEngine().chamber.entity.getEntity(name, 'mesh');
    if (box) {
        return box;
    }
    box = MeshBuilder.CreateBox(name, {}, scene);
    if (options.material) {
        box.material = options.material;
    }
    scene.getEngine().chamber.entity.setEntity(name, 'mesh', box);
    return box;
}