import { Log } from '@Log';

export class FactoryBase {
    // Uses hasOwnProperty so each child class (Light, Mesh, Camera) 
    // gets its own isolated registry map automatically.
    static get registry() {
        if (!this.hasOwnProperty('_registry')) {
            this._registry = new Map();
        }
        return this._registry;
    }

    static register(type, classRef) {
        this.registry.set(type, classRef);
        Log.info(`Registered '${type}' to ${this.name} Factory`);
    }

    static extensions(){
        return Array.from(this.registry.keys());
    }

    // The magical constructor that intercepts instantiation and routes 
    // it to the correct registered sub-class
    constructor(name, options = {}, parent) {
        const type = options.type || this.constructor.defaultType;
        const ClassRef = this.constructor.registry.get(type);

        if (!ClassRef) {
            Log.warn(`${this.constructor.name} type '${type}' not found. Falling back to Base.`);
            const Fallback = this.constructor.FallbackBase;
            return new Fallback(name, options, parent);
        }

        // Returns the targeted class instance instead of the Factory wrapper
        return new ClassRef(name, options, parent);
    }
}