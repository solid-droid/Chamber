export default class Entity {
    constructor(entityMap = {}) {
        this.entityMap = entityMap;
    }

    getEntity(name, type) {
       let output = null;
        if (!type) {
            output = [];
            for (const t in this.entityMap) {
                if (this.entityMap[t][name]) {
                    output.push(this.entityMap[t][name].entity);
                }
            }
            if (output.length === 0) {
                return null;
            }
            if (output.length === 1) {
                return output[0]; 
            } else {
                return output; 
            }
        }
        if (this.entityMap[type] && this.entityMap[type][name]) {
            return this.entityMap[type][name].entity;
        } else {
            return null;
        }
    }

    setEntity(name, type, entity, options = {}) {
        this.entityMap[type] ??= {};
        this.entityMap[type][name] = { entity, options };
    }
}
