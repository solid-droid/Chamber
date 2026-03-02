# RAR – Reactive Agnostic Runtime

RAR (Reactive Agnostic Runtime) is a modular, reactive, engine-driven runtime architecture designed to support UI, 2D, 3D, Audio, Animation, and Distributed execution in a unified structure.

RAR is schema-driven. Everything is defined declaratively using structured JSON RAR files.

---

# Core Concepts

RAR is composed of:

* **Designs** → Assets, templates, render layers
* **Widgets** → Functional reactive units
* **Scripts** → Logic execution units
* **Inputs** → Hardware binding layer
* **State** → Reactive global store
* **Instances** → Runtime-generated objects

RAR is:

* Reactive
* Runtime-driven
* Language-agnostic
* Thread/cloud/distributed capable
* Engine-controlled lifecycle managed

---

# 1. Design RAR (`@design`)

Defines render layers and asset categories.

## Supported Categories

### DOM

* `html+css`
* `SVG`

### 3D

* `Model`
* `Procedural`
* `Bones`
* `Material`
* `Shader`

### 2D

* `Image`
* `Sprite Sheet`
* `Bones`
* `Material`
* `Shader`

### AUDIO

* `Synth`

### Animate

* `Timeline`
* `IK`
* `Event Drive`

## Schema

```json
{
  "Category": "DOM",
  "Type": "html+css",

  "@imports": [
    { "src": "filelocation" }
  ],

  "@scripts": [
    { "src": "filelocation", "root": true },
    { "src": "filelocation" }
  ]
}
```

---

# 2. Input RAR (`@input`)

Maps hardware inputs to logical input actions.

Global hardware inputs are defined at engine level.
This file binds actions to those inputs.

## Supported Triggers

* `onPress`
* `onRelease`
* `onHold`

## Schema

```json
{
  "Keyboard_E": {
    "onPress": [{ "@input": "<inputAction>", "active": true }],
    "onRelease": [{ "@input": "<inputAction>", "active": true }],
    "onHold": [{ "@input": "<inputAction>", "active": true }]
  },

  "Gamepad_Button_X": [
    { "@input": "<inputAction>", "active": true }
  ],

  "Mouse_Left": [
    { "@input": "<inputAction>", "active": true }
  ]
}
```

* `active` → Enable/disable action dynamically

---

# 3. Widget RAR (`@widget`)

The core reactive unit of RAR.

Widgets define:

* Metadata
* Configuration
* Assets
* Child widgets
* Scripts
* Lifecycle hooks
* Events
* Inputs
* Reactive state
* Runtime instance tracking

---

## 3.1 Metadata

```json
"@meta": {
  "Ref": "@widget/<widgetHandle>",
  "name": "<widgetName>",
  "description": "<widgetDescription>",
  "css": {
    "minWidth": "10px",
    "maxWidth": "100px",
    "minHeight": "10px",
    "maxHeight": "100px",
    "overflow-x": "auto",
    "overflow-y": "auto"
  }
}
```

---

## 3.2 Configuration

```json
"@config": {
  "critical_teardown": true
}
```

* `critical_teardown` → Calls `@unbind` on app close

---

## 3.3 Design References

```json
"@design": [
  { "Ref": "@design/<design1>" },
  { "Ref": "@design/<design2>" }
]
```

Supports 3D models, audio, templates, shaders, and other RAR types.

---

## 3.4 Child Widgets

```json
"@widgets": [
  { "Ref": "@widgets/<widget1>" },
  { "Ref": "@widgets/<widget2>" }
]
```

---

## 3.5 Scripts

Supports multiple languages (js, py, rust, shader, etc.), execution environments (local, cloud, distributed), and thread models (mainThread, workerThread, WASM).

### Pulse Scheduling

* `express` → 120hz
* `fast` → 60hz
* `normal` → 10hz
* `background` → 0.2hz
* `idle` → 0hz (default)

### Schema

```json
"@scripts": [
  { "Ref": "@scripts/<script1>", "@language": "javascript", "@pulse": "fast" },
  { "Ref": "@scripts/<script2>", "@language": "javascript", "@pulse": "express" },
  { "Ref": "@scripts/<script3>", "@language": "javascript", "@pulse": "background" },

  {
    "Ref": "@scripts/<script4>",
    "@language": "javascript",
    "@execute": "sandbox",
    "@sandbox": "thread"
  },

  {
    "Ref": "@scripts/<script5>",
    "@language": "javascript",
    "@import": "<importHandle>"
  },

  {
    "Ref": "@scripts/<script6>",
    "@language": "javascript",
    "@import": ["<importMethod1>", "<importMethod2>"]
  }
]
```

### Sandbox Modes

* `thread`
* `cloud`
* `distribute`
* `wasm`

---

## 3.6 Widget Lifecycle

```json
"@preflight": { "Ref": "@scripts/<script>" },
"@bind": { "Ref": "@scripts/<script>" },
"@suspend": { "Ref": "@scripts/<script>" },
"@focus": { "Ref": "@scripts/<script>" },
"@blur": { "Ref": "@scripts/<script>" },
"@resume": { "Ref": "@scripts/<script>" },
"@unbind": { "Ref": "@scripts/<script>" }
```

### Lifecycle Description

* `@preflight` → Validate before load
* `@bind` → Initialize
* `@suspend` → Release memory and create placeholder
* `@focus` → On focus
* `@blur` → On blur
* `@resume` → Restore from suspend
* `@unbind` → Destroy instance

---

## 3.7 Events

```json
"@event": {
  "<eventHandle>": {
    "Ref": "@scripts/<script>",
    "active": true
  }
}
```

---

## 3.8 Inputs (Widget-Level)

