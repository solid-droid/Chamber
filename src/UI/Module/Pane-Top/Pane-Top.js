import './Pane-Top.css';
import { HeaderToolbar } from './HeaderToolbar/HeaderToolbar.js';

export class PaneTop {
  constructor(params={}) {
    this.identifier = 'UI-Pane-Top';
    this.class = params.class ?? '';
    this.element = $(`<div class="${this.identifier} ${this.class}"></div>`);
    this.isVisible = params.isVisible ?? true;
    this.type = params.type ?? 'empty'; // 'empty', 'header-bar', etc.
    this.params = params;
    this.setPaneWidget(this.type);
    this.render();
  }

    setPaneWidget(type) {
       let widget = { 
        'Empty': (el, params) => new Empty(el, params),
        'HeaderToolbar': (el, params) => new HeaderToolbar(el, params),
        }[type];

        this.widget = widget ? widget(this.element, this.params) : new Empty(this.element, this.params);

    }

    render() {
        if (this.isVisible) {
            this.widget.show();
        } else {
            this.widget.hide();
        }
    }

    destroy() {
        this.widget.destroy();
        this.element.remove();
        this.widget = null;
    }


}