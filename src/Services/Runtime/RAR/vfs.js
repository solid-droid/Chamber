import { Debug } from './debug.js';

export class VFS {
    constructor() {
        this.store = new Map();
    }
    
    write(path, content) {
        this.store.set(path, content);
        Debug.log(`Written to VFS`, 'sys', path);
    }
    
    async read(path) {
        // Simulate network latency minimally
        return new Promise(resolve => {
            setTimeout(() => resolve(this.store.get(path)), 5);
        });
    }
}