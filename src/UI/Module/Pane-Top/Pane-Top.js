import './Pane-Top.css';
import { HeaderToolbar } from './HeaderToolbar/HeaderToolbar.js';

export class PaneTop {
  constructor(params={}) {
    this.identifier = 'UI-Pane-Top';
    this.class = params.class ?? '';
    this.element = $(`<div class="${this.identifier} ${this.class}"></div>`);
    this.isVisible = params.isVisible ?? true;
    this.height = params.height ?? 10; 
    this.type = params.type ?? 'empty'; // 'empty', 'header-bar', etc.
    this.setPaneWidget(this.type);
    this.render();
  }

    setPaneWidget(type) {
       let widget = { 
        'Empty': el => new Empty(el),
        'HeaderToolbar': el => new HeaderToolbar(el),
        }[type];

        this.widget = widget ? widget(this.element) : new Empty(this.element);

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