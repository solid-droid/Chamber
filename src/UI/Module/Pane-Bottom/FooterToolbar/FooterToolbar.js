import htmlText from './FooterToolbar.html?raw';
import './FooterToolbar.css';
export class FooterToolbar {
  constructor(element, params={}) {
    this.widgetName = 'UI-FooterToolbar';
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