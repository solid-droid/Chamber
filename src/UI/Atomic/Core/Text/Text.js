import { HTML } from '../../../HTML';
import * as templateHtml from './Text.html?raw';
import * as styleText from './Text.css?raw';

export class Text extends HTMLElement {
    #propertyList = {
        class: '',
        size: 'm', // es, s, m, l, el
        text: '',
        width: 'auto',
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['class', 'size', 'text', 'width'];
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

        const style = this.#propertyList.width !== 'auto' ? `style="max-width: ${this.#propertyList.width};"` : '';
        const stylesheet = `<style>${styleText.default}</style>`;
        const innerHtml = HTML(templateHtml.default, {
            text: this.#propertyList.text, 
            size: this.#propertyList.size, 
            className: this.#propertyList.class,
            style: style
        });
        this.innerHTML = innerHtml + stylesheet;
    }
}