import { Canvas } from '../../Services/Canvas/Canvas.js';

export class Designer {
    constructor(DOM, options = {}) {
        this.DOM = $(DOM);
        this.options = options;
        this.init();
    }

    async init() {
        // Initialize the main Canvas app
        const app = await new Canvas(this.DOM[0]);

        // Load specific scene modules
        // Note: These modules (ThirdPersonGame.js, etc.) must exist in ./Scenes/
        await app.loadScene('thirdPerson', 'ThirdPersonGame');
        await app.loadScene('firstPerson', 'FirstPersonGame');
        await app.loadScene('platformer', 'Platformer2D');
        await app.loadScene('isometric', 'Isometric2D');
        await app.loadScene('ui2d', 'UI2D');
        await app.loadScene('ui3d', 'UI3D');

        // Set initial scene and enable debugger
        app.switchScene('thirdPerson');
        app.debugger(true);

        let currentScene = 0;
        const scenes = ['thirdPerson', 'firstPerson', 'platformer', 'isometric', 'ui2d', 'ui3d'];

        // Scene switching logic (Keys 1-6)
        window.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '6') {
                const sceneIndex = parseInt(e.key) - 1;
                if (sceneIndex < scenes.length) {
                    currentScene = sceneIndex;
                    app.switchScene(scenes[currentScene]);
                    app.debugger(true);
                    console.log(`Switched to scene: ${scenes[currentScene]}`);
                }
            }
        });
    }
}