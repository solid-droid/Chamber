import { HTML } from '../../../Helper/HTML';
import * as styleText from './Button.css?raw';
import * as templateHtml from './Button.html?raw';

export class Button extends HTMLElement {
    #observer;
    #boundHandleMutations; // New private field for the bound function
    #propertyList = {
        class: '',
        type: 'primary',
        title: ''
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' })
        this.#boundHandleMutations = this.#handleMutations.bind(this);
    }

    connectedCallback() {
        this.render();
        this.#startObserving();
    }

    static get observedAttributes() {
        return ['class', 'type', 'title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.#propertyList[name] = newValue;
            this.render();
        }
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleClick, true);
        this.#stopObserving();
    }

    render() {
        const wasObserving = this.#observer && this.#observer.takeRecords().length === 0;
        this.#stopObserving(); 
        this.shadowRoot.innerHTML = '';

        const style = document.createElement('style');
        style.textContent = styleText.default;
        this.shadowRoot.appendChild(style);

        const innerHtml = HTML(templateHtml.default, {
            type: this.#propertyList.type, 
            className: this.#propertyList.class,
            title: this.#propertyList.title
        });
        const template = document.createElement('template');
        template.innerHTML = innerHtml;
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        if (wasObserving) {
            this.#startObserving();
        }
    }

    #handleMutations(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                
            }
        }
    }

    #startObserving() {
        if (!this.#observer) {
            this.#observer = new MutationObserver(this.#boundHandleMutations);
        }

        const config = { 
            childList: true,
            subtree: true,
            characterData: true,
            attributes: false
        };

        this.#observer.observe(this, config);
    }

    #stopObserving() {
        if (this.#observer) {
            this.#observer.disconnect();
        }
    }
}