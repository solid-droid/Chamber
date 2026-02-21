import { ModuleCore } from '@Utility/ModuleCore.js';
import { Camera } from './Camera.js';
import { Light } from './Light.js';
import { Mesh } from './Mesh.js';
import { Log } from '@Log';

export class Scene extends ModuleCore {
    constructor(name, options = {}, parentCanvas) {
        super(`${parentCanvas._namespace}.scenes.${name}`);
        
        this.name = name;
        this.options = options;
        this.parentCanvas = parentCanvas;
        this.babylonScene = null;
        
        // --- Register Built-in Sub-Plugins ---
        this.registerPlugin('camera', Camera);
        this.registerPlugin('light', Light);
        this.registerPlugin('mesh', Mesh);
        
        this.init();
    }

    init() {
        if (window.BABYLON && this.parentCanvas && this.parentCanvas.engine) {
            this.babylonScene = new window.BABYLON.Scene(this.parentCanvas.engine);
            
            if (this.options.clearColor) {
                this.babylonScene.clearColor = window.BABYLON.Color4.FromHexString(this.options.clearColor);
            }
        } else {
            Log.error(`Failed to initialize Scene '${this.name}': Engine not ready.`);
        }
    }

    update(options) {
        if (!options) return;
        Object.assign(this.options, options);
        
        if (this.babylonScene && options.clearColor) {
            this.babylonScene.clearColor = window.BABYLON.Color4.FromHexString(options.clearColor);
        }
    }

    dispose() {
        if (this.babylonScene) {
            this.babylonScene.dispose();
            this.babylonScene = null;
        }
    }
}