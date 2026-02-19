export class Scene {
  constructor(canvas, systems) {
    this.canvas = canvas;
    this.systems = systems;
  }

  // Base create method to be overridden
  async create(scene) {
    console.log("Scene created");
  }

  // Optional: Update loop for scene-specific logic
  update() {}

  // Optional: Cleanup
  dispose() {}
}