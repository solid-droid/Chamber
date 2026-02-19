import { getEnvironment } from './Tauri.js';
import { log } from './logger.js';
import store from './Store.js';

import $ from 'jquery';
import * as monaco from 'monaco-editor';
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import * as DEBUGER from "@babylonjs/core/Debug/debugLayer"; 
import * as INSPECTOR from "@babylonjs/inspector";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";

async function loadGlobals() {
    /* Window Variables */
    
    window.$ = $;
    window.jQuery = $;
    window.monaco = monaco;

    window.BABYLON = BABYLON;
    window.CANVAS = {};
    window.CANVAS.GUI = GUI;
    window.CANVAS.DEBUGER = DEBUGER;
    window.CANVAS.INSPECTOR = INSPECTOR;
    window.CANVAS.MATERIALS = { GridMaterial };
    
    window.log = log;
    
    window.CHAMBER = {};
    CHAMBER.device = {};
    CHAMBER.device = await getEnvironment();
    CHAMBER.store = store;
    CHAMBER.theme = 'dark';

}

function toggleTheme() {
    $('body').removeClass('theme-light');
    $('body').removeClass('theme-dark');

    CHAMBER.theme = CHAMBER.theme === 'dark' ? 'light' : 'dark';
    if (CHAMBER.theme === 'dark') {
        $('body').addClass('theme-dark');
    } else {
        $('body').addClass('theme-light');
    }
}


export { loadGlobals, toggleTheme };