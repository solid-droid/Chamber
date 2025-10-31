import * as Template from './AppBottomMenu.html?raw';
import './AppBottomMenu.css';
export class AppBottomMenu{
    constructor(element, options = {}){
        this.dom = $(Template.default);
        this.element = element;
        this.options = options;
        
        this.onClose = options.onClose || function(){};
        this.onMinimize = options.onMinimize || function(){};
        this.onTheme = options.onTheme || function(){};

        $(element).append(this.dom);
        this.render();
        this.bindEvents();

    }

    render(){

    }

    bindEvents(){
        const self = this;
        this.dom.find('ui-button.minimize').on('click', function(){
            self.onMinimize();
        });
        this.dom.find('ui-button.close').on('click', function(){
            self.onClose();
        });
        this.dom.find('ui-button.Theme').on('click', function(){
            if(self.options.onTheme){
                self.options.onTheme();
            }
        });

    }
}