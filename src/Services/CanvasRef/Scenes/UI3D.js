import { Scene } from './Scene.js';

export class UI3D extends Scene {
    constructor(canvas, systems) {
        super(canvas);
        this.systems = systems;
    }

  create(scene) {
    const canvas = this.canvas;
    const camera = this.systems.cameras.create('camera', 'arc', {}, canvas.registry);
    scene.activeCamera = camera;

    canvas.add({
      type: 'light',
      name: 'light',
      options: {
        intensity: 0.7
      }
    });
    
    // Use window.CANVAS.GUI as requested
    const GUI = window.CANVAS.GUI;

    if (!GUI) {
        console.error("UI3D: CANVAS.GUI is missing.");
        return;
    }

    const manager = new GUI.GUI3DManager(scene);

    const panel = new GUI.StackPanel3D();
    manager.addControl(panel);
    panel.position.z = 0;

    const button = new GUI.Button3D("reset");
    panel.addControl(button);
    
    const text = new GUI.TextBlock();
    text.text = "Reset";
    text.color = "white";
    text.fontSize = 24;
    button.content = text;
    button.onPointerUpObservable.add(() => {
        console.log("3D Button Clicked");
    });
  }
}