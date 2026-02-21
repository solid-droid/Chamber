import { ModuleCore } from '@Utility/ModuleCore.js';
import { Log } from '@Log';

export class Light extends ModuleCore {
    constructor(name, options = {}, parentScene) {
        super(`${parentScene._namespace}.lights.${name}`);
        this.name = name;
        this.parentScene = parentScene;
        this.babylonLight = null;

        // Defaults
        this.options = {
            type: 'hemispheric', // 'hemispheric', 'directional', 'point'
            direction: [0, 1, 0], // Acts as direction or position based on type
            intensity: 1.0,
            ...options
        };

        this.init();
    }

    init() {
        const BABYLON = window.BABYLON;
        const scene = this.parentScene.babylonScene;
        
        if (!BABYLON || !scene) return Log.error(`Scene not ready for Light: ${this.name}`);

        const dirOrPos = new BABYLON.Vector3(...this.options.direction);

        switch(this.options.type) {
            case 'directional':
                this.babylonLight = new BABYLON.DirectionalLight(this.name, dirOrPos, scene);
                break;
            case 'point':
                this.babylonLight = new BABYLON.PointLight(this.name, dirOrPos, scene);
                break;
            case 'hemispheric':
            default:
                this.babylonLight = new BABYLON.HemisphericLight(this.name, dirOrPos, scene);
                break;
        }

        this.babylonLight.intensity = this.options.intensity;
    }

    update(options) {
        if (!options) return;
        Object.assign(this.options, options);
        
        if (this.babylonLight) {
            if (options.intensity !== undefined) this.babylonLight.intensity = options.intensity;
            if (options.direction) {
                const vec = new window.BABYLON.Vector3(...options.direction);
                if (this.options.type === 'point') this.babylonLight.position = vec;
                else this.babylonLight.direction = vec;
            }
        }
    }

    dispose() {
        if (this.babylonLight) {
            this.babylonLight.dispose();
            this.babylonLight = null;
        }
    }
}