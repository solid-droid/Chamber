import htmlText from './FooterToolbar.html?raw';
import './FooterToolbar.css';
export class FooterToolbar {
  constructor(element, params={}) {
    this.widgetName = 'UI-FooterToolbar';
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
      self.element.find('.more > i').removeClass('fa-caret-down')
      self.element.find('.more > i').addClass('fa-caret-up')
    } else {
      self.element.find('.expanded').delay(200).fadeIn(100);
      self.element.find('.more > i').removeClass('fa-caret-up')
      self.element.find('.more > i').addClass('fa-caret-down')
    }
  }

  show() {
    this.element.show();
  }
  hide() {
    this.element.hide();
  }


}