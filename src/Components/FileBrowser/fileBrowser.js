import './fileBrowser.css';
export class FileBrowser {
    constructor(element, options = {}) {
        this.containerElement = $(element);
        this.containerElement.append($('#fileBrowserTemplate').html());
        this.data = options.data || [];

        this.allowMultiSelect = options.allowMultiSelect || false;
        this.allowCheckbox = options.allowCheckbox || false;
        this.onSelect = options.onSelect || (()=>{});
        this.onExpandCollapse = options.onExpandCollapse || (()=>{});

        this.container = this.containerElement.find('.fileTree');
        this.container.addClass('chamberFileBrowser');
        this.dataMap = {};
        
        this.parseData();
        this.loadFiles();

    }

    parseData(data = this.data) {
        if(!data?.length)
            return;

        data.forEach(node => {
            this.dataMap[node.path] = node;
            if (node?.children?.length) {
                this.parseData(node.children);
            }
        });
    }

    loadFiles(path = '', parent = this.container, isRoot = true) {
        let dataList = this.getDataList(path)?.sort(x => x.type === 'group' ? -1 : 1);
        if(!dataList)
            return;
        
        let fileList = this.createFileList(dataList , isRoot);
        parent.append(fileList);
        dataList.forEach(node => {
            if (node.tree_meta?.expanded) {
                this.loadFiles(node.path, fileList.find('.file-item[data-path="' + node.path + '"]'), false);
            }
        });
        this.attachEventListeners();
    }
    
    getDataList(path) {
        if (path === '') {
            return this.data;
        }
        let node = this.dataMap[path];
        if (node && node.children) {
            return node.children;
        }
        return [];
    }

    attachEventListeners() {
        this.container.find('.file-item').off('click').on('click', (e) => {
            let item = $(e.currentTarget);
            let targetClass = e.target.classList;
            //add entity button
            if(targetClass.contains('addEntity')) {
                e.stopPropagation();
                alert(`Add entity to ${item.text().trim()}`);
                return;
            } 
            
            if(item.data('path') === $(e.target).closest('.file-item').data('path') ) {
                //expand/collapse folder or category
                if(targetClass.contains('caret') &&this.dataMap[item.data('path')].children?.length) {
                    this.expandCollapse(item);
                    return;
                }
                
                //select or deselect item
                if(['file-name','file-icon', 'file-details'].some(cls => targetClass.contains(cls))) {
                    
                    let currentTarget = item.find('.file-details');
                    if(this.allowMultiSelect && e.ctrlKey) {
                        // multi-selection with Ctrl key
                        if(currentTarget.hasClass('selected')) {
                            currentTarget.removeClass('selected');
                            this.dataMap[item.data('path')].tree_meta.selected = false;
                        } else {
                            currentTarget.addClass('selected');
                            this.dataMap[item.data('path')].tree_meta.selected = true;
                        }
                        this.onSelect?.(Object.valuse(this.dataMap).filter(x => x.tree_meta.selected));
                    } else {
                        // Single selection
                        this.container.find('.file-item').each((_, el) => {
                            if($(el).data('path') === item.data('path')) {
                                $(el).children('.file-details').addClass('selected');
                                this.dataMap[$(el).data('path')].tree_meta.selected = true;
                            }else{
                                $(el).children('.file-details').removeClass('selected');
                                this.dataMap[$(el).data('path')].tree_meta.selected = false;
                            }
                        });
                        this.onSelect?.(this.dataMap[item.data('path')]);
                    }
                }
            }
            
        });
        this.container.find('.file-item').off('dblclick').on('dblclick', (e) => {
            let item = $(e.currentTarget);
            let targetClass = e.target.classList;
            
            //expand/collapse folder or category
            if(item.data('path') === $(e.target).closest('.file-item').data('path') ) {
                if(['file-name','file-icon', 'file-details'].some(cls => targetClass.contains(cls)) && this.dataMap[item.data('path')].children?.length) {
                    this.expandCollapse(item);
                }
            }
            
        });
    }

    expandCollapse(item){
        if(!this.dataMap[item.data('path')].tree_meta.expanded) {
            // Load child files
            this.dataMap[item.data('path')].tree_meta.expanded = true;
            this.loadFiles(item.data('path'), item, false);
            item.addClass('expanded');
            item.children('.file-details').children('.caret').addClass('fa-caret-down');
            item.children('.file-details').children('.caret').removeClass('fa-caret-right');
        }else{
            // Remove child files
            this.dataMap[item.data('path')].tree_meta.expanded = false;
            item.find('.file-list').remove();
            item.removeClass('expanded');
            item.children('.file-details').children('.caret').addClass('fa-caret-right');
            item.children('.file-details').children('.caret').removeClass('fa-caret-down');
        }
        this.onExpandCollapse?.(this.dataMap[item.data('path')], item);
    }
    createFileList(list = [], isRoot = false) {
        let fileList = $(`<div class="file-list ${!isRoot ? 'children' : ''}"></div>`);
        list.forEach(node => {

            let _expanded = node.tree_meta.expanded ? 'expanded': '';
            let _selected = node.tree_meta.selected ? 'selected' : ''; 
            let _nodeName = `<span class="file-name" title="${node.name}">${node.alias && node.alias.length ? node.alias : node.name}</span>`;
            let _nodeIcon = node.tree_meta.icon ? `<i class="file-icon ${node.tree_meta.icon}"></i>` : '';
            let _caretIcon = node.children?.length ? !node.tree_meta.expanded ? '<i class="fa-solid fa-caret-right caret"></i>'  : '<i class="fa-solid fa-caret-down caret"></i>' : '<i class="caret"></i>';
            
            let _actionButtons = [];
            node.tree_meta.actionButtons?.forEach(x => {
                _actionButtons.push(this.createActionButton(x));
            });

            const fileItem = $(`
            <div class="file-item" data-path="${node.path}">
                <div class="file-details  ${_expanded} ${_selected}">
                    ${_caretIcon} 
                    ${_nodeIcon}${_nodeName}  
                </div>
            </div>`);

            _actionButtons.forEach(btn => {
                fileItem.find('.file-details').append(btn);
            });

            fileList.append(fileItem);

        });

        return fileList;
    }


    createActionButton(button){
        let _hover = button.hover ? 'onHover' : ''; 
        let _dom = $(`<i class="${button.class} ${_hover}" title="${button.title}"></i>`);
        if(button.click) {
            _dom.off('click').on('click', (e) => {
                e.stopPropagation();
                button.click(e, this.dataMap[$(e.currentTarget).closest('.file-item').data('path')]);
            });
        }
        return _dom;
    }

    reload(data){
        this.data = data;
        this.dataMap = {};
        this.container.empty();
        this.parseData();
        this.loadFiles();
    }
}
