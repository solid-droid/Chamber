import { HTML } from '../../../Helper/HTML';
import * as templateHtml from './Layout-Tree.html?raw';
import * as contentTemplateHtml from './Layout-Tree-Content.html?raw';
import * as styleText from './Layout-Tree.css?raw';

export class Layout_Tree extends HTMLElement {
    #propertyList = {
        class: '',
        lazy: 'false',
    }
    #dataArr = [];
    #dataMap = {};
    #initialCount = 100;
    #loadIncrement = 50;
    
    // New state map to track lazy loading for any node by its path
    #lazyStateMap = {}; // Stores { path: { renderedCount: number, observer: IntersectionObserver | null, totalCount: number } }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['class', 'lazy'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.#propertyList[name] = newValue;
            if (name === 'lazy' && this.#dataArr.length > 0) {
                 this.render();
            } else if (name !== 'lazy') {
                this.render();
            }
        }
    }

    connectedCallback() {
        this.attachEvents(); 
        this.render();
    }

    // --- Core Lazy Loading Logic ---

    // Helper to get the data array and the associated container element by path
    _getDataInfoByPath(path) {
        if (!path) {
            return { 
                data: this.#dataArr, 
                container: $(this).find('.Layout-Tree'),
                totalCount: this.#dataArr.length
            };
        }
        
        const item = this.#dataMap[path];
        if (item && item.children) {
            // Find the correct .tree-item-children container for this path
            const $item = $(this).find(`.tree-item-main[data-path="${path}"]`).parent();
            const $container = $item.children('.tree-item-children');
            return { 
                data: item.children, 
                container: $container,
                totalCount: item.children.length
            };
        }
        return { data: [], container: $(), totalCount: 0 };
    }

    loadMore(path) {
        const isLazy = this.#propertyList.lazy === 'true';
        if (!isLazy) return;

        const info = this.#lazyStateMap[path];
        if (!info || info.renderedCount >= info.totalCount) {
            this.disconnectObserver(path);
            return;
        }

        const { data, container } = this._getDataInfoByPath(path);
        if (!container.length) return;

        const start = info.renderedCount;
        const end = Math.min(info.totalCount, start + this.#loadIncrement);
        
        // Slice the next batch of nodes
        const newNodes = data.slice(start, end);
        // Generate content without lazy loading children recursively (that's handled on expand)
        const newHtml = Layout_Tree.generateContent(newNodes, this.#dataMap, path);
        
        // Append new HTML to the specific container
        container.append(newHtml);
        
        info.renderedCount = end;
        
        if (info.renderedCount < info.totalCount) {
             this.setupObserver(path);
        } else {
             this.disconnectObserver(path);
        }
    }
    
    disconnectObserver(path) {
        const info = this.#lazyStateMap[path];
        if (info && info.observer) {
            info.observer.disconnect();
            info.observer = null;
        }
    }

    setupObserver(path) {
        this.disconnectObserver(path);

        const info = this.#lazyStateMap[path];
        if (!info || info.renderedCount >= info.totalCount) return;

        const { container } = this._getDataInfoByPath(path);
        if (!container.length) return;

        // The root element for the observer is the specific parent container
        const rootElement = container[0];

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If the sentinel (last item) is visible, load more
                if (entry.isIntersecting) {
                    this.loadMore(path);
                }
            });
        }, {
            root: rootElement.parentElement.parentElement, // Use the component root for observing (to ensure one scrollbar)
            rootMargin: '0px',
            threshold: 0.1
        });
        
        // Find the last item that was just appended inside the specific container
        const $lastItem = container.children('.tree-item').last();
        if ($lastItem.length) {
            observer.observe($lastItem[0]);
            info.observer = observer;
        }
    }

    // --- Rendering and Initialization ---

    _initialRenderBatch(dataArr, path) {
        const isLazy = this.#propertyList.lazy === 'true';
        const totalCount = dataArr.length;
        let initialData = dataArr;
        let renderedCount = totalCount;

        if (isLazy && totalCount > this.#initialCount) {
            initialData = dataArr.slice(0, this.#initialCount);
            renderedCount = initialData.length;
        }
        
        // Update the lazy state map
        this.#lazyStateMap[path] = {
            renderedCount: renderedCount,
            observer: null,
            totalCount: totalCount
        };

        const content = Layout_Tree.generateContent(initialData, this.#dataMap, path); 

        // Set up observer if lazy loading is active and more nodes exist
        if (isLazy && renderedCount < totalCount) {
            setTimeout(() => this.setupObserver(path), 0); // Need to wait for DOM insertion
        }

        return content;
    }

    render(change = null) {
        // Disconnect all existing observers on full render
        Object.keys(this.#lazyStateMap).forEach(p => this.disconnectObserver(p));
        this.#lazyStateMap = {};

        const stylesheet = `<style>${styleText.default}</style>`;
        let now = performance.now();
        
        // Root level (path is null) initial rendering
        this.content = this._initialRenderBatch(this.#dataArr, null);

        const innerHtml = HTML(templateHtml.default, {
            className: this.#propertyList.class,
            content: this.content || ''
        });

        this.innerHTML = innerHtml + stylesheet; 
        
        console.log('dom',performance.now() - now)
    }

    // --- Event Handling (Surgical Update) ---

    attachEvents(){
        const self = this;

        $(self).on('click', '.tree-collapse-expand', function(e){
            const $target = $(e.currentTarget);
            const $main = $target.parent();
            const $item = $main.parent();
            let path = $main.data().path;
            let entry = self.#dataMap[path];

            entry.expanded = !entry.expanded; 
            const $childrenContainer = $item.children('.tree-item-children');

            if (entry.expanded) {
                $item.addClass('expanded'); 
                $target.attr('icon', 'fa-solid fa-caret-down');

                // Check if children exist and have NOT been rendered yet
                if (entry.children && entry.children.length && !$childrenContainer.length) {
                    
                    // 🚀 INITIAL LAZY LOAD FOR CHILDREN
                    const newChildContent = self._initialRenderBatch(entry.children, path);
                    const childrenHtml = `<div class="tree-item-children">${newChildContent}</div>`;
                    $item.append(childrenHtml);
                }

            } else {
                $item.removeClass('expanded');
                $target.attr('icon', 'fa-solid fa-caret-right');
                $childrenContainer.remove();
                
                // 🛑 CLEAN UP: Disconnect observer and remove state when collapsing
                self.disconnectObserver(path);
                delete self.#lazyStateMap[path];
            }

            const changeDetail = { expanded: entry.expanded };
            self.dispatchEvent(new CustomEvent('expand_collapse', { detail: { item: entry, path: path, change: changeDetail } }));
            self.dispatchEvent(new CustomEvent('change', { detail: { item: entry, path: path, change: changeDetail } }));
        });

        $(self).on('click', '.tree-item-label', function(e){
            const $main = $(e.currentTarget).parent();
            let path = $main.data().path;
            let entry = self.#dataMap[path];

            entry.selected = !entry.selected;
            
            $main.toggleClass('selected', entry.selected);
            
            const changeDetail = { selected: entry.selected };
            self.dispatchEvent(new CustomEvent('change', { detail: { item: entry, path: path, change: changeDetail } }));
        });
    }

    // --- Content Generation (No Lazy Slicing Here) ---
    static generateContent(tree, dataMap, parentPath=null){
        if(!tree || !tree.length)
            return '';

        let content = '';
        tree.forEach(item => {
            let _path = parentPath ? parentPath + '/' + item.name : item.name;
            if (dataMap) {
                dataMap[_path] = item;
            }
            
            // Only generate children content if the item is explicitly expanded
            // This is for efficiency, as the expand handler will render the actual lazy content
            let childContent = item.expanded ? Layout_Tree.generateContent(item.children, dataMap, _path) : '';
            
            item.childContent = childContent;
            item.path = _path;
            
            let itemHTML = HTML(contentTemplateHtml.default, {item});
            item.html = itemHTML;
            content+=itemHTML;
        });
        return content;
    }

    data(arr = [], map={}){
        this.#dataArr = arr;
        this.#dataMap = map;
        this.render();
    }

    select(path = ''){
        
    }
}