```json
"@inputs": {
  "<inputAction>": {
    "Ref": "@scripts/<script>",
    "active": true,
    "consume": true
  }
}
```

* `consume` → Prevent propagation

---

## 3.9 Reactive State

States are globally stored but referenced by widget.

Supports:

* `.get`
* `.set`
* `.subscribe`
* `.unsubscribe`

### Schema

```json
"@stateBuffer":{
  "x": 10,
  "y": 15,
}
"@state": {
  "health": {
    "value": 100,
    "meta": {
      "reactive": true,
      "required": false,
      "type": "number"
    }
  },
  "isHacked": {
    "meta": {
      "reactive": true,
      "required": false,
      "type": "number"
    }
  }
}
```

### Meta Fields

* `reactive` → Enables subscriptions and event triggers
* `required` → Must have initial value
* `type` → Strict type (default: `any`)

---

## 3.10 Runtime Instance (Engine Generated)

Generated automatically during execution.

```json
"@instance": {
  "Ref": "@instance/#1/@widget/<widgetHandle>",
  "parentRef": "@instance/#1/@widget/<parentWidgetHandle>",

  "registry": {
    "widgets": {
      "@widget/<widget1>": ["@instance/#1", "@instance/#2"]
    },
    "designs": {
      "@assets/<design1>": ["@instance/#1"]
    }
  }
}
```

Tracks instance reference, parent relationship, child registry, and design usage.

---

# Architecture Principles

* Declarative-first
* Runtime-managed lifecycle
* Engine-controlled execution
* Reactive state propagation
* Environment-agnostic
* Thread/cloud/distributed capable
* Strong separation of Design, Logic, State, Input, and Runtime instance

---

# Execution Model

RAR supports:

* Main thread execution
* Worker threads
* WASM execution
* Cloud execution
* Distributed multi-device execution

All controlled declaratively via `@scripts`.

---

# Summary

RAR (Reactive Agnostic Runtime) is:

* A reactive runtime system
* Schema-based
* Modular
* Cross-domain (UI, 2D, 3D, Audio, Animation)
* Environment-agnostic
* Engine-managed lifecycle driven
* Fully declarative

It unifies rendering, logic, state, input, and execution into one structured runtime architecture.

---

# The 5 Pillars of RAR

## 1. Flat Memory, Hierarchical Logic

All instances live in a flat 1D array inside the Engine's RAM.

Hierarchy is maintained strictly through `parentRef`.

This enables:

* Deterministic event bubbling
* Efficient garbage collection
* Predictable memory traversal
* Cache-friendly runtime behavior

---

## 2. Agnostic Rendering

The engine does not render.

It:

* Loads assets via `@design`
* Creates a runtime context (`ctx`)
* Hands control to the `@bind` script

The `@bind` script returns the view layer (e.g., DOM node, 3D mesh, canvas object, etc.).

Rendering responsibility belongs entirely to the script layer.

---

## 3. Unified State

There is no separation between "props" and "internal state".

Both are merged into a single `@state` block.

Reactivity is explicit and push-based via:

* `.subscribe()`
* `.unsubscribe()`
* `.set()`
* `.get()`

There is no hidden diffing or virtual DOM.

---

## 4. The Gearbox (Dual-Drive Execution)

RAR supports two execution modes:

### Reactive Drive (Push)

* Executes on state changes
* Executes on inputs
* Executes on events

### Continuous Drive (Pull)

* Executes via `@pulse`
* Runs inside strictly budgeted CPU lanes

Pulse lanes:

* `express`
* `fast`
* `normal`
* `background`
* `idle`

This creates deterministic CPU scheduling and prevents uncontrolled execution.

---

## 5. Focus-Chain Input

Hardware events are mapped globally to logical Actions.

The engine routes the Action to the Primary Focus node.

If not consumed:

* The event bubbles upward via `parentRef`
* Stops when consumed
* Stops at root

This creates a predictable, controlled input hierarchy.

---

# Architecture Execution Flow

## 1. Boot Phase

The RAR Engine reads the `@instance` JSON.

---

## 2. Pre-Flight

The Asset Loader fetches required assets (models, templates, audio, etc.) into memory.

---

## 3. Instantiation

The RARContext is created.

It:

* Resolves relative `@instance` references
* Establishes parent relationships
* Builds the garbage collection registry

---

## 4. Mount

The `@bind` script executes.

It:

* Wires `.subscribe()` push events
* Connects inputs and events
* Returns the view layer

---

## 5. Runtime – Push Phase

Triggered by:

* Global state changes
* Hardware inputs
* Custom widget events

State mutations occur instantly without hidden diffing.

---

## 6. Runtime – Pull Phase

The Master Loop fires approximately every 16ms.

It:

* Iterates through `express`, `fast`, `normal`, and `background` lanes
* Evaluates scheduled scripts
* Enforces a strict time budget (e.g., 8ms per frame)
* Prevents frame drops and CPU spikes

---

## 7. Interaction

Hardware inputs are mapped to Actions.

The engine:

1. Routes Action to Primary Focus node
2. Executes matching `@inputs` handler
3. Bubbles upward if not consumed

---

## 8. Destruction

If a parent is destroyed:

* Engine cascades down the hierarchy
* Executes `@unbind`
* Releases all associated assets
* Purges memory deterministically

---

## 9. Architectural Outcome

RAR combines:

* The reactive clarity of modern web frameworks
* The deterministic performance of C++/Rust game engines
* Explicit lifecycle control
* Strict memory boundaries
* Fully declarative runtime structure

This results in a predictable, high-performance, reactive runtime suitable for UI systems, simulations, interactive tools, and game engines.
