let nodeTree, workspace, editor, configEditor;
function getNodeTree(){
    return nodeTree
}

function setNodeTree(data){
    nodeTree = data;
}

function getWorkspace(){
    return workspace
}

function setWorkspace(data){
    workspace = data;
}

function getCodeEditor(){
    return editor;
}

function setCodeEditor(data){
    editor = data;
}


function getConfigEditor(){
    return configEditor;
}

function setConfigEditor(data){
    configEditor = data;
}

export {
    getNodeTree,
    setNodeTree,
    getWorkspace,
    setWorkspace,
    getCodeEditor,
    setCodeEditor,
    getConfigEditor,
    setConfigEditor
}