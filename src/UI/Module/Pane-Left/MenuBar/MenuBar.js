import htmlText from './MenuBar.html?raw';
import './MenuBar.css';
export class MenuBar {
  constructor(element, params={}) {
    this.widgetName = 'UI-MenuBar';
    this.element = $(element);
    this.htmlText = htmlText;
    this.htmlDOM = null;
    this.params = params;
    this.params.minimized ??= false;
    this.render();
  }

  render() {
    this.element.empty();
    this.htmlDOM = $(this.htmlText);
    this.element.append(this.htmlDOM);
    this.attachEvents();
    this.setState();
  }

  attachEvents(){
    let self = this;
    //resize (minimize/maximize)
    this.element.find('.more').off('click').on('click', (e) => {
      self.params.minimized = !self.params.minimized;  
      self.setState(self);
      self.params.onResize?.(self.params.minimized);
    });
  }

  setState(self = this){
    if(self.params.minimized){
      self.element.find('.expanded').hide();
      self.element.find('.more > i').removeClass('fa-caret-left')
      self.element.find('.more > i').addClass('fa-caret-right')
    } else {
      self.element.find('.expanded').delay(200).fadeIn(100);
      self.element.find('.more > i').removeClass('fa-caret-right')
      self.element.find('.more > i').addClass('fa-caret-left')
    }
  }

  show() {
    this.element.show();
  }
  hide() {
    this.element.hide();
  }


}