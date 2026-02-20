[Go back to Canvas3D](../Canvas3D.md)

```javascript
// loads BabylonJS dependencies
await UI.Canvas3D.loadGlobals();
//
// add Initialization Logic...
//
// global disposal - clean exit
UI.Canvas3D.dispose();
```
## Initialization Logic
### 1. High-Fidelity Desktop (WebGPU First)
```javascript
// High-End Desktop Setup
await UI.Canvas3D.canvas("#renderCanvas", {
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
await UI.Canvas3D.canvas("#renderCanvas", {
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
await UI.Canvas3D.canvas("#renderCanvas", {
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
UI.Canvas3D.setQuality(2.0);
```
### 4. Mid-Game Performance "Panic" Switch
```javascript
// This function can be tied to a "Low Graphics" button in your UI
function optimizeForLag() {
    // 1.0 = Native Resolution
    // 2.0 = Half Resolution (Huge performance gain)
    // 4.0 = Quarter Resolution (Very blurry, but very fast)
    UI.Canvas3D.setQuality(2.0); 
    
    // Disable heavy engine features
    UI.Canvas3D.engine.renderEvenInBackground = false; // Save CPU when tab is hidden
}
```

### 5.Dynamic "Auto-Mode" (Performance Scaling)
```javascript
await UI.Canvas3D.canvas("#renderCanvas");

// Enable Auto-Mode: If FPS drops below 45, it will downscale.
// If FPS stays above 55, it will try to sharpen the image again.
UI.Canvas3D.AutoPerformanceMode(true, 45);
```

### 6.The "Photo Mode" / Utility Profile
```javascript
await UI.Canvas3D.canvas("#renderCanvas", {
    options: {
        preserveDrawingBuffer: true, // Required for .toDataURL()
        stencil: true
    }
});

// Take a screenshot from the engine canvas
function captureImage() {
    const data = UI.Canvas3D.engine.getRenderingCanvas().toDataURL("image/png");
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = data;
    link.click();
}
```

### 7. VR / AR (WebXR) Profile
```javascript
await UI.Canvas3D.canvas("#renderCanvas", {
    options: {
        xrCompatible: true,
        powerPreference: "high-performance"
    }
});
```