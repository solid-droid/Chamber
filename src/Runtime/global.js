let nodeTree, workspace, editor;
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

function getEditor(){
    return editor;
}

function setEditor(data){
    editor = data;
}

export {
    getNodeTree,
    setNodeTree,
    getWorkspace,
    setWorkspace,
    getEditor,
    setEditor,
}