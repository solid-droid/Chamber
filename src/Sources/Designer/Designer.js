import Canvas3D from '@Canvas3D/Canvas3D.js';
import { Store } from '@Store';
export class Designer {
    constructor(DOM, options = {}) {
        this.DOM = $(DOM);
        this.options = options;
        this.init();
    }

    async init() {
        await Canvas3D.loadGlobals();
        
        let engine = await Canvas3D.engine({ powerPreference: "high-performance" });

        let myCanvas = await engine.add.canvas(this.DOM[0], { antialias: true });
        myCanvas.quality(1);

        let myScene = myCanvas.add.scene("mainRoom", { clearColor: "#111111" });


        myScene.add.light("sun", { type: "hemispheric", intensity: 0.8 });
        

        myScene.add.camera("playerCam", { type: "arc", position: [0, 5, -10], target: [0, 1, 0] });

 
        myScene.mesh("ground", { type: "ground", size: 5 })
        myScene.add.mesh("player", { type: "box", size: 2, position: [0, 1, 0] })
        myScene.add.mesh("companion", { type: "sphere", size: 1, position: [3, 0.5, 0] });

        console.log(`Successfully running on: ${myCanvas.status.toUpperCase()}`); 
        
        // Test the proxy update system
        setTimeout(() => {
            myScene.mesh("companion",{ position: [-3, 0.5, 0] });
        }, 2000);
    }
}