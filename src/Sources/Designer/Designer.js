import { UI } from '../../UI/UI.js';
export class Designer {
    constructor(DOM, options = {}) {
        this.DOM = $(DOM);
        this.options = options;
        this.init();
    }

    async init() {
        await UI.Canvas3D.canvas(this.DOM[0], {
            antialias: true,
            options: {
                powerPreference: "high-performance",
                useHighPrecisionFloats: true, 
                stencil: true,                
                antialiasing: true            
            }
        });

        console.log(`Running on: ${UI.Canvas3D.status}`); 
    }
}