import Runtime from './Runtime.js';
import Logic from './logic.js';
import Memory from './memory.js';
import Relation from './relation.js';
function ZeroRuntime() {
    let runtime = new Runtime();
    let logic = new Logic();
    let memory = new Memory();
    let relation = new Relation();
    return {
        runtime,
        logic,
        memory,
        relation
    }
}

export {
    ZeroRuntime,
}