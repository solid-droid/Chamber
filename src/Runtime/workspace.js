import { JsonVersioning } from "../utils/JsonVersioning";
import { downloadFile, removeDuplicate } from "../utils/utils";
import { buildTree } from "./TreeManager";
import {
    icons,
    projectDefault,
    COMPONENTS,
    Canvas3D_entries,
    Canvas2D_entires,
    WebView_entries,
    Audio_entries,
    Datastore_entries,
    Scripts_entries,
    Agent_entries,
    focusTypes
} from './defaults';

export default class Workspace{
    #selectedNodePath = '';
    set SelectedNode(node){
        this.#selectedNodePath = node.path;
    }
    get SelectedNode(){
        return this.treeMap?.[this.#selectedNodePath];
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
        this.createFileSystem();
        this.onLoadComplete();
    }

    /* FileSystem */
    createFileSystem(){
        let data = this.workspace.getData() || {};
        const nodeArray = Object.values(data);
        const systemNodes = [
            ...COMPONENTS.map(x => ({...x, type:'Component'})),
            ...Canvas3D_entries.map(x => ({...x, type:'Entity'})), 
            ...Canvas2D_entires.map(x => ({...x,type:'Entity'})),
            ...WebView_entries.map(x => ({...x, type:'Entity'})),
            ...Audio_entries.map(x => ({...x, type:'Entity'})),
            ...Datastore_entries.map(x => ({...x, type:'Entity'})),
            ...Scripts_entries.map(x => ({...x, type:'Entity'})),
            ...Agent_entries.map(x => ({...x, type:'Entity'})),
        ];
        let allNodes = [...nodeArray,...systemNodes];
        if(!data['Projects']){
            allNodes = [...allNodes, ...this.createInitialProject()]
        }
        allNodes = removeDuplicate(allNodes, 'path');
        
        

        const {tree, treeMap,selectedNodePath} = buildTree(allNodes, this.fillNode, this);
        this.#selectedNodePath = selectedNodePath;
        this.workspaceTree = tree;
        this.treeMap = treeMap;
        this.workspace.commit(`System:create FileSystem`, this.cleanUp(this.treeMap));
    }

    fillComponentNode(parts,existingNode){
        //component
        existingNode.tree_meta.icon ??= icons[existingNode.name];
        if(parts[0] === 'Projects'){
                existingNode.tree_meta = {
                actionButtons: [
                    {title:'New Project', class:'fa-solid fa-square-plus', hover:true},
                ],
                icon:icons[parts[0]]
            }
        }
        return existingNode;  
    }

    fillEntityNode(parts, existingNode){
         if(parts[0] === 'Projects'){
            existingNode.tree_meta = {
                actionButtons: [
                    {title:'Delete', class:'fa-solid fa-trash', hover:true},
                ],
                icon:icons[parts[0]]
            }
        } else {
            existingNode.tree_meta = {
                ...existingNode.tree_meta,
                actionButtons: [
                    {title:'Add', class:'fa-solid fa-square-plus', hover:true},
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
                    focusTypes.includes(parts[1]) ? {
                        title:'Show/Hide', 
                        onClass:'fa-solid fa-eye', 
                        offClass:'fa-solid fa-eye-slash', 
                        class: existingNode.hidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye',
                        stick:'fa-solid fa-eye-slash', 
                        hover:true, 
                    }:null,
                    {title:'Add', class:'fa-solid fa-square-plus', hover:true},
                    {title:'Delete', class:'fa-solid fa-trash', hover:true }
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
                    focusTypes.includes(parts[1]) ? {
                        title:'Show/Hide', 
                        onClass:'fa-solid fa-eye', 
                        offClass:'fa-solid fa-eye-slash', 
                        class: existingNode.workspace_meta?.hidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye',
                        stick:'fa-solid fa-eye-slash', 
                        hover:true, 
                    } : null,
                    focusTypes.includes(parts[1]) ? {title:'Focus', class:'fa-solid fa-location-crosshairs', hover: true } : null,
                    {title:'Delete', class:'fa-solid fa-trash', hover:true }
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
         let projectRoot = {name, path, type:'Project'};
         data = [projectRoot, ...projectFiles];
         return data;
    }

    /* CRUD */
    get = path => this.treeMap[path];
    
    getParent = path => this.treeMap[path?.split('/').slice(0, -1).join('/')];

    update = (node, msg, options = {} ) => {
        options.stringDiff = options.stringDiff ?? false;
        options.save = options.save ?? false;
        options.tag = options.tag ?? node.path;
        options.saveByTag = options.saveByTag ?? false;
        this.treeMap[node.path] = node;
        this.workspace.commit(msg, this.cleanUp(this.treeMap), options);
    }

    delete = (node,  options = {}) => {
        options.stringDiff = options.stringDiff ?? false;
        options.save = options.save ?? false;
        options.tag = options.tag ?? node.path;
        options.saveByTag = options.saveByTag ?? false;
        delete this.treeMap[node.path];
        this.workspace.commit('delete node', this.cleanUp(this.treeMap), options);
    }

    create = (node, msg, options = {}) => {
        options.stringDiff = options.stringDiff ?? false;
        options.save = options.save ?? false;
        options.tag = options.tag ?? node.path;
        options.saveByTag = options.saveByTag ?? false;
        this.treeMap[node.path] = node;
        let parent = this.getParent(node.path);
        parent.children ??= [];
        parent.children.push(node);

        this.workspace.commit(msg, this.cleanUp(this.treeMap), options); 
    }
    /* utils */
    syncVersionFile(){
        this.treeMap = this.workspace.getData(true);
    }

    updateNode(node, msg){
        this.update(node,msg,{stringDiff:true});
    }
    
    saveNode(node = this.treeMap[this.#selectedNodePath]){
        this.update(node,'save node',{ stringDiff: true, save: true, tag: node.path, saveByTag: true });
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
                fileType: value.fileType
            };
            value.script && (_treeMap[key].script = value.script);
        });
        return _treeMap;
    }

    async export(squash = false){
        let _versionFile = this.workspace.getVersionFile();
        let data = (await window.JsonHandler.compress('chamber.json',_versionFile,'chamber')).data;
        downloadFile('chamber.chmbr',data, 'application/x-chamber-workspace')
    }

    import(versionFile){
        this.init(versionFile);
    }

}