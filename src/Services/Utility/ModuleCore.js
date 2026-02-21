import { Store } from '@Store';
import { Log } from '@Log';

export class ModuleCore {
    constructor(namespace) {
        this._namespace = namespace; 
        this._pluginClasses = new Map(); // Registered classes
        this._instances = new Map();     // Live memory instances
        this._action = null;             // Tracks 'add', 'update', 'get', 'remove'

        this._proxy = new Proxy(this, {
            get: (target, prop, receiver) => {
                // 0. Secret trap to bypass the proxy and get the raw class instance
                if (prop === '_raw') return target;

                // 1. Intercept verbs to set the action
                if (['add', 'update', 'get', 'remove'].includes(prop)) {
                    target._action = prop;

                    // NEW: Return a dual-purpose Proxy.
                    // It acts as an object for chaining (e.g., .add.scene)
                    // AND as a function for direct calls (e.g., .update(options))
                    return new Proxy(function() {}, {
                        apply: (_, __, args) => {
                            target._action = null; // Consume the verb
                            // If the underlying class has this method (like instance.update()), call it
                            if (typeof target[prop] === 'function') {
                                return target[prop].apply(target, args);
                            }
                            return receiver; // Safe fallback
                        },
                        get: (_, pluginProp) => {
                            // Forward chaining back to the main Proxy
                            return receiver[pluginProp];
                        }
                    });
                }

                // 2. Intercept registered plugins (e.g., .scene, .canvas)
                if (typeof prop === 'string' && target._pluginClasses.has(prop)) {
                    return (name, options) => {
                        const action = target._action || 'smart';
                        target._action = null; // Reset for next chain link
                        return target._executePlugin(prop, action, name, options);
                    };
                }

                // 3. Fallback to native class methods/properties
                if (prop in target) {
                    return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
                }

                return undefined;
            }
        });

        return this._proxy;
    }

    registerPlugin(name, pluginClass) {
        this._pluginClasses.set(name, pluginClass);
        return this._proxy; 
    }

    _executePlugin(pluginName, action, identifier, options) {
        // Automatically resolve objects (like HTML elements) into a string ID for the store
        let name = identifier;
        if (typeof identifier === 'object' && identifier !== null) {
            name = identifier.id || identifier.dataset?.coreId || `auto_${Math.random().toString(36).substring(2, 9)}`;
            if (identifier.dataset && !identifier.dataset.coreId) {
                identifier.dataset.coreId = name;
            }
        }

        const instanceKey = `${pluginName}_${name}`;
        const storeKey = `${this._namespace}.${pluginName}s.${name}`;
        
        let instance = this._instances.get(instanceKey);

        // Smart GET fallback
        if (action === 'smart' && instance && options === undefined) action = 'get';

        // --- REMOVE ---
        if (action === 'remove') {
            if (instance) {
                const rawInstance = instance._raw || instance;
                if (typeof rawInstance.dispose === 'function') rawInstance.dispose();
                this._instances.delete(instanceKey);
                Store[storeKey] = null; // Clear from state store
                Log.info(`Removed ${pluginName}: ${name}`);
            }
            return this._proxy; 
        }

        // --- GET ---
        if (action === 'get') return instance;

        // Sync options to Store (safe for structuredClone)
        if (options) {
            Store[storeKey] = { ...(Store[storeKey] || {}), ...options };
        }

        // --- UPDATE ---
        if (instance) {
            if (action === 'add') Log.warn(`${pluginName} '${name}' exists. Updating instead.`);
            
            // Bypass proxy verbs using _raw to safely call the internal class method
            const rawInstance = instance._raw || instance;
            if (typeof rawInstance.update === 'function') {
                rawInstance.update(options);
            }
            
            Log.info(`Updated ${pluginName}: ${name}`);
            return instance;
        } 
        
        // --- ADD ---
        if (action === 'update') Log.warn(`${pluginName} '${name}' missing. Creating instead.`);
        
        const PluginClass = this._pluginClasses.get(pluginName);
        instance = new PluginClass(identifier, options || {}, this._proxy); 
        
        this._instances.set(instanceKey, instance);
        Store[storeKey] = options || {}; // Initialize empty state if no options
        
        Log.success(`Created ${pluginName}: ${name}`);

        // ASYNC FIX: If the new plugin has a 'ready' promise, return a chainable promise
        if (instance.ready instanceof Promise) {
            return instance.ready.then(() => instance);
        }

        return instance;
    }
}