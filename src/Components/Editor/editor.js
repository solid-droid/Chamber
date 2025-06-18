import { codeEditor } from "./CodeEditor/codeEditor";
import { FileBrowser } from "./FileBrowser/fileBrowser";
import { isolateView} from "./IsolateView/isolateView";
import './editor.css';
import { debounce } from "../../utils/utils";
import Split from 'split.js'
import { getEditor, setEditor, setNodeTree } from "../../Runtime/global";


class Editor{
    codeEditor;
    constructor(element,  options = {} ){
        this.element = $(element);
        this.element.append($('#editorTemplate').html());
        this.editorBody = this.element.find('#chamber-editor-CodeEditor');
        this.titleDOM = this.element.find('.editor-title');
        this.typeDOM = this.element.find('.entityType')
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
        this.typeDOM.text(node.type);
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

function createEditor(element, node){
    let _editor = getEditor();
    if(!_editor){
        _editor  = new Editor(element);
        setEditor(_editor);
    }
    _editor.updateEditor(node)
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
    createVerticalSplit
}