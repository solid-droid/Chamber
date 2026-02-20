export class CoreSystem {
  constructor(canvasSelector) {
    if (typeof canvasSelector === 'string') {
        this.canvas = document.querySelector(canvasSelector);
    } else if (canvasSelector instanceof HTMLElement) {
        this.canvas = canvasSelector;
    }

    if (!this.canvas) throw new Error(`Canvas element not found for selector: ${canvasSelector}`);
    
    if (this.canvas.tagName !== 'CANVAS') {
        const c = document.createElement('canvas');
        c.style.width = '100%';
        c.style.height = '100%';
        c.style.touchAction = 'none';
        this.canvas.appendChild(c);
        this.canvas = c;
    } else {
        this.canvas.style.touchAction = 'none';
    }
  }

  async init() {
    const useWebGPU = navigator.gpu && window.location.search.includes("webgpu");

    if (useWebGPU) {
        this.engine = new BABYLON.WebGPUEngine(this.canvas);
        await this.engine.initAsync();
    } else {
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            disableWebGL2Support: false
        });
    }

    this.scenes = new Map();
    this.activeScene = null;
    
    window.addEventListener("resize", () => this.engine.resize());
  }

  createScene(name) {
    const scene = new BABYLON.Scene(this.engine);
    this.scenes.set(name, scene);
    if (!this.activeScene) {
      this.activeScene = scene;
    }
    
    try {
        const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, scene.cameras);
        pipeline.samples = 4; 
        scene.pipeline = pipeline;
    } catch(e) {}
    
    return scene;
  }

  switchScene(name) {
    // FIX: Detach controls from the current active scene before switching
    if (this.activeScene && this.activeScene.activeCamera) {
        this.activeScene.activeCamera.detachControl();
    }

    const scene = this.scenes.get(name);
    if (scene) {
      this.activeScene = scene;
      
      // Attach controls to the NEW active scene (if it has a camera)
      if (scene.activeCamera) {
          scene.activeCamera.attachControl(this.canvas, true);
      }
    }
  }

  startLoop(observerSystem) {
    this.engine.runRenderLoop(() => {
      if (this.activeScene) {
          if(this.activeScene.activeCamera) {
              this.activeScene.render();
          }
      }
      if (observerSystem) observerSystem.notifyGlobal(this.activeScene);
    });
  }
  
  dispose() {
      this.engine.dispose();
  }
}