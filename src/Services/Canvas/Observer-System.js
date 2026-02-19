export class ObserverSystem {
  constructor() {
    this.globalSubscribers = new Set();
    this.entitySubscribers = new Map();
    this.memory = {
      geometries: 0,
      textures: 0,
      total: 0
    };
  }

  notifyGlobal(scene) {
    this.globalSubscribers.forEach(cb => cb(scene));
    this.updateMemory(scene);
  }

  updateMemory(scene) {
    if (scene) {
      this.memory.geometries = scene.getGeometries().length;
      this.memory.textures = scene.textures.length;
      this.memory.total = this.memory.geometries + this.memory.textures;
    }
  }

  notifyEntity(name, entity) {
    if (this.entitySubscribers.has(name)) {
      this.entitySubscribers.get(name).forEach(cb => cb(entity));
    }
  }

  subscribe(target, callback) {
    if (typeof target === 'function') {
      this.globalSubscribers.add(target);
    } else {
      const names = Array.isArray(target) ? target : [target];
      names.forEach(name => {
        if (!this.entitySubscribers.has(name)) this.entitySubscribers.set(name, new Set());
        this.entitySubscribers.get(name).add(callback);
      });
    }
  }

  unsubscribe(target, callback) {
    if (typeof target === 'function') {
      this.globalSubscribers.delete(target);
    } else {
      const names = Array.isArray(target) ? target : [target];
      names.forEach(name => {
        if (this.entitySubscribers.has(name)) {
          this.entitySubscribers.get(name).delete(callback);
          if (this.entitySubscribers.get(name).size === 0) this.entitySubscribers.delete(name);
        }
      });
    }
  }
}