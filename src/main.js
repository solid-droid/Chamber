
import Editor from "./Components/Editor/editor";
import '@fortawesome/fontawesome-free/css/all.css';
import './DesignSystem/designSystem.css';
import Workspace from "./Runtime/workspace";
import * as Mesh from './Components/simulation3D/Mesh/mesh';

import { State } from "./utils/State";
import { configueToolbar } from "./Components/Header/header";
import $ from 'jquery';
import * as monaco from 'monaco-editor';
const { invoke } = window.__TAURI__.core;

window.$ = $;
window.monaco = monaco;

let _editor, _project;
let devMode = new State(true);
let openFileBrowser = new State(true); 
let inspectMode = new State(false);
createElements();

setTimeout(async ()=> {
    await _editor.init();
    await _project.init();
}, 1000)




////////Supporting Methods/////////////
async function createElements() {
    window.isDev = await invoke('is_dev_mode');
    configueToolbar({
        getWorkspace: () => _project,
        getEditor: () => _editor,
        devMode,
        openFileBrowser,
        inspectMode
    });

    _project = new Workspace({
        onCanvasClick: pickResult => onCanvasClick(pickResult),
        getEditor: () => _editor,
        onLoadStart: () => $('#projectName').text(_project.workspace?.name || '...'),
        onLoadComplete: () => _editor?.reload(),
        onChange: () => $('#projectName').text(_project.workspace?.name + ' *'),
    });

    _editor = new Editor('editor', {
        defaultOptions: {
            devMode:devMode.value,
            openFilebrowser:openFileBrowser.value,
            inspectMode: inspectMode.value,
            isolateView:false,
        },
        getWorkspace: () => _project,
    });
}

function onCanvasClick(pickResult) {
    if(_editor.inspectMode){
        _editor.showIsolateView(true,pickResult.pickedMesh);
    } else {
        let box = Mesh.Box('box1', _project.simulation3D.scene);
        box.position = pickResult.pickedPoint;
    }
}

