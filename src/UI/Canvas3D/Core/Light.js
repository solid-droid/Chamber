import { ModuleCore } from '@Utility/Plugin/ModuleCore.js';
import { FactoryBase } from '@Utility/Plugin/FactoryBase.js';
import { Log } from '@Log';

// 1. The Base Class (Shared logic for all lights)
export class LightBase extends ModuleCore {
    constructor(name, options = {}, parentScene) {
        super(`${parentScene._namespace}.lights.${name}`);
        this.name = name;
        this.parentScene = parentScene;
        this.options = options;
        this.babylonLight = null;
    }

    update(options) {
        if (!options) return;
        Object.assign(this.options, options);
    }

    dispose() {
        if (this.babylonLight) {
            this.babylonLight.dispose();
            this.babylonLight = null;
        }
    }
}

export class Light extends FactoryBase {
    static defaultType = 'hemispheric';
    static FallbackBase = LightBase;
}