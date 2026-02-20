import { UI } from '../UI.js';
import { Log } from '../../Services/Framework/Log/Log.js';
import * as BABYLON from "@babylonjs/core";
/**
 * Canvas3D: A high-performance, WebGPU-first Babylon.js wrapper
 * featuring automatic performance scaling and hardware detection.
 */
const Canvas3D = {
    engine: null,
    status: "idle", // "idle", "webgpu", "webgl", "failed"
    _autoModeInterval: null,

    // Performance tracking state
    performance: {
        isAuto: false,
        fpsThreshold: 40,      // The "floor" FPS before quality drops
        minScaling: 1.0,       // Highest quality (1:1 pixels)
        maxScaling: 2.5,       // Lowest quality (faster)
        currentScaling: 1.0
    },

    // Immutable boot-time settings
    defaults: {
        antialias: true,
        adaptToDeviceRatio: true,
        options: {
            // General
            preserveDrawingBuffer: false,
            stencil: true,                 // Essential for glows/outlines
            powerPreference: "high-performance",
            
            // Physics & Timing
            deterministicLockstep: false, 
            lockstepMaxSteps: 4,
            
            // Visual Precision
            useHighPrecisionFloats: true,  // Fixes jitter in large scenes
            audioEngine: true,
            
            // WebGPU Specific
            antialiasing: true,
            xrCompatible: false
        }
    },

    /**
     * Dynamically imports Babylon.js and stores them in the window/wrapper.
     */
    async loadGlobals() {
        Log.start('Canvas3D-Globals-Load');
        try {
            const [BABYLON, GUI, DEBUGER, INSPECTOR, { GridMaterial }] = await Promise.all([
                import("@babylonjs/core"),
                import("@babylonjs/gui"),
                import("@babylonjs/core/Debug/debugLayer"),
                import("@babylonjs/inspector"),
                import("@babylonjs/materials/grid/gridMaterial")
            ]);

            window.BABYLON = BABYLON;
            window.BABYLON_HELPER = { 
                GUI, 
                DEBUGER, 
                INSPECTOR, 
                MATERIALS: { GridMaterial } 
            };

            Log.done('Canvas3D-Globals-Load').success("Babylon.js globals loaded.");
        } catch (err) {
            this.status = "failed";
            Log.error("Failed to load 3D Globals", err);
        }
        return UI.Canvas3D; 
    },

    /**
     * Initializes the Engine. Attempts WebGPU first, then falls back to WebGL.
     */
    async canvas(selector, customOptions = {}) {

        function getElement(input) {
            if (input instanceof HTMLElement || input instanceof Document) {
                return input;
            }
            return document.querySelector(input);
        }

        if (!BABYLON) {
            Log.error("BABYLON not loaded. Call loadGlobals() first.");
            return UI.Canvas3D;
        }

        const domElement = getElement(selector);
        if (!domElement || this.engine) return UI.Canvas3D;

        // Merge defaults with custom user overrides
        const config = { 
            ...this.defaults, 
            ...customOptions,
            options: { ...this.defaults.options, ...(customOptions.options || {}) }
        };

        // 1. Attempt WebGPU
        const isWebGPUSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
        if (isWebGPUSupported) {
            try {
                this.engine = new BABYLON.WebGPUEngine(domElement, config.options);
                await this.engine.initAsync();
                this.status = "webgpu";
                Log.info("Engine: WebGPU Initialized.");
            } catch (e) {
                Log.warn("WebGPU failed to initialize, falling back to WebGL.");
            }
        }

        // 2. Fallback to WebGL
        if (!this.engine) {
            this.engine = new BABYLON.Engine(
                domElement, 
                config.antialias, 
                config.options, 
                config.adaptToDeviceRatio
            );
            this.status = "webgl";
            Log.info("Engine: WebGL Fallback Initialized.");
        }

        // Standard event listeners
        window.addEventListener("resize", () => this.engine.resize());

        return UI.Canvas3D;
    },

    /**
     * Dynamic Quality Scaling
     * @param {number} level - 1.0 (Sharp) to 4.0 (Blurry/Fast)
     */
    setQuality(level = 1.0) {
        if (this.engine) {
            this.engine.setHardwareScalingLevel(level);
            this.performance.currentScaling = level;
        }
        return this;
    },

    /**
     * Performance Auto-Mode Logic
     * Automatically adjusts hardware scaling based on real-time FPS.
     */
    AutoPerformanceMode(enabled = true, threshold = 40) {
        this.performance.isAuto = enabled;
        this.performance.fpsThreshold = threshold;
        
        if (enabled) {
            if (this._autoModeInterval) clearInterval(this._autoModeInterval);
            
            this._autoModeInterval = setInterval(() => {
                if (!this.engine || !this.performance.isAuto) return;

                const fps = this.engine.getFps();
                
                // Low FPS: Increase scaling factor (decreases resolution)
                if (fps < this.performance.fpsThreshold && this.performance.currentScaling < this.performance.maxScaling) {
                    this.performance.currentScaling += 0.2;
                    this.setQuality(this.performance.currentScaling);
                    Log.warn(`Auto-Mode: FPS low (${fps.toFixed(0)}). Scaling set to ${this.performance.currentScaling.toFixed(1)}`);
                } 
                // High FPS: Decrease scaling factor (increases resolution)
                else if (fps > 55 && this.performance.currentScaling > this.performance.minScaling) {
                    this.performance.currentScaling -= 0.1;
                    this.setQuality(this.performance.currentScaling);
                    Log.info(`Auto-Mode: Performance headroom detected. Scaling set to ${this.performance.currentScaling.toFixed(1)}`);
                }
            }, 3000); // Check every 3 seconds to ensure stability
        } else {
            clearInterval(this._autoModeInterval);
            this._autoModeInterval = null;
        }
        return this;
    },

    dispose() {
        if (this._autoModeInterval) clearInterval(this._autoModeInterval);
        if (this.engine) {
            this.engine.dispose();
            this.engine = null;
            this.status = "idle";
        }
    }
};

// --- Auto-Register ---
UI.register('Canvas3D', Canvas3D);
export default Canvas3D;