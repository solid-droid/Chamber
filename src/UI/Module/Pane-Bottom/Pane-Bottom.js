import { Empty } from './Empty/Empty';
import { FooterToolbar } from './FooterToolbar/FooterToolbar';
import './Pane-Bottom.css';

export class PaneBottom {
  constructor(params={}) {
    this.identifier = 'UI-Pane-Bottom';
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
        'FooterToolbar': el => new FooterToolbar(el),
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