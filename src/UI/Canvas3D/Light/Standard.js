import {LightBase, Light} from '../Core/Light.js';

export class StandardLight extends LightBase {
    constructor(name, options, parentScene) {
        super(name, { type: 'hemispheric', direction: [0, 1, 0], intensity: 1.0, ...options }, parentScene);
        this.init();
    }

    init() {
        const BABYLON = window.BABYLON;
        const scene = this.parentScene.babylonScene;
        if (!BABYLON || !scene) return Log.error(`Scene not ready for Light: ${this.name}`);

        const dirOrPos = new BABYLON.Vector3(...this.options.direction);

        switch(this.options.type) {
            case 'directional': this.babylonLight = new BABYLON.DirectionalLight(this.name, dirOrPos, scene); break;
            case 'point': this.babylonLight = new BABYLON.PointLight(this.name, dirOrPos, scene); break;
            case 'hemispheric': 
            default: this.babylonLight = new BABYLON.HemisphericLight(this.name, dirOrPos, scene); break;
        }
        this.babylonLight.intensity = this.options.intensity;
    }

    update(options) {
        super.update(options);
        if (this.babylonLight) {
            if (options.intensity !== undefined) {
                this.babylonLight.intensity = options.intensity;
            }
            if (options.direction) {
                const vec = new window.BABYLON.Vector3(...options.direction);
                if (this.options.type === 'point') this.babylonLight.position = vec;
                else this.babylonLight.direction = vec;
            }
        }
    }
}