import '@fortawesome/fontawesome-free/css/all.css';
import $ from 'jquery';
import * as monaco from 'monaco-editor';
import { AI_Interface } from '../../App/AI/AI-Interface.js';
import { Store } from '../../App/Store/Store.js';
import { Version_Control } from '../../App/Version/Version_Control.js';
import { getEnvironment } from './Tauri.js';

let _chamber = {};
async function loadWindowVariables() {
    /* Window Variables */
    _chamber = {};

    window.$ = $;
    window.jQuery = $;
    window.monaco = monaco;

    _chamber.services = {};
    _chamber.services.AI_Interface = new AI_Interface();
    _chamber.services.Store = new Store();
    _chamber.services.Version_Control = new Version_Control();

    _chamber.device = {};
    _chamber.device = await getEnvironment();

}

function chamber() {
    return _chamber;
}

function loadWindowSize() {
    
}


export { loadWindowVariables, chamber };