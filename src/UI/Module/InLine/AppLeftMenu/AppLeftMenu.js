import * as Template from './AppLeftMenu.html?raw';
import './AppLeftMenu.css';
export class AppLeftMenu {
    constructor(element, options = {}){
        this.dom = $(Template.default);
        this.element = element;
        this.options = options;
        
        $(element).append(this.dom);
        this.render();
        this.bindEvents();

    }


    render(){

    }

    bindEvents(){
        const self = this;
        
    }
}