import { MenuBar } from './MenuBar/MenuBar.js';
import { Empty } from './Empty/Empty.js';
import './Pane-Left.css';
export class PaneLeft {
  constructor(params={}) {
    this.identifier = 'UI-Pane-Left';
    this.class = params.class ?? '';
    this.element = $(`<div class="${this.identifier} ${this.class}"></div>`);
    this.isVisible = params.isVisible ?? true;
    this.width = params.width ?? 300; 
    this.type = params.type ?? 'empty'; // 'empty', 'menu-bar', etc.
    this.setPaneWidget(this.type);
    this.render();
  }

    setPaneWidget(type) {
       let widget = { 
        'Empty': el => new Empty(el),
        'MenuBar': el => new MenuBar(el),
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