import { ModuleCore } from '@Utility/ModuleCore.js';
import { Log } from '@Log';

export class Camera extends ModuleCore {
    constructor(name, options = {}, parentScene) {
        super(`${parentScene._namespace}.cameras.${name}`);
        this.name = name;
        this.parentScene = parentScene;
        this.babylonCamera = null;
        
        // Defaults
        this.options = {
            type: 'free', // 'free', 'arc'
            position: [0, 5, -10],
            target: [0, 0, 0],
            attachControl: true,
            ...options
        };

        this.init();
    }

    init() {
        const BABYLON = window.BABYLON;
        const scene = this.parentScene.babylonScene;
        const canvas = this.parentScene.parentCanvas?.engine?.getRenderingCanvas();
        
        if (!BABYLON || !scene) return Log.error(`Scene not ready for Camera: ${this.name}`);

        const pos = new BABYLON.Vector3(...this.options.position);
        const target = new BABYLON.Vector3(...this.options.target);

        if (this.options.type === 'arc') {
            this.babylonCamera = new BABYLON.ArcRotateCamera(this.name, 0, Math.PI / 3, 10, target, scene);
            this.babylonCamera.setPosition(pos);
        } else {
            this.babylonCamera = new BABYLON.FreeCamera(this.name, pos, scene);
            this.babylonCamera.setTarget(target);
        }

        if (this.options.attachControl && canvas) {
            this.babylonCamera.attachControl(canvas, true);
        }
    }

    update(options) {
        if (!options) return;
        Object.assign(this.options, options);
        
        if (this.babylonCamera) {
            if (options.position) {
                this.babylonCamera.position = new window.BABYLON.Vector3(...options.position);
            }
            if (options.target && this.options.type === 'free') {
                this.babylonCamera.setTarget(new window.BABYLON.Vector3(...options.target));
            }
        }
    }

    dispose() {
        if (this.babylonCamera) {
            this.babylonCamera.dispose();
            this.babylonCamera = null;
        }
    }
}