import { codeEditor } from "./CodeEditor/codeEditor";
import { FileBrowser } from "./FileBrowser/fileBrowser";
import { isolateView} from "./IsolateView/isolateView";
import './editor.css';
import { debounce } from "../../utils/utils";
import Split from 'split.js'
import { getEditor, setEditor, setNodeTree } from "../../Runtime/global";


class Editor{
    codeEditor;
    constructor(selector,  options = {} ){
        this.selector = selector;
        this.options = options;
        this.codeEditor = this.createCodeEditor();
    }

    createCodeEditor(){
        let editor = codeEditor(this.selector);
        let onChangeDebounce = debounce(options?.code?.onChange || (() => {}), 500);
        editor.onDidChangeModelContent(onChangeDebounce);
        return editor;
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

function createEditor(node, element){
    let _editor = getEditor();
    if(!_editor){
        _editor  = new Editor(element);
        setEditor(_editor);
    }

    console.log(node);
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