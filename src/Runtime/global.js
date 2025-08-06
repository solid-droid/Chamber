let nodeTree, workspace, editor, configEditor, devlog, blueprint;
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

function setBlueprint(data){
    blueprint = data;
}

function getBlueprint(){
    return blueprint;
}

function setDevLog(data){
    devlog = data;
}

function getDevLog(){
    return devlog;
}

export {
    getNodeTree,
    setNodeTree,
    getWorkspace,
    setWorkspace,
    getCodeEditor,
    setCodeEditor,
    getConfigEditor,
    setConfigEditor,
    getBlueprint,
    setBlueprint,
    setDevLog,
    getDevLog
}