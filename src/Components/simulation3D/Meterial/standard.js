import { StandardMaterial, Color3 } from "@babylonjs/core";

export function Standard(name, scene, options = {}) {
    options = {
        color: { r: 1, g: 1, b: 1 }, // Default color white
        ...options
    };
    let material = scene.getEngine().chamber.entity.getEntity(name, 'material');
    if (material) {
        return material;
    }
    material = new StandardMaterial(name, scene);
    material.diffuseColor = new Color3(options.color.r, options.color.g, options.color.b);
    scene.getEngine().chamber.entity.setEntity(name, 'material', material);
    return material;
}