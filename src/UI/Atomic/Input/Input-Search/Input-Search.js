import { HTML } from '../../../Helper/HTML';
import * as templateHtml from './Input-Search.html?raw';
import * as styleText from './Input-Search.css?raw';
import { debounce } from '../../../Helper/Utils';

export class Input_Search extends HTMLElement {
    #propertyList = {
        class: '',
        value: '',
        placeholder:''
    }

    #uiInput = null;
    #debouncedSearchHandler;

    constructor() {
        super();
        this.#debouncedSearchHandler = debounce(this.#handleInput, 400);
    }

    static get observedAttributes() {
        return ['class', 'value', 'placeholder'];
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
        this.#removeListeners(); 
    }

    #removeListeners() {
        if (this.#uiInput) {
            this.#uiInput.off('change', this.#debouncedSearchHandler);
            this.#uiInput = null; // Clear the reference
        }
    }

    #handleInput = (e) => {
        if(!e || !e.detail)
            return;

        const searchValue = e.detail.value;
        this.#propertyList.value = searchValue;
        this.dispatchEvent(new CustomEvent('search', {
            bubbles: true,
            composed: true,
            detail: { value: searchValue }
        }));
    };

    #attachListeners() {
        this.#uiInput = $(this).find('ui-input');

        if (this.#uiInput) {
            // Attach the listener using the stored debounced function reference
            this.#uiInput.on('change', this.#debouncedSearchHandler);
        }
    }

    render() {
        const stylesheet = `<style>${styleText.default}</style>`;
        const innerHtml = HTML(templateHtml.default, {
            value: this.#propertyList.value, 
            className: this.#propertyList.class,
            placeholder:this.#propertyList.placeholder
        });
        
        // 1. Clean up old listeners before overwriting innerHTML
        this.#removeListeners(); 

        // 2. Update the DOM
        this.innerHTML = innerHtml + stylesheet;

        // 3. Re-attach listeners to the newly created elements
        this.#attachListeners();
    }
}