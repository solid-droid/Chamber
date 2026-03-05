import { RAR } from '@/Services/Runtime/RAR/RAR';
import { Store } from '@Store';
export class Blueprint {
    constructor(DOM, options = {}) {
        this.DOM = $(DOM);
        this.options = options;
        this.init();
    }

    async init() {
        const rarDOM = await this.RAR_demo();
        console.log('RAR Demo DOM:', rarDOM);
        this.DOM.append(rarDOM);
    }

}