import * as Template from './AppLeftMenu.html?raw';
import './AppLeftMenu.css';
import { HTML } from '../../../Helper/HTML';
import { generateMap } from '../../../Helper/Utils';
export class AppLeftMenu {

    dataArr = {
        project:[],
        nodes:[],
        datastore:[],
        service:[],
        package:[]
    }

    dataMap = {
        project:{},
        nodes:{},
        datastore:{},
        service:{},
        package:{}
    }

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
        this.element.find('ui-layout-tree')[0].data(this.dataArr[this.entity], this.dataMap[this.entity])
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
        self.element.find('ui-layout-tree').off('change');
    }
    attachEvents(){
        const self = this;
        self.element.find('ui-input-search').off('search').on('search', e=>{
            self.value = e.detail.value;
        });
        self.element.find('ui-layout-tree').on('change', e => {
            //  self.dataMap[]
        })
    }

    data(value){
        const self = this;
        Object.entries(value).forEach(([entity, _data]) => {
            self.dataArr[entity] = _data;
            self.dataMap[entity] = generateMap('name', self.dataArr[entity])
        });
    }
}