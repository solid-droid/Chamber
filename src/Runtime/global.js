let nodeTree, 
workspace, 
editor, 
configEditor, 
devlog, 
blueprint, 
JSengine,
layout,
layoutOBJ
;

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

function getExecutor(){
    return JSengine;
}

function setExecutor(data){
    JSengine = data;
}

function getLayout(){
    return layout;
}

function setLayout(data){
    layout = data;
}

function getLayoutOBJ(){
    return layoutOBJ; 
}

function setLayoutOBJ(data){
    layoutOBJ = data;
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
    getDevLog,
    getExecutor,
    setExecutor,
    getLayout,
    setLayout,
    getLayoutOBJ,
    setLayoutOBJ
}