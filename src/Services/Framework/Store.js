class Store {
  constructor() {
    if (!Store.instance) {
      this._data = new Map();
      this._listeners = new Map();
      Store.instance = this;
    }
    return Store.instance;
  }

  set(key, value) {
    const prevValue = this._data.get(key);
    if (prevValue === value) return;

    this._data.set(key, value);

    const keyListeners = this._listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(callback => callback(value, prevValue));
    }
  }

  get(key) {
    return this._data.get(key);
  }

  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    this._listeners.get(key).add(callback);
    return () => this.unsubscribe(key, callback);
  }

  unsubscribe(key, callback) {
    const keyListeners = this._listeners.get(key);
    if (keyListeners) {
      keyListeners.delete(callback);
      if (keyListeners.size === 0) {
        this._listeners.delete(key);
      }
    }
  }

  clear() {
    this._data.clear();
    this._listeners.clear();
  }
}

const instance = new Store();
Object.freeze(instance);

export default instance;