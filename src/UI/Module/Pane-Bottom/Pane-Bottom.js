import { Empty } from './Empty/Empty';
import { FooterToolbar } from './FooterToolbar/FooterToolbar';
import './Pane-Bottom.css';

export class PaneBottom {
  constructor(params={}) {
    this.identifier = 'UI-Pane-Bottom';
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
        'Empty': (el,params) => new Empty(el,params),
        'FooterToolbar': (el,params) => new FooterToolbar(el,params),
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