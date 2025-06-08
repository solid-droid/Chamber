import { codeEditor } from "./CodeEditor/codeEditor";
import { FileBrowser } from "./FileBrowser/fileBrowser";
import { isolateView, isolateViewMesh } from "./IsolateView/isolateView";
import './editor.css';
import Resizable from "../../utils/Resizable";
import { debounce, getFormat } from "../../utils/utils";
import Split from 'split.js'


export default class Editor {
    inspectMode = false;
    devMode = false;

    constructor(id, options = {}) {
        this.id = id;
        this.container = $('#'+id);
        
        this.inspectMode = options.defaultOptions.inspectMode || false;
        this.devMode = options.defaultOptions.devMode || false;
        this.openFilebrowser = options.defaultOptions.openFilebrowser || false;
        this.isolateView = options.defaultOptions.isolateView || false;
        
        this.getWorkspace = options.getWorkspace || (() => {});
        this.onInspectMode = options.onInspectMode || (()=> {});
    }

    async init() {
        this.loadHtml();
        this.DebugView = await this.createDebug3DView();
        this.Editor = this.createCodeEditor();
        
        this.FileBrowser = this.createFileBrowser();

        this.activateDevMode(this.devMode || false);
        await this.showIsolateView(this.isolateView || false);

        let node = this.getWorkspace().SelectedNode;
        if(node){
            this.container.find(`.editor-title`).text(node.name);
            this.container.find(`.entityType`).text(node.type);
        }

    }

    async showInspectMode(show = this.inspectMode){
        this.inspectMode = show;
    }
    async showIsolateView(show = this.isolateView, mesh) {
        const canvas = this.container.find(`#isolateViewContainer`);
        const isolateButton = this.container.find('.isolateViewButton');
        this.isolateView = show;
        if (show) {
            isolateButton.addClass('active');
            this.createEditorSplit();
            //canvas view
            canvas.show();
            await new Promise(r => setTimeout(r, 100));
            this.DebugView.engine?.resize();
            if(mesh && this.DebugView.scene)
                isolateViewMesh(mesh, this.DebugView.scene);

        } else {
            isolateButton.removeClass('active');
            this.editorSplit?.destroy();
            this.editorSplit = null;
            canvas.hide();
        }
    }

    async createDebug3DView() {
        const {engine, scene} = await isolateView('chamber-editor-Canvas');
        return {engine, scene};
    }
    
    createEditorSplit(){
        this.editorSplit?.destroy();
        this.editorSplit = Split(['#isolateViewContainer', '#codeEditorContainer'],{
            direction: 'vertical',
            minSize: 200,
            sizes: [30, 70],
            gutterSize: 6,
        })
    }

    createCodeEditor() {
        this.container.find(`.isolateViewButton`).on('click', async () =>{
            this.isolateView = !this.isolateView;
            await this.showIsolateView();
        });
        let editor = codeEditor('chamber-editor-CodeEditor');
        editor?.onDidChangeModelContent(() => {
            this.debounceEditorUpdate(this.Editor,this.getWorkspace())          
        });
        return editor;
    }
    debounceEditorUpdate = debounce((editor, project)=> {
        const value = editor.getValue();
        project.SelectedNode = value;
    }, 500);
    showFileBrowser(show = true){
        if(show){
             this.filebrowserBlock?.resize({
                top:'200px',
                right: '2px',
                width: '300px',
                height: 'calc(100vh - 210px)',
             });
             this.container.find(`.filebrowserContainer`).show();
        } else {
            this.container.find(`.filebrowserContainer`).hide();
        }
    }
    createFileBrowser(){
        this.showFileBrowser(this.openFilebrowser);
        
        let fileBrowser = new FileBrowser(`#chamber-editor-FileBrowser`, {
            groupNodeIcon: this.getWorkspace().groupNodeIcon,
            data: this.getWorkspace().workspaceTree,
            onSelect: e => {
                const project = this.getWorkspace();
                project.SelectedNode = e;
                this.container.find(`.editor-title`).text(project.SelectedNode.name);
                this.container.find(`.entityType`).text(project.SelectedNode.type);
                this.setEditorValue();
            }
        });

        return fileBrowser;
    }

    loadHtml() {
        let editorOptionsDOM = $(`
            <div class="editor-options">
                <div class="editor-info">
                    <span class="editor-title">----</span>
                </div>
                <div class="editor-buttons">
                    <div class="entityType tag">-----</div>
                    <i class="iconButton fa-solid fa-cube  isolateViewButton" title="Isolate View"></i>
                    <i class="iconButton fa-solid fa-layer-group visualEditor" title="Visual Editor"></i>
                    <i class="iconButton fa-solid fa-anchor anchorButton" title="Anchor"></i>
                    <i class="iconButton fa-solid fa-floppy-disk saveButton" title="Save"></i>
                </div>
            </div>;
        `);

        let isolateViewDOM = $(`
            <div id="isolateViewContainer">
                <canvas id="chamber-editor-Canvas"></canvas>
            </div>
        `);

        let codeEditorDOM = $(`
            <div id="codeEditorContainer">
                <div id="chamber-editor-CodeEditor"></div>
            </div>
        `);

        let fileBrowserDOM = $(`
             <div class="filebrowserContainer glassEditor">
                <div class="filebrowser-toolbar">    
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="search" class="search-input" placeholder="Search..." />
                    <i class="iconButton fa-solid fa-anchor"></i>
                </div>
                <div id="chamber-editor-FileBrowser"></div>
            </div>
        `);

        let devModeContainer = $(`<div class="editorContainer glassEditor"></div>`);
        let nodeEditorContainer = $(`<div class="nodeEditorContainer"></div>`);

        nodeEditorContainer.append(isolateViewDOM);
        nodeEditorContainer.append(codeEditorDOM);

        devModeContainer.append(editorOptionsDOM);
        devModeContainer.append(nodeEditorContainer);

        this.container.append(devModeContainer);
        this.container.append(fileBrowserDOM);

        this.editorBlock = new Resizable('.editorContainer', {
            left:true,
            top:true,
            minWidth:400,
            maxWidth:1000,
            minHeight:500
        });

        this.filebrowserBlock = new Resizable('.filebrowserContainer', {
            left:true,
            top:true,
            minWidth:300,
            maxWidth:600,
            minHeight:400,
        });
        
    }


    activateDevMode(show = true){
        this.devMode = show;
        this.showIsolateView();

        const editorContainer = this.container.find('.editorContainer');
        if(show){
            this.editorBlock?.resize({
                top:'40px',
                right: '1px',
                width: '400px',
                height: 'calc(100vh - 50px)'
             });
            editorContainer.css({display:'grid'});
        } else {
            editorContainer.hide();
        }
    }

    reload(){
        const project = this.getWorkspace();
        if(project.workspace){
            this.container.find(`.editor-title`).text(project.SelectedNode?.name);
            this.container.find(`.entityType`).text(project.SelectedNode?.type);
            this.FileBrowser?.reload(project.workspaceTree);
            this.setEditorValue();
        }

    }

    setEditorValue(){
            const project = this.getWorkspace();
            if(project.SelectedNode){
                this.Editor?.setValue(project.SelectedNode.script || '');
                const fileType = project.SelectedNode.fileType || getFormat(project.SelectedNode.name);
                const model = this.Editor.getModel?.();
                if (model) {
                    monaco.editor.setModelLanguage(model, fileType);
                }
            }

        }
}


