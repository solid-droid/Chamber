## Chamber Framework: Developer Guide
### The Pattern
Every module in Chamber is a Proxy. This allows for a chainable, "failsafe" syntax where missing features warn you instead of crashing.

### 1. Chainable Syntax
Always return the object (or the parent) to allow for cascading commands.

```JavaScript
// Aesthetic Flow
UI.init('#app')
  .setTheme('dark')

await UI.Canvas3D.loadGlobals();

UI.Button('#button')
  .Text('click Me')
```

### 2. Performance Tracking
Wrap heavy logic in Log timers. These are captured in Log.report().

```JavaScript
Log.start('init-3d');
await UI.Canvas3D.loadGlobals();
Log.done('init-3d').success("Ready");
```
### 3. Adding Plugins (The Blueprint)
To add a feature, create a file and use register.

```JavaScript
// plugins/MyPlugin.js
import { UI } from '../UI.js';
import { Log } from '../Log.js';

const MyPlugin = {
    // Methods should return the plugin or the parent UI for chaining
    init(options = {}) {
        Log.info("MyPlugin Initialized", options);
        return UI.MyPlugin;
    },
    
    doAction() {
        Log.success("Action Executed");
        return UI.MyPlugin;
    }
};

// Auto-registration
UI.register('MyPlugin', MyPlugin);

export default MyPlugin;
```
### 4. State & Reactivity
Don't pass data manually. Use the Store and subscribe to changes.

```JavaScript
// Component A
Store.subscribe('user', (value, prev) => {
    Log.info(`User is now: ${value}`);
});

// Component B
Store.user = 'Gemini'; // Auto-triggers all subscribers
```
### 5. Async Safety (The "Golden Rule")
If you modify a Proxy get trap, you must ignore the .then property to prevent await hangs.

```JavaScript
get(target, prop) {
    if (prop === 'then') return undefined; // Crucial for async/await
    return target[prop] || ghost(prop);
}
```
### 6. Developer Tooling (IntelliSense)
To maintain autocomplete in VS Code, all dynamic plugins should be added to types.d.ts.

```TypeScript
// types.d.ts
export interface IUI {
    register(name: string, plugin: any): IUI;
    Canvas3D?: ICanvas3D;
    MyNewPlugin?: IMyNewPlugin; // Add your plugin here for autocomplete
}
```

### 7. Global Access
The entire environment is available via the CHAMBER global for easy debugging in the console:
```JavaScript
//window.CHAMBER or CHAMBER
window.CHAMBER = {
    Tauri,  // System/Desktop API
    UI,     // DOM/3D Engine
    Store,  // Reactive State
    Log     // Performance & Debugging
};

CHAMBER.Store.clear().Log.report();
```