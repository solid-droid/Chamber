import { HTML } from '../../../Helper/HTML';
import * as templateHtml from './Icon.html?raw';
import * as styleText from './Icon.css?raw';

export class Icon extends HTMLElement {
    #propertyList = {
        class: '',
        size: 'm', // es, s, m, l, el
        icon: '',
    }
    
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['class', 'size', 'icon'];
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
        const style = `<style>${styleText.default}</style>`;
        const innerHtml = HTML(templateHtml.default, {icon: this.#propertyList.icon, size: this.#propertyList.size, className: this.#propertyList.class});
        this.innerHTML = innerHtml + style;
    }
}