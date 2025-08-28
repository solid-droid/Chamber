import { Scene, Color3 } from "@babylonjs/core";

export function basic(name, engine, options = {}) {
    options = {
        clearColor: new Color3(0.05, 0.05, 0.05), // Gray black
        ...options
    }
    let scene = engine.chamber.entity.getEntity(name, 'scene');
    if (scene) {
        return scene;
    }
    scene = new Scene(engine);
    scene.clearColor = options.clearColor;
    engine.chamber.entity.setEntity(name, 'scene', scene);
    return scene;
}