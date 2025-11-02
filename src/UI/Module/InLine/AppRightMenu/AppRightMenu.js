import * as Template from './AppRightMenu.html?raw';
import './AppRightMenu.css';
export class AppRightMenu {
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