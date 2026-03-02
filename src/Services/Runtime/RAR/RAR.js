import { Debug } from './debug.js';
import { VFS } from './vfs.js';
import { RAREngine } from './engine.js';
import { createStore } from '@Store';

export class RAR {
    constructor() {
        this.vfs = new VFS();
        this.Store = createStore('Store');             // Global Reactive Store
        this.StateBuffer = createStore('StateBuffer'); // Isolated Buffer Store
        this.engine = new RAREngine(this.vfs, this.Store, this.StateBuffer);
    }

    async boot() {
        Debug.log("RAR Boot Initiated", "info");
        await this.engine.init();
    }

    async mount(widgetRef) {
        const ctx = await this.engine.createInstance(widgetRef);
        return ctx.view; // Returns agnostic view layer (DOM node in this environment)
    }
}