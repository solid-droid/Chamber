import { Debug } from './debug.js';

export class RAREngine {
    constructor(vfs, store, stateBuffer) {
        this.vfs = vfs;
        this.Store = store;
        this.StateBuffer = stateBuffer;
        
        // Flat Memory, Hierarchical Logic
        this.instances = new Map();
        this.instanceCounter = 0;
        this.focusedInstanceId = null;
        
        // Hardware Input Map (Global Actions)
        this.inputMap = {}; 

        // The Gearbox (Continuous Drive)
        this.gearbox = {
            lanes: {
                express: { hz: 120, ms: 1000/120, last: 0, tasks: new Map() },
                fast: { hz: 60, ms: 1000/60, last: 0, tasks: new Map() },
                normal: { hz: 10, ms: 1000/10, last: 0, tasks: new Map() },
                background: { hz: 0.2, ms: 1000/0.2, last: 0, tasks: new Map() },
            },
            running: false,
            pulseCount: 0
        };

        this._setupInputListeners();
    }

    async init() {
        // Load global hardware input mappings
        const globalInput = await this.vfs.read('@input/global');
        if (globalInput) this.inputMap = globalInput;
        
        this._startGearbox();
        Debug.log(`Engine Boot Sequence Complete`, 'sys', `Gearbox Engaged`);
    }

    // Gearbox Loop (The Pull Phase)
    _startGearbox() {
        this.gearbox.running = true;
        
        // Pulse stats tracker
        setInterval(() => {
            const elPulses = document.getElementById('stats-pulses');
            const elInstances = document.getElementById('stats-instances');
            if (elPulses) elPulses.innerText = `Pulses/sec: ${this.gearbox.pulseCount}`;
            if (elInstances) elInstances.innerText = `Instances: ${this.instances.size}`;
            this.gearbox.pulseCount = 0;
        }, 1000);

        const loop = (now) => {
            if (!this.gearbox.running) return;
            const budgetStart = performance.now();
            const budgetLimit = 8; // 8ms max per frame

            for (const [laneName, lane] of Object.entries(this.gearbox.lanes)) {
                if (now - lane.last >= lane.ms) {
                    lane.last = now;
                    for (const [id, task] of lane.tasks.entries()) {
                        task();
                        this.gearbox.pulseCount++;
                        if (performance.now() - budgetStart > budgetLimit) break;
                    }
                }
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // Instantiation Flow
    async createInstance(widgetRef, parentId = null) {
        Debug.log(`Instantiating Widget`, 'info', widgetRef);
        const schema = await this.vfs.read(widgetRef);
        if (!schema) throw new Error(`Schema not found: ${widgetRef}`);

        const id = `@instance/#${++this.instanceCounter}`;
        
        // Build Context
        const ctx = {
            id,
            schema,
            parentId,
            Store: this.Store,
            StateBuffer: this.StateBuffer,
            engine: this, // Allow scripts to access engine API safely
            view: null
        };

        // Register State
        if (schema['@state']) {
            for (const [key, config] of Object.entries(schema['@state'])) {
                this.Store.register(key, config.value, config.meta);
            }
        }

        // Register State Buffer (usually simple raw values, mapped to non-reactive configs)
        if (schema['@stateBuffer']) {
            for (const [key, value] of Object.entries(schema['@stateBuffer'])) {
                const initialVal = (value !== null && typeof value === 'object' && 'value' in value) ? value.value : value;
                this.StateBuffer.register(key, initialVal, { reactive: false });
            }
        }

        // Push to flat memory
        this.instances.set(id, ctx);

        // Run Preflight
        if (schema['@preflight']) {
            const preflight = await this.vfs.read(schema['@preflight'].Ref);
            if (preflight) await preflight(ctx);
        }

        // Mount / Bind
        if (schema['@bind']) {
            const bindScript = await this.vfs.read(schema['@bind'].Ref);
            if (bindScript) {
                ctx.view = await bindScript(ctx);
            }
        }

        // Schedule Continuous Scripts (Gearbox)
        if (schema['@scripts']) {
            schema['@scripts'].forEach(async s => {
                if (s['@pulse'] && this.gearbox.lanes[s['@pulse']]) {
                    const scriptFn = await this.vfs.read(s.Ref);
                    if (scriptFn) {
                        this.gearbox.lanes[s['@pulse']].tasks.set(`${id}_${s.Ref}`, () => scriptFn(ctx));
                        Debug.log(`Scheduled Pulse`, 'sys', `${id} -> ${s['@pulse']} lane`);
                    }
                }
            });
        }

        // Focus root or self
        if (!parentId) this.focusedInstanceId = id;

        // Instantiate Children recursively
        if (schema['@widgets']) {
            for (const childConfig of schema['@widgets']) {
                const childCtx = await this.createInstance(childConfig.Ref, id);
                
                // DOM specific assembly - IF views are HTML Elements
                if (ctx.view instanceof HTMLElement && childCtx.view instanceof HTMLElement) {
                    const mountPoint = ctx.view.querySelector('[data-rar-children]') || ctx.view;
                    mountPoint.appendChild(childCtx.view);
                }
            }
        }

        return ctx;
    }

    async destroyInstance(id) {
        const ctx = this.instances.get(id);
        if (!ctx) return;

        Debug.log(`Destroying Instance`, 'warn', id);

        // Destroy children first (cascade)
        for (const [childId, childCtx] of this.instances.entries()) {
            if (childCtx.parentId === id) await this.destroyInstance(childId);
        }

        // Run unbind
        if (ctx.schema['@unbind']) {
            const unbindScript = await this.vfs.read(ctx.schema['@unbind'].Ref);
            if (unbindScript) await unbindScript(ctx);
        }

        // Unschedule Gearbox tasks
        for (const lane of Object.values(this.gearbox.lanes)) {
            for (const key of lane.tasks.keys()) {
                if (key.startsWith(`${id}_`)) lane.tasks.delete(key);
            }
        }

        // Remove DOM node
        if (ctx.view && ctx.view.parentNode) {
            ctx.view.parentNode.removeChild(ctx.view);
        }

        // Clear from memory
        this.instances.delete(id);
    }

    // Input System
    _setupInputListeners() {
        window.addEventListener('keydown', (e) => {
            // Match hardware to action
            const hardwareKey = `Keyboard_${e.code === 'Space' ? 'Space' : e.key.toUpperCase()}`;
            const mappings = this.inputMap[hardwareKey]?.onPress;
            
            if (mappings) {
                mappings.forEach(m => {
                    if (m.active) this._dispatchAction(m['@input']);
                });
            }
        });
    }

    async _dispatchAction(actionName) {
        Debug.log(`Action Triggered`, 'event', actionName);
        
        let currentId = this.focusedInstanceId;
        while (currentId) {
            const ctx = this.instances.get(currentId);
            if (!ctx) break;

            const actionConfig = ctx.schema['@inputs']?.[actionName];
            if (actionConfig && actionConfig.active !== false) {
                const script = await this.vfs.read(actionConfig.Ref);
                if (script) {
                    script(ctx);
                    Debug.log(`Action Handled`, 'sys', `By ${currentId}`);
                    if (actionConfig.consume) return; // Stop bubbling
                }
            }
            currentId = ctx.parentId; // Bubble up
        }
        Debug.log(`Action Unconsumed`, 'warn', actionName);
    }
}