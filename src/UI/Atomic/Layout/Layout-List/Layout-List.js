import { HTML } from '../../../Helper/HTML';
import * as templateHtml from './Layout-List.html?raw';
import * as styleText from './Layout-List.css?raw';

export class Layout_List extends HTMLElement {
    #propertyList = {
        class: '',
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['class'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.#propertyList[name] = newValue;
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const stylesheet = `<style>${styleText.default}</style>`;
        const innerHtml = HTML(templateHtml.default, {
            className: this.#propertyList.class,
            list: this.list || []
        });
        this.innerHTML = innerHtml + stylesheet;
    }

    data(list = []){
        this.list = list;
        this.render();
    }
}