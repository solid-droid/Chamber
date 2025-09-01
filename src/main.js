
import '@fortawesome/fontawesome-free/css/all.css';
import './DesignSystem/designSystem.css';
import $ from 'jquery';
import * as monaco from 'monaco-editor';
import { JsonHandler } from "./utils/JsonHandler";
import { State } from "./utils/State";

import { checkForAppUpdates } from "./updater";
import { attachHeaderEvents } from "./Header/header";
import { createWorkspace } from "./Runtime/Workspace.js";
import { getNodeTree, getWorkspace } from './Runtime/global';
import { loadTools } from './utils/loadTools.js';
import { getEnvironment } from './utils/tauri.js';

/* Window Variables */
window.$ = $;
window.monaco = monaco;
window.JsonHandler = new JsonHandler();

/* State Variables */
let remoteAccess = new State(false);
let devMode = new State(false);
let inspectMode = new State(false);
init();

async function init() {
    await getEnvironment();
    if(window.isTauri){
        try{
            await checkForAppUpdates();
        } catch(e){
            console.log('check for update: '+e);
        }
    }
    await loadTools();

    attachHeaderEvents({
        devMode,
        inspectMode,
        remoteAccess
    });

    createWorkspace({
        onCanvasClick: e => {},
        onLoadStart: () => {},
        onLoadComplete: () => {
            getNodeTree()?.reload(getWorkspace().workspaceTree)
        },
        onChange: () => {},
    });   

    getWorkspace().init();
}

