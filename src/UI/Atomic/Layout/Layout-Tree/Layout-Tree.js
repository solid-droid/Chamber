import { HTML } from '../../../Helper/HTML';
import * as templateHtml from './Layout-Tree.html?raw';
import * as contentTemplateHtml from './Layout-Tree-Content.html?raw';
import * as styleText from './Layout-Tree.css?raw';

export class Layout_Tree extends HTMLElement {
    #propertyList = {
        class: '',
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['class'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.#propertyList[name] = newValue;
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const stylesheet = `<style>${styleText.default}</style>`;
        const content = Layout_Tree.generateContent(this.tree);
        const innerHtml = HTML(templateHtml.default, {
            className: this.#propertyList.class,
            content: content
        });
        this.detachEvent();
        this.innerHTML = innerHtml + stylesheet;
        this.attachEvents();
    }

    detachEvent(){
        $(this).find('.tree-collapse-expand').off('click');
    }
    attachEvents(){
        $(this).find('.tree-collapse-expand').on('click', e =>{
            let path = $(e.currentTarget).parent().data().path;
            path = path.split('/').slice(1);
            let entry = Layout_Tree.findDeep({children:this.tree}, path);
            entry.expanded = entry.expanded ? false : true;
            this.render();
        })
    }

    static findDeep(value,path){
        value = value?.children?.find(x => x.label = path[0]) || value;
        path = path.slice(1);
        if(!path.length)
            return value;
        
        Layout_Tree.findDeep(value.children, path);
    }

    static generateContent(tree, path='root'){
        if(!tree || !tree.length)
            return '';

        let content = '';
        tree.forEach(item => {
            let _path = path + '/' + item.label;
            let childContent = Layout_Tree.generateContent(item.children, _path);
            item.childContent = childContent;
            item.path = _path;
            let itemHTML = HTML(contentTemplateHtml.default, {item});
            content+=itemHTML;
        });
        return content;
    }

    data(tree = []){
        this.tree = tree;
        this.render();
    }

    select(path = []){

    }
}