import { JSONVersioning } from "../utils/JSONVersioning";
import { removeDuplicate } from "../utils/utils";
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
        const workspace = this.workspace.getData();
        return workspace?.[this.#selectedNodePath];
    }
    
    constructor(options = {}) {
        this.options = options;
        this.groupNodeIcon = options.groupNodeIcon || 'fa-solid fa-layer-group';
        this.groupNodeIcon += ' groupNodeIcon';
        
        this.onCanvasClick = options.onCanvasClick || (() => {});
        this.onLoadStart = options.onLoadStart || (() => {});
        this.onLoadComplete = options.onLoadComplete || (() => {});
        this.onChange = options.onChange || (() => {});
        this.workspace = new JSONVersioning();
    }
    async init(workspaceData = {}, filePath = null) {
        this.filePath = filePath;
        this.data = workspaceData?.data;
        this.meta = workspaceData?.meta;
        this.onLoadStart();
        this.clearAll();
        this.workspace.setVersionFile(this.data);
        this.createFileSystem('initial');
        this.onLoadComplete();
    }

    /* FileSystem */
    createFileSystem(stage='update'){
        let data = this.workspace.getData();
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
        allNodes = removeDuplicate(allNodes, 'path');
        const {tree, pathMap} = this.buildTree(allNodes);
        this.workspaceTree = tree;
        this.workspace.commit(`System:create FileSystem ${stage}`, pathMap);

        //if no project - create a new project
        !pathMap['Projects'].children.length && this.createProject() && this.createFileSystem();
    }

    buildTree(data) {
        const root = [];
        const pathMap = {};

        for (const item of data) {
            const parts = item.path.split('/');
            let currentLevel = root;
            let currentPath = '';

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                let existingNode = pathMap[currentPath];

                if (!existingNode) {
                    existingNode = {
                        ...item,
                        name: i === parts.length - 1 ? item.name : part,
                        path: currentPath,
                        children: []
                    };
                    currentLevel.push(existingNode);
                    pathMap[currentPath] = existingNode;
                }
                existingNode.tree_meta = existingNode.tree_meta || {};
                this.#selectedNodePath = existingNode.tree_meta.selected ? existingNode.path : this.#selectedNodePath; 
                existingNode = this.fillNode(parts, existingNode , i);
                currentLevel = existingNode.children;
            }
        }
        return {tree:root,pathMap};
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

    fillNode(parts, existingNode , i){
        if(i === 0){
            return this.fillComponentNode(parts, existingNode)
        }

        if(i === 1){
            return this.fillEntityNode(parts, existingNode);
        }

        if ( i < parts.length - 1) {
           return this.fillGroupNode(parts, existingNode);
        } 

        if(i == parts.length-1){
            return this.fillLeafNode(parts, existingNode);
        }
    }

    /* createEntity */
    createProject(name = 'New Project'){
         const workspace = this.workspace.getData();
         let path = `Projects/${name}`;
         if(workspace[path]){
            return false;
         }

         let projectFiles = projectDefault.map(x => ({...x, path: `${path}/${x.path}`}));
         workspace[path] = {name, path, type:'Project'};
         projectFiles.forEach(x => workspace[x.path] = x);
         this.workspace.commit(`System:create project - ${name}`, workspace);
         return true;
    }

    /* CRUD */
    get(path){
        this.workspace.getData()[path];
    }

    update(node, msg, stringDiff = false){
        let workspace = this.workspace.getData();
        workspace[node.path] = node;
        this.workspace.commit(msg,workspace,{stringDiff});
    }

    delete(node){
        let workspace = this.workspace.getData();
        delete workspace[node.path];
        this.workspace.commit('delete node',workspace);
    }

    create(node, msg){
        let workspace = this.workspace.getData();
        workspace[node.path] = node;
        this.workspace.commit(msg,workspace);
    }

    /* utils */
    clearAll(){

    }
    
    resize(){
        
    }

}