import { HemisphericLight, Vector3 } from "@babylonjs/core"; 

export function GlobalLight(name, scene, options = {}) {
    options = {
        direction: new Vector3(0, 1, 0),
        intensity: 1, // Default intensity
        ...options
    };
    let light = scene.getEngine().chamber.entity.getEntity(name, 'light');
    if (light) {
        return light;
    }
    light = new HemisphericLight(
                name,
                options.direction,
                scene
        );
    light.intensity = options.intensity; // Default intensity
    scene.getEngine().chamber.entity.setEntity(name, 'light', light);
    return light;
}