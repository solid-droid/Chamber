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
    #dataMap = {}; // Memory-lazy map: Stores only currently visible/expanded nodes
    #initialCount = 100;
    #loadIncrement = 50;
    
    // State map to track lazy loading for any node by its path
    #lazyStateMap = {}; // Stores { path: { loadedCount: number, observer: IntersectionObserver | null, total: number } }

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

    // Standardizing root path to '' (empty string)
    _getDataInfoByPath(path) {
        // Root path is ''
        if (!path) {
            return { 
                data: this.#dataArr, 
                container: $(this).find('.Layout-Tree'),
                total: this.#dataArr.length
            };
        }
        
        const item = this.#dataMap[path];
        if (item && item.children && Array.isArray(item.children)) {
            // Find the correct .tree-item-children container for this path
            const $item = $(this).find(`.tree-item-main[data-path="${path}"]`).parent();
            const $container = $item.children('.tree-item-children');
            return { 
                data: item.children, 
                container: $container,
                total: item.children.length
            };
        }
        return { data: [], container: $(), total: 0 };
    }

    loadMore(path) {
        const isLazy = this.#propertyList.lazy === 'true';
        if (!isLazy) return;

        const info = this.#lazyStateMap[path];
        if (!info || info.loadedCount >= info.total) {
            this.disconnectObserver(path);
            return;
        }

        const { data, container } = this._getDataInfoByPath(path);
        if (!container.length) return;

        const start = info.loadedCount;
        const end = Math.min(info.total, start + this.#loadIncrement);
        
        const newNodes = data.slice(start, end);
        const newHtml = this._generateBatchContent(newNodes, path);
        
        container.append(newHtml);
        
        info.loadedCount = end;
        
        if (info.loadedCount < info.total) {
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
        if (!info || info.loadedCount >= info.total) return;

        const { container } = this._getDataInfoByPath(path);
        if (!container.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadMore(path);
                }
            });
        }, {
            root: this,
            rootMargin: '0px',
            threshold: 0.1
        });
        
        const $lastItem = container.children('.tree-item').last();
        if ($lastItem.length) {
            observer.observe($lastItem[0]);
            info.observer = observer;
        }
    }

    // --- Content Generation (Clones item before decoration) ---

    // Maps the nodes in 'tree' to #dataMap and generates HTML for the batch
    _generateBatchContent(tree, parentPath=''){ 
        if(!tree || !Array.isArray(tree) || !tree.length)
            return '';

        let content = '';
        tree.forEach(item => {
            // Path creation
            let _path = parentPath ? parentPath + '/' + item.name : item.name; 
            
            // 1. Store the reference to the original item in the map (MEMORY/DATA-LAZY)
            this.#dataMap[_path] = item; 
            
            const isExpanded = item.expanded === true;
            const isSelected = item.selected === true;
            
            // 2. Create a shallow copy (templateData) for rendering properties.
            const templateData = { ...item }; 

            templateData.path = _path;
            templateData.expandedClass = isExpanded ? 'expanded' : '';
            templateData.selectedClass = isSelected ? 'selected' : '';

            // 3. Populate childContent on the templateData object.
            let childContentHtml = '';

            // STATE RESTORATION: Controlled recursion to restore visible children
            if (isExpanded && item.children && Array.isArray(item.children) && item.children.length) {
                // Call batch renderer for the children. This is the only place recursion happens on load.
                const childrenBatchContent = this._initialRenderBatch(item.children, _path);
                
                // Content is unwrapped here, relying on contentTemplateHtml to wrap it during full render.
                childContentHtml = childrenBatchContent; 
            }

            templateData.childContent = childContentHtml;
            
            let itemHTML = HTML(contentTemplateHtml.default, {item: templateData});
            content+=itemHTML;
        });
        return content;
    }

    // --- Rendering and Initialization ---

    // Entry point for initial render and state restoration of an expanded branch
    _initialRenderBatch(dataArr, path = '') { 
        if (!dataArr || !Array.isArray(dataArr) || !dataArr.length) {
            return '';
        }

        const isLazy = this.#propertyList.lazy === 'true';
        const totalCount = dataArr.length;
        let initialData = dataArr;
        let loadedCount = totalCount;

        if (isLazy && totalCount > this.#initialCount) {
            initialData = dataArr.slice(0, this.#initialCount);
            loadedCount = initialData.length;
        }
        
        // Setup state map for the current level (path)
        this.#lazyStateMap[path] = {
            loadedCount: loadedCount,
            observer: null,
            total: totalCount
        };

        // Generates HTML and maps the batch of nodes currently being rendered
        const content = this._generateBatchContent(initialData, path); 

        // Set up observer only if more data needs to be loaded
        if (isLazy && loadedCount < totalCount) {
            // Deferred setup to ensure DOM is ready
            setTimeout(() => this.setupObserver(path), 0);
        }

        return content;
    }

    render(change = null) {
        // Disconnect all observers and clear maps before full re-render
        Object.keys(this.#lazyStateMap).forEach(p => this.disconnectObserver(p));
        this.#lazyStateMap = {};
        this.#dataMap = {}; // CRITICAL: Enforce data-laziness by clearing all indexed nodes

        const stylesheet = `<style>${styleText.default}</style>`;
        
        // Root level (path is '') initial rendering
        this.content = this._initialRenderBatch(this.#dataArr, '');

        const innerHtml = HTML(templateHtml.default, {
            className: this.#propertyList.class,
            content: this.content || ''
        });

        this.innerHTML = innerHtml + stylesheet; 
    }

    // --- Event Handling (Surgical Update) ---

    attachEvents(){
        const self = this;

        // Delegated click handler for expand/collapse
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
                if (entry.children && Array.isArray(entry.children) && entry.children.length && !$childrenContainer.length) {
                    
                    // INITIAL LAZY LOAD FOR CHILDREN (This indexes the children into #dataMap)
                    const newChildContent = self._initialRenderBatch(entry.children, path);
                    
                    // The click handler must manually add the wrapper for surgical DOM update.
                    const childrenHtml = `<div class="tree-item-children">${newChildContent}</div>`;
                    $item.append(childrenHtml);
                }

            } else {
                $item.removeClass('expanded');
                $target.attr('icon', 'fa-solid fa-caret-right');
                $childrenContainer.remove();
                
                // CLEAN UP: Disconnect observer and remove state when collapsing
                self.disconnectObserver(path);
                delete self.#lazyStateMap[path];
                // Note: Children are *not* removed from #dataMap here for speed, 
                // but are guaranteed to be cleared on the next full render().
            }

            const changeDetail = { expanded: entry.expanded };
            self.dispatchEvent(new CustomEvent('expand_collapse', { detail: { item: entry, path: path, change: changeDetail } }));
            self.dispatchEvent(new CustomEvent('change', { detail: { item: entry, path: path, change: changeDetail } }));
        });

        // Delegated click handler for selection
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

    data(arr = [], map={}){
        this.#dataArr = arr;
        // The component builds its internal map (#dataMap) based on the visible nodes in the array.
        this.render();
    }

    select(path = ''){
        // Placeholder for future programmatic select functionality
    }
}