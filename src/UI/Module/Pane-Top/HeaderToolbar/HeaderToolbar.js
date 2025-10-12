import htmlText from './HeaderToolbar.html?raw';
import './HeaderToolbar.css';

export class HeaderToolbar {
  constructor(element, params={}) {
    this.widgetName = 'UI-HeaderToolbar';
    this.element = $(element);
    this.htmlText = htmlText;
    this.htmlDOM = null;
    this.params = params;
    this.render();
  }

  render() {
    this.htmlDOM = $(this.htmlText);
    this.element.append(this.htmlDOM);
  }

  show() {
    this.element.show();
  }
  hide() {
    this.element.hide();
  }


}