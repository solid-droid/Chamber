import * as Template from './AppTopMenu.html?raw';
import './AppTopMenu.css';
export class AppTopMenu{
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

    setTitle(title){
        this.dom.find('ui-button.project ui-text').text(title);
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
        this.dom.find('ui-button.theme').on('click', function(){
            if(self.options.onTheme){
                self.options.onTheme();
            }
        });

    }
}