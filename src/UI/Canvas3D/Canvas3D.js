import { ModuleCore } from '@Utility/ModuleCore.js';
import { Canvas } from './Core/Canvas.js';
import { Log } from '@Log';
import { UI } from '../UI.js';

/// Root wrapper that manages the initial "add.canvas" chain
class EngineWrapper extends ModuleCore {
    constructor(globalOptions) {
        super('Canvas3D');
        this.globalOptions = globalOptions;
        
        // The root is only allowed to have Canvas children
        this.registerPlugin('canvas', Canvas);
    }
}

const Canvas3D = {
    async loadGlobals() {
        Log.start('Canvas3D-Globals-Load');
        try {
            const [BABYLON, GUI, DEBUGER, INSPECTOR, { GridMaterial }] = await Promise.all([
                import("@babylonjs/core"),
                import("@babylonjs/gui"),
                import("@babylonjs/core/Debug/debugLayer"),
                import("@babylonjs/inspector"),
                import("@babylonjs/materials/grid/gridMaterial")
            ]);

            window.BABYLON = BABYLON;
            window.BABYLON_HELPER = { 
                GUI, DEBUGER, INSPECTOR, MATERIALS: { GridMaterial } 
            };

            Log.done('Canvas3D-Globals-Load').success("Babylon.js globals loaded.");
        } catch (err) {
            Log.error("Failed to load 3D Globals", err);
        }
        return this; 
    },
    
    // Acts as the factory to start the proxy chain
    async engine(options = {}) {
        return new EngineWrapper(options);
    }
};

// --- Auto-Register ---
if (UI && UI.register) {
    UI.register('Canvas3D', Canvas3D);
}

export default Canvas3D;