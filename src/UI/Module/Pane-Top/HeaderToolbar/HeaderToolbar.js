import htmlText from './HeaderToolbar.html?raw';
import './HeaderToolbar.css';
import { getWindow } from '../../../../Services/System/Framework/Tauri';

export class HeaderToolbar {
  constructor(element, params={}) {
    this.widgetName = 'UI-HeaderToolbar';
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
    this.element.find('.more').off('click').on('click', () => {
      self.params.minimized = !self.params.minimized;  
      self.setState(self);
      self.params.onResize?.(self.params.minimized);
    });

    this.element.find('.minimize').off('click').on('click', async () => {
        await getWindow().minimize();
    });
    
    this.element.find('.close').off('click').on('click', async () => {
        await getWindow().close();
    });
  }

  setState(self = this){
    if(self.params.minimized){
      self.element.find('.expanded').fadeOut();
            self.element.find(`.${self.widgetName}`).removeClass('ExpandedMode');
      self.element.find('.more > i').removeClass('fa-caret-up')
      self.element.find('.more > i').addClass('fa-caret-down')
    } else {
      self.element.find('.expanded').fadeIn(100);
            self.element.find(`.${self.widgetName}`).addClass('ExpandedMode');
      self.element.find('.more > i').removeClass('fa-caret-down')
      self.element.find('.more > i').addClass('fa-caret-up')
    }
  }

  show() {
    this.element.show();
  }
  hide() {
    this.element.hide();
  }


}