import { Empty } from './Empty/Empty.js';
import './Pane-Right.css';
import { RightPaneToolbar } from './RightPaneToolbar/RightPaneToolbar.js';
export class PaneRight {
  constructor(params={}) {
    this.params = params;
    this.identifier = 'UI-Pane-Right';
    this.class = params.class ?? '';
    this.element = $(`<div class="${this.identifier} ${this.class}"></div>`);
    this.isVisible = params.isVisible ?? true;
    this.type = params.type ?? 'empty'; // 'empty', 'menu-bar', etc.
    this.setPaneWidget(this.type);
    this.render();
  }

    setPaneWidget(type) {
       let widget = { 
        'Empty': (el,params) => new Empty(el, params),
        'RightPaneToolbar': (el,params) => new RightPaneToolbar(el, params),
        }[type];

        this.widget = widget ? widget(this.element,  this.params) : new Empty(this.element,  this.params);

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