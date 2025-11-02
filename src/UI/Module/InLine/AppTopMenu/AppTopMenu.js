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

        this.dom.find('ui-button.projects').on('click', function(){
            self.options.onProjects();
        });

        this.dom.find('ui-button.nodes').on('click', function(){
            self.options.onNodes();
        });

        this.dom.find('ui-button.datastore').on('click', function(){
            self.options.onDatastore();
        });

        this.dom.find('ui-button.services').on('click', function(){
            self.options.onServices();
        });
        this.dom.find('ui-button.packages').on('click', function(){
            self.options.onPackages()
        });

        this.dom.find('ui-button.workflow').on('click', function(){
            self.options.onWorkflow()
        });
    }

    markButtonActive(buttonName, active = true){
        this.dom.find(`ui-button.${buttonName}`).toggleClass('active', active);
    }

    markAllMenuButton(active = false){
        this.markAllLeftMenuButton(active);
        this.markAllRightMenuButton(active);
    }

    markAllRightMenuButton(active = false){
        this.dom.find('ui-button.workflow').toggleClass('active', active);
    }

    markAllLeftMenuButton(active = false){
        this.dom.find('ui-button.projects').toggleClass('active', active);
        this.dom.find('ui-button.nodes').toggleClass('active', active);
        this.dom.find('ui-button.datastore').toggleClass('active', active);
        this.dom.find('ui-button.services').toggleClass('active', active);
        this.dom.find('ui-button.packages').toggleClass('active', active);
    }
}