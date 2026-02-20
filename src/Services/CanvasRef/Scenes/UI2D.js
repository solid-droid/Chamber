import { Scene } from './Scene.js';

export class UI2D extends Scene {
    constructor(canvas, systems) {
        super(canvas);
        this.systems = systems;
    }

  create(scene) {
    const canvas = this.canvas;
    const camera = this.systems.cameras.create('camera', '2d', {}, canvas.registry);
    scene.activeCamera = camera;

    // Use window.CANVAS.GUI as requested
    const GUI = window.CANVAS.GUI;

    if (!GUI) {
        console.error("UI2D: CANVAS.GUI is missing.");
        return;
    }

    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    const panel = new GUI.StackPanel();
    panel.width = "200px";
    panel.isVertical = true;
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(panel);

    const button = GUI.Button.CreateSimpleButton("but", "Click Me");
    button.width = "100px";
    button.height = "40px";
    button.color = "white";
    button.cornerRadius = 20;
    button.background = "green";
    button.onPointerUpObservable.add(() => {
        alert("Clicked!");
    });
    panel.addControl(button);

    const rect = new GUI.Rectangle();
    rect.width = "100px";
    rect.height = "100px";
    rect.cornerRadius = 20;
    rect.color = "orange";
    rect.thickness = 4;
    rect.background = "blue";
    advancedTexture.addControl(rect);
  }
}