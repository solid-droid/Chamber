import { ModuleCore } from '@Utility/ModuleCore.js';
import { Log } from '@Log';

export class Mesh extends ModuleCore {
    constructor(name, options = {}, parentScene) {
        super(`${parentScene._namespace}.meshes.${name}`);
        this.name = name;
        this.parentScene = parentScene;
        this.babylonMesh = null;

        // Defaults
        this.options = {
            type: 'box', // 'box', 'sphere', 'ground'
            size: 1,
            position: [0, 0, 0],
            ...options
        };

        this.init();
    }

    init() {
        const BABYLON = window.BABYLON;
        const scene = this.parentScene.babylonScene;
        
        if (!BABYLON || !scene) return Log.error(`Scene not ready for Mesh: ${this.name}`);

        switch(this.options.type) {
            case 'sphere':
                this.babylonMesh = BABYLON.MeshBuilder.CreateSphere(this.name, { diameter: this.options.size }, scene);
                break;
            case 'ground':
                this.babylonMesh = BABYLON.MeshBuilder.CreateGround(this.name, { width: this.options.size * 10, height: this.options.size * 10 }, scene);
                break;
            case 'box':
            default:
                this.babylonMesh = BABYLON.MeshBuilder.CreateBox(this.name, { size: this.options.size }, scene);
                break;
        }

        this.babylonMesh.position = new BABYLON.Vector3(...this.options.position);
    }

    update(options) {
        if (!options) return;
        Object.assign(this.options, options);
        
        if (this.babylonMesh) {
            if (options.position) {
                this.babylonMesh.position = new window.BABYLON.Vector3(...options.position);
            }
            // Add scaling/rotation updates here as needed
        }
    }

    dispose() {
        if (this.babylonMesh) {
            this.babylonMesh.dispose();
            this.babylonMesh = null;
        }
    }
}