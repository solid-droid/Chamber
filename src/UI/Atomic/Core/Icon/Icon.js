import { HTML } from '../../../HTML';
import * as templateHtml from './Icon.html?raw';

export class Icon extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const innerHtml = HTML(templateHtml.default, {iconClass: this.innerHTML});
        this.innerHTML = innerHtml;
    }
}