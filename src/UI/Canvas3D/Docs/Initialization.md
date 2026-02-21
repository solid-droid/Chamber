[Go back to Canvas3D](../Canvas3D.md)

## Initialization & Engine
```javascript 
await Canvas3D.loadGlobals();

const engine = await Canvas3D.engine({ 
    powerPreference: "high-performance" // default
});
```

### Canvas Plugin:
The Canvas plugin handles WebGPU/WebGL initialization, the render loop, and performance scaling. Because WebGPU is asynchronous, creating a canvas must be awaited.
```javascript
let canvas = await engine.add.canvas("#renderCanvas")
```
```
.quality(level) - Sets hardware scaling (e.g., 0.5 is supersampling, 2.0 is lower res).

.AutoPerformanceMode(enabled, targetFps) - Dynamically scales resolution if FPS drops below target.

.pause() - Pauses the Babylon render loop to save battery/CPU.

.resume() - Resumes the render loop.

.dispose() - Destroys the engine and all attached scenes.
```

### Scene Plugin
[Go To Scene Plugin Docs](./Scene.md)  
The Scene plugin acts as a container for your meshes, lights, and cameras. A Canvas will automatically render all attached scenes as long as they have an active camera.
```javascript
let myScene = canvas.add.scene("mainRoom", { 
    clearColor: "#111111" // Hex string background color
});
```

## Initialization Logic
### 1. High-Fidelity Desktop (WebGPU First)
```javascript
// High-End Desktop Setup
let canvas = await engine.add.canvas("#renderCanvas", {
    antialias: true,
    options: {
        powerPreference: "high-performance",
        useHighPrecisionFloats: true, // Prevents "jitter" in large worlds
        stencil: true,                // Enables object highlighting/outlines
        antialiasing: true            // WebGPU-specific MSAA
    }
});

console.log(`Running on: ${UI.Canvas3D.status}`); // Should be "webgpu"
```
### 2. Physics & Simulation Profile (Deterministic)
```javascript
let canvas = await engine.add.canvas("#renderCanvas", {
    options: {
        deterministicLockstep: true,
        lockstepMaxSteps: 4,
        timeStep: 1 / 60, // Forces physics to calculate at exactly 60fps
        powerPreference: "high-performance"
    }
});
```
### 3. Mobile Performance Profile (Battery Saver)
```javascript
let canvas = await engine.add.canvas("#renderCanvas", {
    adaptToDeviceRatio: true, 
    options: {
        powerPreference: "low-power", // Suggests using the integrated/mobile GPU
        audioEngine: true,
        stencil: false,               // Save memory by disabling stencil buffer
        preserveDrawingBuffer: false  // Performance boost: don't save canvas frames
    }
});

// Force the resolution down even further if the device is ultra-high DPI
// 2.0 is a good "sweet spot" for Retina displays
canvas.quality(2.0);
```
### 4. Mid-Game Performance "Panic" Switch
```javascript
// This function can be tied to a "Low Graphics" button in your UI
function optimizeForLag() {
    // 1.0 = Native Resolution, 2.0 = Half Resolution, 4.0 = Quarter Resolution
    canvasInstance.quality(2.0); 
    
    // Disable heavy engine features
    canvasInstance.engine.renderEvenInBackground = false; // Save CPU when tab is hidden
}
```

### 5.Dynamic "Auto-Mode" (Performance Scaling)
```javascript
let canvas = await engine.add.canvas("#renderCanvas");

// Enable Auto-Mode: If FPS drops below 45, it will downscale.
// If FPS stays above 55, it will try to sharpen the image again.
canvas.AutoPerformanceMode(true, 45);
```

### 6.The "Photo Mode" / Utility Profile
```javascript
let canvas = await engine.add.canvas("#renderCanvas", {
    options: {
        preserveDrawingBuffer: true, // Required for .toDataURL()
        stencil: true
    }
});

// Take a screenshot from the engine canvas
function captureImage() {
    const data = canvas.engine.getRenderingCanvas().toDataURL("image/png");
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = data;
    link.click();
}
```

### 7. VR / AR (WebXR) Profile
```javascript
let canvas = await engine.add.canvas("#renderCanvas", {
    options: {
        xrCompatible: true,
        powerPreference: "high-performance"
    }
});
```