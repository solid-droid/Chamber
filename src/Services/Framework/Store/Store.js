/** @type {import('./types').IStore} */

/** @type {any} */
const _data = new Map();
const _listeners = new Map();

const StoreBase = {
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
    inspect() {
        return Object.fromEntries(_data);
    },
    clear() {
        _data.clear();
        _listeners.clear();
        return Store;
    }
};

export const Store = new Proxy(StoreBase, {
    get(target, prop) {
        if (prop === 'then') return undefined; // Async fix
        if (prop in target) return target[prop];
        return _data.get(prop);
    },
    set(target, prop, value) {
        if (prop === 'subscribe' || prop === 'clear') return false;

        const prev = _data.get(prop);
        
        // Create a deep copy if value is an object/array to break memory reference
        const newValue = (value && typeof value === 'object') 
            ? structuredClone(value) 
            : value;

        // Simple identity check. Note: for deep objects, 
        // this checks if the reference is the same unless you add a deepEqual helper.
        if (prev === newValue) return true;

        _data.set(prop, newValue);

        const list = _listeners.get(prop);
        if (list) {
            // Callback now receives (current_copy, previous_copy)
            list.forEach(cb => cb(newValue, prev));
        }
        
        return true;
    }
});