import { HTML } from '../../../Helper/HTML';
import * as templateHtml from './Input.html?raw';
import * as styleText from './Input.css?raw';

export class Input extends HTMLElement {
    #propertyList = {
        class: '',
        value: '',
        type: '',
        size: 'm',
        width: 'auto',
        placeholder: ''
    }

    #inputElement;

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['class', 'value', 'type','width', 'size', 'placeholder'];
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

    disconnectedCallback() {
        if (this.#inputElement) {
            this.#inputElement.off('input', this.#handleInputChange);
        }
    }

    #handleInputChange = (e) => {
        this.#propertyList.value = e.target.value;

        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true,
            detail: { value: e.target.value }
        }));
    };

    render() {
        const style = this.#propertyList.width !== 'auto' ? `style="max-width: ${this.#propertyList.width};"` : '';
        const stylesheet = `<style>${styleText.default}</style>`;
        
        this.innerHTML = HTML(templateHtml.default, {
            value: this.#propertyList.value, 
            type: this.#propertyList.type, 
            className: this.#propertyList.class,
            style: style,
            placeholder: this.#propertyList.placeholder
        });
        this.innerHTML += stylesheet;

        this.#inputElement = $(this).find('input');
        
        if (this.#inputElement) {
            this.#inputElement.on('input', this.#handleInputChange);
        }
    }
}