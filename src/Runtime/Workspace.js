import { JsonVersioning } from "../utils/JsonVersioning";
import { downloadFile, removeDuplicate } from "../utils/utils";
import {getCodeEditor, getDevLog, getNodeTree, setWorkspace} from '../Runtime/global';
import { buildTree } from "./TreeManager";
import {
    icons,
    projectDefault,
    COMPONENTS,
    Canvas3D_entries,
    Canvas2D_entries,
    WebView_entries,
    Audio_entries,
    Datastore_entries,
    Scripts_entries,
    Automation_entries,
    showHideTypes
} from './defaults';

export class Workspace{
    selectedNodePath = '';
    setCodePath = null;
    set SelectedNode(node){
        this.selectedNodePath = node.path;
        this.updateSelectedNode(node);
    }
    get SelectedNode(){
        return this.treeMap?.[this.selectedNodePath];
    }
    
    #anchorProjectPath;
    set anchorProject(path){
        this.#anchorProjectPath = path;
    }
    get anchorProject(){
        return this.workspaceTree[this.#anchorProjectPath];
    }

    constructor(options = {}) {
        this.options = options;
        this.groupNodeIcon = options.groupNodeIcon || 'fa-solid fa-layer-group';
        this.groupNodeIcon += ' groupNodeIcon';
        
        this.onCanvasClick = options.onCanvasClick || (() => {});
        this.onLoadStart = options.onLoadStart || (() => {});
        this.onLoadComplete = options.onLoadComplete || (() => {});
        this.onChange = options.onChange || (() => {});
        this.workspace = new JsonVersioning();
    }
    async init(workspaceData, filePath = null) {
        this.filePath = filePath;
        this.data = workspaceData;
        this.onLoadStart();
        this.clearAll();
        this.data && this.workspace.setVersionFile(this.data);
        this.createFileSystem(null);
        this.selectDefaultNode();
        this.onLoadComplete();
    }

    /* FileSystem */
    selectDefaultNode(){
        //default node logic is pending, adding anchor project as default node
        this.treeMap[this.#anchorProjectPath].tree_meta.selected = true;
        this.selectedNodePath = this.#anchorProjectPath;
    }
    createFileSystem(oldTreeMap = this.treeMap, commit = true){
        let data = this.workspace.getData() || {};
        const nodeArray = Object.values(data);
        const systemNodes = [
            ...COMPONENTS.map(x => ({...x, type:'Component'})),
            ...Canvas3D_entries.map(x => ({...x, type:'Entity'})), 
            ...Canvas2D_entries.map(x => ({...x,type:'Entity'})),
            ...WebView_entries.map(x => ({...x, type:'Entity'})),
            ...Audio_entries.map(x => ({...x, type:'Entity'})),
            ...Datastore_entries.map(x => ({...x, type:'Entity'})),
            ...Scripts_entries.map(x => ({...x, type:'Entity'})),
            ...Automation_entries.map(x => ({...x, type:'Entity'})),
        ];
        let allNodes = [...nodeArray,...systemNodes];
        if(!data['Projects']){
            allNodes = [...allNodes, ...this.createInitialProject()]
        }
        allNodes = removeDuplicate(allNodes, 'path');
        
        

        const {tree, treeMap,selectedNodePath} = buildTree(allNodes, this.fillNode, oldTreeMap, this);
        this.selectedNodePath = selectedNodePath;
        this.workspaceTree = tree;
        this.treeMap = treeMap;
        commit && this.workspace.commit(`System:create FileSystem`, this.cleanUp(this.treeMap));
    }

    fillComponentNode(parts,existingNode){
        //component
        existingNode.tree_meta.icon ??= icons[existingNode.name];
        if(parts[0] === 'Projects'){
                existingNode.tree_meta = {
                ...existingNode.tree_meta,
                actionButtons: [
                    {title:'New Project', class:'fa-solid fa-square-plus', hover:true, click: () => this.treeEventHandle('add', existingNode)},
                ],
                expanded: existingNode.tree_meta?.expanded ?? true,
                icon:icons[parts[0]]
            }
        }
        return existingNode;  
    }

    fillEntityNode(parts, existingNode){
         if(parts[0] === 'Projects'){
            existingNode.tree_meta = {
                ...existingNode.tree_meta,
                actionButtons: [
                    {title:'Run', class:'fa-solid fa-play', hover:true, click: () => this.treeEventHandle('run', existingNode)},
                    {title:'Delete', class:'fa-solid fa-trash', hover:true, click: () => this.treeEventHandle('delete', existingNode)},
                    {title:'Anchor', class:'fa-solid fa-anchor', hover:true, click: () => this.treeEventHandle('anchor', existingNode)},
                ],
                icon:icons[parts[0]]
            }
        } else {
            existingNode.tree_meta = {
                ...existingNode.tree_meta,
                actionButtons: [
                    {title:'Add', class:'fa-solid fa-square-plus', hover:true, click: () => this.treeEventHandle('add', existingNode)},
                ],
                icon:icons[existingNode.name]
            }
        }
        return existingNode;
    }

    fillGroupNode(parts, existingNode){
        //group
        existingNode.tree_meta = {
            ...existingNode.tree_meta,
            actionButtons: [
                    showHideTypes.includes(parts[1]) ? {
                        title:'Show/Hide', 
                        onClass:'fa-solid fa-eye', 
                        offClass:'fa-solid fa-eye-slash', 
                        class: existingNode.hidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye',
                        stick:'fa-solid fa-eye-slash', 
                        hover:true, 
                        click: () => this.treeEventHandle('showHide', existingNode)
                    }:null,
                    {title:'Add', class:'fa-solid fa-square-plus', hover:true, click: () => this.treeEventHandle('add', existingNode)},
                    {title:'Delete', class:'fa-solid fa-trash', hover:true, click: () => this.treeEventHandle('delete', existingNode)}
                ].filter(x => x),
            icon : this.groupNodeIcon,
        }
        existingNode.type = "Group";
        return existingNode;
    }

    fillLeafNode(parts, existingNode){
        //entity type = leaf node
        if(parts[0] === 'Projects'){
            //no update needed
        } else {
            existingNode.tree_meta = {
            ...existingNode.tree_meta,
            actionButtons: [
                    showHideTypes.includes(parts[1]) ? {
                        title:'Show/Hide', 
                        onClass:'fa-solid fa-eye', 
                        offClass:'fa-solid fa-eye-slash', 
                        stickOn: true,
                        show: existingNode.tree_meta?.show ?? existingNode.config?.show ?? true, 
                        hover:true,
                        click: (show) => this.treeEventHandle('showHide', existingNode, { show }) 
                    } : null,
                    {title:'Delete', class:'fa-solid fa-trash', hover:true, click: () => this.treeEventHandle('delete', existingNode) }
                ].filter(x => x),
            icon : icons[parts[1]],
            }
            existingNode.type = parts[1]; 
        }  
        return existingNode;
    }

    fillNode(parts, existingNode , i, self = this){
        if(i === 0){
            return self.fillComponentNode(parts, existingNode)
        }

        if(i === 1){
            return self.fillEntityNode(parts, existingNode);
        }

        if ( i < parts.length - 1) {
           return self.fillGroupNode(parts, existingNode);
        } 

        if(i == parts.length-1){
            return self.fillLeafNode(parts, existingNode);
        }
    }

    /* createEntity */
    createInitialProject(name = 'New Project'){
         let data = [];
         let path = `Projects/${name}`;
         let projectFiles = projectDefault.map(x => ({...x, path: `${path}/${x.path}`}));
         let projectRoot = {name, path, type:'Project', anchor:true};
         this.anchorProject = path;
         data = [projectRoot, ...projectFiles];
         return data;
    }

    /* CRUD */
    get = path => this.treeMap[path];
    
    getParent = path => this.treeMap[path?.split('/').slice(0, -1).join('/')];

    updateNode = (node, msg, options = {} ) => {
        options.stringDiff = options.stringDiff ?? false;
        options.save = options.save ?? false;
        options.tag = options.tag ?? node.path;
        options.saveByTag = options.saveByTag ?? false;
        this.treeMap[node.path] = node;
        this.workspace.commit(msg, this.cleanUp(this.treeMap), options);
        getDevLog()?.loadChanges();
    }

    deleteNode = (node,  options = {}, soft=false) => {
        options.stringDiff = options.stringDiff ?? false;
        options.save = options.save ?? false;
        options.tag = options.tag ?? node.path;
        options.saveByTag = options.saveByTag ?? false;
        this.treeMap[node.path].children?.forEach(child => {
            this.deleteNode(child, options, true);
        });
        delete this.treeMap[node.path];
        if(!soft){
            this.workspace.commit('delete node', this.cleanUp(this.treeMap), options);
        }
        getDevLog()?.loadChanges();
    }

    createNode = (node, msg, options = {}, commit = true) => {
        options.stringDiff = options.stringDiff ?? false;
        options.save = options.save ?? false;
        options.tag = options.tag ?? node.path;
        options.saveByTag = options.saveByTag ?? false;
        this.treeMap[node.path] = node;
        let parent = this.getParent(node.path);
        parent.children ??= [];
        parent.children.push(node);

        commit && this.workspace.commit(msg, this.cleanUp(this.treeMap), options); 
        getDevLog()?.loadChanges();
    }

    updateSelectedNode(node = this.SelectedNode){
        //on selected node change
        this.selectedNode = node;
        this.setCodePath = node.path;
        $('#head-tools #selectedNode').text(node.type + ' : ' +node.name);
        getCodeEditor()?.setValue(node.code ?? '');
    }
    /* utils */
    syncVersionFile(){
        this.treeMap = this.workspace.getData(true);
        getDevLog()?.loadChanges();
    }
    
    saveNode(node = this.treeMap[this.selectedNodePath]){
        this.updateNode(node,'save node',{ stringDiff: true, save: true, tag: node.path, saveByTag: true });
        getDevLog()?.loadChanges();
    }

    goToCommit(index){
        this.workspace.gotoCommit(index);
        this.createFileSystem(this.treeMap, false);
        let selectedNode = this.treeMap?.[this.selectedNodePath];
        if(!selectedNode){
            selectedNode = this.treeMap.Projects.children[0];
            selectedNode.tree_meta.selected = true;
            this.selectedNodePath = selectedNode.path;
        }
        getNodeTree().reload(this.workspaceTree);
        this.updateSelectedNode(selectedNode)
    }

    clearAll(){

    }
    
    resize(){
        
    }

    cleanUp(treeMap){ 
        let _treeMap = {}
        Object.entries(treeMap).forEach(([key, value]) => {
            _treeMap[key] = {
                name: value.name,
                path: value.path,
                type: value.type,
                fileType: value.fileType,
            };
            value.code && (_treeMap[key].code = value.code);
        });
        return _treeMap;
    }

    async export(squash = false){
        let _versionFile = this.workspace.getVersionFile();
        // let data = (await window.JsonHandler.compress('chamber.json',_versionFile,'chamber')).data;
        downloadFile('chamber.json',_versionFile, 'application/json')
    }

    import(versionFile){
        this.init(versionFile);
    }

    async treeEventHandle(event, node, options = {}){
       switch(event){
            case 'add': Workspace.createNode(this, node); break;
            case 'run':
                alert('Run not implemented yet');
                break;
            case 'anchor':
                alert('Anchor not implemented yet');
                break;
            case 'delete':
                let confirmDelete = await confirm(`Are you sure you want to delete ${node.name}?`);
                if(!confirmDelete){
                    return;
                }
                Workspace.deleteNode(this, node);
                break;
            case 'showHide':
                alert('Show/Hide not implemented yet');
                break;
            case 'focus':
                alert('Focus not implemented yet');
                break;
            default:
                console.warn('Unknown event:', event);
       }
    }

}

Workspace.createNode = function(self, node){
    let newName = node.name === 'Projects' ? 'Project' : node.name;
    let getUniqueName = (count = 0) => {
        let name = `New ${newName}${count ? ` (${count})` : ''}`;
        if(self.get(`${node.path}/${name}`)){
            return getUniqueName(count + 1);
        }
        return name;
    }
    let newNode = {
        name: getUniqueName(),
        path: node.path + '/' + getUniqueName(),
        type: node.name,
    }

    if(newNode.type === 'Projects'){
        self.createNode(newNode, 'Create Project Node', {}, false);
        projectDefault.forEach((x,i) => {
            let projectFile = {...x, path: `${newNode.path}/${x.path}`};
            let last = (i === projectDefault.length-1);
            let msg = last ? 'Create Project Node':`Create project file ${projectFile.name}`;
            self.createNode(projectFile, msg, {}, last);
        });
    } else {
        self.createNode(newNode, `Create ${newNode.type}`);
    }
    self.createFileSystem();
    getNodeTree().reload(self.workspaceTree);
}

Workspace.deleteNode = function(self, node){
    self.deleteNode(node);
    self.createFileSystem();
    getNodeTree().reload(self.workspaceTree);
}

export function createWorkspace(options = {}){
    let _workspace =  new Workspace({
        onCanvasClick: options?.onCanvasClick,
        onLoadStart: options?.onLoadStart,
        onLoadComplete:options?.onLoadComplete,
        onChange: options?.change,
    });
    setWorkspace(_workspace);
    return _workspace;
}


