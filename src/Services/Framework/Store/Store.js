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
        if (prev === value) return true;
        _data.set(prop, value);
        const list = _listeners.get(prop);
        if (list) list.forEach(cb => cb(value, prev));
        return true;
    }
});