import { codeEditor } from "./CodeEditor/codeEditor";
import { FileBrowser } from "./FileBrowser/fileBrowser";
import { isolateView} from "./IsolateView/isolateView";
import './editor.css';
import { debounce } from "../../utils/utils";
import Split from 'split.js'
import { 
    getCodeEditor, 
    setCodeEditor, 
    getConfigEditor,
    setConfigEditor, 
    setNodeTree 
} from "../../Runtime/global";
import { editor } from "monaco-editor";


class Editor{
    codeEditor;
    constructor(element,  options = {} ){
        this.element = $(element);
        this.element.append($('#editorTemplate').html());
        this.editorBody = this.element.find('#chamber-editor-CodeEditor');
        this.titleDOM = this.element.find('.editor-title');
        this.typeDOM = this.element.find('.entityType');
        this.focusButton = this.element.find('.focusButton');
        if(!options.editor){
            this.focusButton.hide();
        }
        this.options = options;
        this.codeEditor = this.createCodeEditor();
    }

    createCodeEditor(){
        let editor = codeEditor(this.editorBody[0]);
        let onChangeDebounce = debounce(this.options?.code?.onChange || (() => {}), 500);
        editor.onDidChangeModelContent(onChangeDebounce);
        return editor;
    }

    updateEditor(node){
        this.titleDOM.text(node.name);
        if(this.options.typeOveride){
            this.typeDOM.text(this.options.typeOveride);
        } else {
            this.typeDOM.text(node.type);
        }
    }

    destroy(){
        this.codeEditor.dispose();
        this.codeEditor.getModel()?.dispose();
    }
}


class DebugView{
    constructor(selector, options = {}){
        this.selector = selector;
        this.options = options;
        createIsolateView();
    }

    async createIsolateView(){
        const {engine, scene} = await isolateView(this.selector);
        this.IsolateView =  {engine, scene};
    }
}

function createEditor(element){
    setCodeEditor(new Editor(element, {
        editor:true
    }));
}

function createConfigEditor(element){
    setConfigEditor(new Editor(element,{
        typeOveride : 'Config'
    }));
}

function createNodeTree(element, options = {}){   
    let _nodeTree = new FileBrowser(element, {
        data: options?.data || [],
        onSelect: options?.onSelect || (() => {}),
        onIconClick: options?.onIconClick || (() => {}),
        onExpandCollapse: options?.onExpandCollapse || (() => {})
    });
    setNodeTree(_nodeTree);
}

async function createDebugView(selector, options = {}){
        return new DebugView(selector, options)
}

 function createVerticalSplit(isolateViewSelector, editorSelector){
    let splitter = Split([isolateViewSelector, editorSelector],{
        direction: 'vertical',
        minSize: 200,
        sizes: [30, 70],
        gutterSize: 6,
    });
    return splitter;
}

export {
    createNodeTree,
    createEditor,
    createDebugView,
    createVerticalSplit,
    createConfigEditor
}