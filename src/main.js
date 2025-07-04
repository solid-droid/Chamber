
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

/* Window Variables */
const { invoke } = window.__TAURI__.core;

window.$ = $;
window.monaco = monaco;
window.JsonHandler = new JsonHandler();

/* State Variables */
let remoteAccess = new State(false);
let devMode = new State(false);
let inspectMode = new State(false);
init();

async function init() {
    window.isDev = await invoke('is_dev_mode');


    await checkForAppUpdates();

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

