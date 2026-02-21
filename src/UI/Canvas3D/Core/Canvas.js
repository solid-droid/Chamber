import { ModuleCore } from '@Utility/ModuleCore.js';
import { Scene } from './Scene.js';
import { Log } from '@Log';

export class Canvas extends ModuleCore {
    constructor(identifier, options = {}, parentWrapper) {
        // Resolve the identifier (string vs HTML element)
        const isString = typeof identifier === 'string';
        const name = isString ? identifier : (identifier.id || identifier.dataset?.coreId || 'canvas_auto');

        super(`${parentWrapper._namespace}.Canvas.${name}`);
        this.name = name;
        this.domElement = isString ? null : identifier;
        this.engine = null;
        this.status = "idle";
        this._autoModeInterval = null;
        this.isPaused = false;
        
        // Ported original defaults
        this.defaults = {
            selector: isString ? identifier : null,
            antialias: true,
            adaptToDeviceRatio: true,
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

        // Define the render loop function so it can be added/removed cleanly
        this._renderLoop = () => {
            if (!this.engine || !this.engine.scenes) return;
            
            this.engine.scenes.forEach(scene => {
                if (scene.activeCamera) {
                    scene.render();
                }
            });
        };

        // Register allowed children
        this.registerPlugin('scene', Scene);

        // Store the initialization promise so Core.js can await it
        this.ready = this._initEngine();
    }

    async _initEngine() {
        let domElement = this.domElement;

        // 1. Try treating string as a CSS selector (e.g., '#myCanvas' or '.render-canvas')
        if (!domElement && this.options.selector) {
            try {
                domElement = document.querySelector(this.options.selector);
            } catch (e) {
                // Ignore invalid CSS selector syntax errors
            }
        }

        // 2. Fallback to using the string directly as an ID
        if (!domElement) {
            domElement = document.getElementById(this.name);
        }

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

        // Automatically start the render loop for all attached scenes
        this.engine.runRenderLoop(this._renderLoop);
    }

    // --- Render Controls ---

    pause() {
        if (this.engine && !this.isPaused) {
            this.engine.stopRenderLoop(this._renderLoop);
            this.isPaused = true;
            Log.info(`Canvas '${this.name}' paused.`);
        }
        return this._proxy; // Chainable
    }

    resume() {
        if (this.engine && this.isPaused) {
            this.engine.runRenderLoop(this._renderLoop);
            this.isPaused = false;
            Log.info(`Canvas '${this.name}' resumed.`);
        }
        return this._proxy; // Chainable
    }

    // --- Performance Controls ---

    quality(level = 1.0) {
        if (this.engine) {
            this.engine.setHardwareScalingLevel(level);
            this.performance.currentScaling = level;
        }
        return this._proxy; // Chainable
    }

    AutoPerformanceMode(enabled = true, threshold = 40) {
        this.performance.isAuto = enabled;
        this.performance.fpsThreshold = threshold;
        
        if (enabled) {
            if (this._autoModeInterval) clearInterval(this._autoModeInterval);
            
            this._autoModeInterval = setInterval(() => {
                if (!this.engine || !this.performance.isAuto || this.isPaused) return; // Skip if paused
                const fps = this.engine.getFps();
                
                if (fps < this.performance.fpsThreshold && this.performance.currentScaling < this.performance.maxScaling) {
                    this.performance.currentScaling += 0.2;
                    this.quality(this.performance.currentScaling);
                    Log.warn(`Auto-Mode: FPS low (${fps.toFixed(0)}). Scaling set to ${this.performance.currentScaling.toFixed(1)}`);
                } else if (fps > 55 && this.performance.currentScaling > this.performance.minScaling) {
                    this.performance.currentScaling -= 0.1;
                    this.quality(this.performance.currentScaling);
                    Log.info(`Auto-Mode: Performance headroom detected. Scaling set to ${this.performance.currentScaling.toFixed(1)}`);
                }
            }, 3000);
        } else {
            clearInterval(this._autoModeInterval);
            this._autoModeInterval = null;
        }
        return this._proxy; // Chainable
    }

    update(options) {
        if (!options) return;
        this.options = { ...this.options, ...options };
        // Apply immediate updates if necessary
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