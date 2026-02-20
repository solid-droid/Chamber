import { Tauri } from '../Tauri/Tauri.js';
import '../Tauri/Services.js';
import '../Tauri/Sidecar.js';
import '../Tauri/Updater.js';

import { Store } from '../Store/Store.js';

import { UI } from '../../../UI/UI.js';
import '../../../UI/Canvas3D/Canvas3D.js';

import { Log } from '../Log/Log.js';



import $ from 'jquery';
import * as monaco from 'monaco-editor';



async function loadGlobals() {
    /* Window Variables */
    
    window.$ = $;
    window.jQuery = $;
    window.monaco = monaco;
    
    window.CHAMBER = {
        Tauri,
        UI,
        Store,
        Log
    };
}


export { loadGlobals };