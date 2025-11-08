import * as Template from './AppLeftMenu.html?raw';
import './AppLeftMenu.css';
import { HTML } from '../../../Helper/HTML';
export class AppLeftMenu {
    constructor(element, options = {}){
        this.element = $(element);
        this.options = options;
        this.render();
    }


    render(){
        let _html = HTML(Template.default,{
            value: this.value || '',
            placeholder: this.entity ? `Search ${this.entity}` : ''
        });
        this.dom = $(_html);
        this.detachEvents();
        this.element.find('.AppLeftMenu').remove();
        this.element.append(this.dom);
        if(this.entity === 'project'){
            this.element.find('ui-layout-tree')[0].data([
                {icon: "fa-solid fa-ticket", label:'Project1', type:'project', expanded:true,
                    children:[
                        {icon: "fa-solid fa-cube", label:'node1', type:'node'},
                        {icon: "fa-solid fa-cube", label:'node2', type:'node'},
                    ]
                },
                {icon: "fa-solid fa-ticket", label:'project2',  type:'project'}
            ])
        }
        this.attachEvents();
    }

    activate(value){
        if(!value)
            return;
        this.entity = value;
        this.render();
    }

    detachEvents(){
        const self = this;
        self.element.find('ui-input-search').off('search');
    }
    attachEvents(){
        const self = this;
        self.element.find('ui-input-search').off('search').on('search', (e)=>{
            self.value = e.detail.value;
        });
    }
}