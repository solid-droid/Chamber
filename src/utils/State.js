export class State {
    _data = undefined;
    _listeners = new Map(); // A Map to store event types and their associated callbacks

    constructor(data) {
        this._data = data;
    }

    get value() {
        return this._data;
    }

    set value(val) {
        // Only trigger 'change' if the value is actually different
        if (this._data !== val) {
            const oldValue = this._data; // Store old value for potential use in callbacks
            this._data = val;
            // Emit the 'change' event
            this._emit('change', val, oldValue);
        }
    }

    /**
     * Registers a callback function for a specific event type.
     * @param {string} eventType - The type of event to listen for (e.g., 'change').
     * @param {function} callback - The function to call when the event is emitted.
     */
    on(eventType, callback) {
        if (typeof callback !== 'function') {
            console.warn(`Attempted to register a non-function callback for event '${eventType}'.`);
            return;
        }

        if (!this._listeners.has(eventType)) {
            this._listeners.set(eventType, []);
        }
        this._listeners.get(eventType).push(callback);
    }

    /**
     * Removes a specific callback function for a given event type.
     * If no callback is provided, all callbacks for that event type are removed.
     * @param {string} eventType - The type of event.
     * @param {function} [callback] - The specific function to remove.
     */
    off(eventType, callback) {
        if (!this._listeners.has(eventType)) {
            return; // No listeners for this event type
        }

        if (callback) {
            // Remove a specific callback
            const callbacks = this._listeners.get(eventType);
            this._listeners.set(eventType, callbacks.filter(cb => cb !== callback));
        } else {
            // Remove all callbacks for this event type
            this._listeners.delete(eventType);
        }
    }

    /**
     * Internal method to emit an event and call all registered callbacks.
     * @param {string} eventType - The type of event to emit.
     * @param {...any} args - Arguments to pass to the callbacks.
     */
    _emit(eventType, ...args) {
        if (this._listeners.has(eventType)) {
            // Create a copy of the array before iterating to prevent issues
            // if listeners are added/removed during emission.
            [...this._listeners.get(eventType)].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event listener for '${eventType}':`, error);
                }
            });
        }
    }
}