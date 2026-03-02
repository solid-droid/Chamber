/**
 * @typedef {Object} StoreMeta
 * @property {boolean} [reactive=true] - Whether changes should notify subscribers
 * @property {boolean} [arrayBuffer=false] - Whether to initialize/enforce an ArrayBuffer
 */

/**
 * Creates a reactive proxy-based store.
 * @param {string} storeName - Name for logging/debugging purposes
 * @returns {any} Proxy Store object
 */
export function createStore(storeName = 'Store') {
    const _data = new Map();
    const _listeners = new Map();
    const _meta = new Map();

    const StoreBase = {
        /**
         * Subscribes to changes on a specific key.
         * @param {string} key 
         * @param {function} callback - Receives (newVal, oldVal)
         * @returns {function} Unsubscribe function
         */
        subscribe(key, callback) {
            if (!_listeners.has(key)) _listeners.set(key, new Set());
            _listeners.get(key).add(callback);
            return () => {
                const list = _listeners.get(key);
                if (list) {
                    list.delete(callback);
                    if (list.size === 0) _listeners.delete(key);
                }
            };
        },
        
        /**
         * Explicitly registers a state key with optional metadata.
         * @param {string} key 
         * @param {any} initialValue - Provide a number for ArrayBuffer length if arrayBuffer: true
         * @param {StoreMeta} meta 
         */
        register(key, initialValue, meta = {}) {
            if (!_data.has(key)) {
                let val = initialValue;

                // Handle ArrayBuffer initialization if requested
                if (meta.arrayBuffer) {
                    if (typeof initialValue === 'number') {
                        val = new ArrayBuffer(initialValue); // initialValue acts as byteLength
                    } else if (!(initialValue instanceof ArrayBuffer)) {
                        console.error(`[${storeName}] Invalid ArrayBuffer init value for ${key}`);
                    }
                }

                _data.set(key, val);
                _meta.set(key, meta);
            }
        },

        inspect() {
            return Object.fromEntries(_data);
        },

        clear() {
            _data.clear();
            _listeners.clear();
            _meta.clear();
            return this;
        }
    };

    return new Proxy(StoreBase, {
        get(target, prop) {
            if (prop === 'then') return undefined; // Promise/Async fix
            if (prop in target) return target[prop]; // Return base methods if called
            return _data.get(prop);
        },
        set(target, prop, value) {
            if (prop in target) return false; // Prevent overwriting StoreBase methods (subscribe, register, etc.)

            // Auto-register if not explicitly registered yet
            if (!_data.has(prop)) {
                target.register(prop, value);
                return true;
            }

            const meta = _meta.get(prop) || {};

            // Type guard to ensure ArrayBuffers aren't overwritten by normal types
            if (meta.arrayBuffer && !(value instanceof ArrayBuffer)) {
                console.error(`[${storeName}] Error: '${prop}' expects an ArrayBuffer`);
                return true;
            }

            const prev = _data.get(prop);
            
            // Create a deep copy if value is an object/array to break memory reference.
            // (Skip cloning if it's an arrayBuffer to prevent unintended heavy memory allocation)
            const newValue = (value && typeof value === 'object' && !meta.arrayBuffer) 
                ? structuredClone(value) 
                : value;

            if (prev === newValue) return true; // No change detected

            _data.set(prop, newValue);

            // Notify listeners unless explicitly marked non-reactive
            if (meta.reactive !== false) {
                const list = _listeners.get(prop);
                if (list) {
                    list.forEach(cb => cb(newValue, prev));
                }
            }
            
            return true;
        }
    });
}

// Export a default global instance for convenience
export const Store = createStore('GlobalStore');


/* =========================================================================
 * 🛠️ EXAMPLES OF HOW TO USE THE STORE
 * =========================================================================

import { createStore, Store } from './store.js';

// ---------------------------------------------------------
// 1. Basic Usage (Auto-registration on Set)
// ---------------------------------------------------------
Store.username = "Alice"; // Automatically registers 'username' as reactive
console.log(Store.username); // "Alice"


// ---------------------------------------------------------
// 2. Subscribing to Changes
// ---------------------------------------------------------
const unsubscribe = Store.subscribe('score', (newVal, oldVal) => {
    console.log(`Score changed from ${oldVal} to ${newVal}`);
});

Store.score = 100; // Triggers: "Score changed from undefined to 100"
Store.score = 200; // Triggers: "Score changed from 100 to 200"

unsubscribe(); // Stop listening when no longer needed


// ---------------------------------------------------------
// 3. Explicit Registration with Metadata (ArrayBuffer)
// ---------------------------------------------------------
// Passing a number as the initial value initializes an ArrayBuffer of that byte length
Store.register('audioData', 1024, { arrayBuffer: true, reactive: false });

console.log(Store.audioData.byteLength); // 1024
Store.audioData = "string"; // Console Error: 'audioData' expects an ArrayBuffer


// ---------------------------------------------------------
// 4. Using Multiple Isolated Stores (e.g., RAR Architecture)
// ---------------------------------------------------------
const RARStore = createStore('RARState');
const StateBuffer = createStore('StateBuffer');

RARStore.health = 100; // Reactive UI State
StateBuffer.register('positions', 512, { arrayBuffer: true, reactive: false }); // Fast, silent memory


// ---------------------------------------------------------
// 5. Deep Cloning Protection
// ---------------------------------------------------------
Store.config = { theme: 'dark' };

// Retrieving an object returns a clone, protecting internal state
const myConfig = Store.config;
myConfig.theme = 'light'; 

console.log(Store.config.theme); // still 'dark' (Store remains unmutated by external reference)

// To update it properly:
Store.config = { theme: 'light' }; // Now it triggers updates

========================================================================= */