import { ModuleCore } from '@Utility/Plugin/ModuleCore.js';
import { Scene } from './Scene.js';
import { Log } from '@Log';

export class Canvas extends ModuleCore {
    constructor(identifier, options = {}, parentWrapper) {
        const isString = typeof identifier === 'string';
        const name = isString ? identifier : (identifier.id || identifier.dataset?.coreId || 'canvas_auto');

        super(`${parentWrapper._namespace}.Canvas.${name}`);
        this.name = name;
        this.domElement = isString ? null : identifier;
        this.engine = null;
        this.status = "idle";
        this._autoModeInterval = null;
        this.isPaused = false;
        
        this.defaults = {
            selector: isString ? identifier : null,
            antialias: true,
            adaptToDeviceRatio: true,
            activeScene: null, // Tracks which scene is currently rendering
            options: {
                preserveDrawingBuffer: false,
                stencil: true,                 
                powerPreference: "high-performance",
                useHighPrecisionFloats: true,  
                audioEngine: true,
            }
        };

        this.performance = {
            isAuto: false,
            fpsThreshold: 40,
            minScaling: 1.0,
            maxScaling: 2.5,
            currentScaling: 1.0
        };

        this.options = { ...this.defaults, ...options, options: { ...this.defaults.options, ...(options.options || {}) } };

        // Smart render loop with Active Scene switching support
        this._renderLoop = () => {
            if (!this.engine || !this.engine.scenes) return;
            
            this.engine.scenes.forEach(scene => {
                // Skip rendering if we set an active scene and this isn't it
                if (this.options.activeScene && scene.name !== this.options.activeScene) return;

                if (scene.activeCamera) {
                    scene.render();
                }
            });
        };

        this.registerPlugin('scene', Scene);
        this.ready = this._initEngine();
    }

    async _initEngine() {
        let domElement = this.domElement;

        if (!domElement && this.options.selector) {
            try { domElement = document.querySelector(this.options.selector); } catch (e) {}
        }
        if (!domElement) domElement = document.getElementById(this.name);
        if (!domElement) return Log.error(`Canvas DOM element not found for '${this.name}'`);

        const BABYLON = window.BABYLON;
        if (!BABYLON) return Log.error("BABYLON not loaded. Call loadGlobals() first.");

        // 1. WebGPU
        const isWebGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
        if (isWebGPUSupported) {
            try {
                this.engine = new BABYLON.WebGPUEngine(domElement, this.options.options);
                await this.engine.initAsync();
                this.status = "webgpu";
                Log.info(`Engine: WebGPU Initialized on '${this.name}'.`);
            } catch (e) {
                Log.warn("WebGPU failed to initialize, falling back to WebGL.");
            }
        }

        // 2. WebGL Fallback
        if (!this.engine) {
            this.engine = new BABYLON.Engine(
                domElement, 
                this.options.antialias, 
                this.options.options, 
                this.options.adaptToDeviceRatio
            );
            this.status = "webgl";
            Log.info(`Engine: WebGL Fallback Initialized on '${this.name}'.`);
        }

        window.addEventListener("resize", () => {
            if (this.engine) this.engine.resize();
        });

        this.engine.runRenderLoop(this._renderLoop);
    }

    // --- Core Operations ---
    
    switchScene(sceneName) {
        this.options.activeScene = sceneName;
        
        if (!this.engine) return this._proxy;

        this.engine.scenes.forEach(scene => {
            if (scene.name !== sceneName && scene.activeCamera) {
                scene.activeCamera.detachControl();
            }
            if (scene.name === sceneName && scene.activeCamera) {
                scene.activeCamera.attachControl(this.domElement, true);
            }
        });
        
        Log.info(`Canvas '${this.name}' switched to scene: ${sceneName}`);
        return this._proxy; 
    }

    pause() {
        if (this.engine && !this.isPaused) {
            this.engine.stopRenderLoop(this._renderLoop);
            this.isPaused = true;
            Log.info(`Canvas '${this.name}' paused.`);
        }
        return this._proxy; 
    }

    resume() {
        if (this.engine && this.isPaused) {
            this.engine.runRenderLoop(this._renderLoop);
            this.isPaused = false;
            Log.info(`Canvas '${this.name}' resumed.`);
        }
        return this._proxy; 
    }

    quality(level = 1.0) {
        if (this.engine) {
            this.engine.setHardwareScalingLevel(level);
            this.performance.currentScaling = level;
        }
        return this._proxy; 
    }

    AutoPerformanceMode(enabled = true, threshold = 40) {
        this.performance.isAuto = enabled;
        this.performance.fpsThreshold = threshold;
        
        if (enabled) {
            if (this._autoModeInterval) clearInterval(this._autoModeInterval);
            
            this._autoModeInterval = setInterval(() => {
                if (!this.engine || !this.performance.isAuto || this.isPaused) return; 
                const fps = this.engine.getFps();
                
                if (fps < this.performance.fpsThreshold && this.performance.currentScaling < this.performance.maxScaling) {
                    this.performance.currentScaling += 0.2;
                    this.quality(this.performance.currentScaling);
                } else if (fps > 55 && this.performance.currentScaling > this.performance.minScaling) {
                    this.performance.currentScaling -= 0.1;
                    this.quality(this.performance.currentScaling);
                }
            }, 3000);
        } else {
            clearInterval(this._autoModeInterval);
            this._autoModeInterval = null;
        }
        return this._proxy; 
    }

    update(options) {
        if (!options) return;
        this.options = { ...this.options, ...options };
        if (options.activeScene) this.switchScene(options.activeScene);
    }

    dispose() {
        if (this._autoModeInterval) clearInterval(this._autoModeInterval);
        if (this.engine) {
            this.engine.stopRenderLoop(this._renderLoop);
            this.engine.dispose();
            this.engine = null;
            this.status = "idle";
        }
    }
}