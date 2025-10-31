import { HTML } from '../../../HTML';
import * as templateHtml from './Text.html?raw';

export class Text extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const innerHtml = HTML(templateHtml.default, {text: this.innerHTML});
        this.innerHTML = innerHtml;
    }
}