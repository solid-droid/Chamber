import htmlText from './MenuBar.html?raw';
import './MenuBar.css';
export class MenuBar {
  constructor(element, params={}) {
    this.widgetName = 'UI-MenuBar';
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