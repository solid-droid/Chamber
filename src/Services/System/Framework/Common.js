import $ from 'jquery';
import * as monaco from 'monaco-editor';
import { AI_Interface } from '../../App/AI/AI-Interface.js';
import { Store } from '../../App/Store/Store.js';
import { Version_Control } from '../../App/Version/Version_Control.js';
import { getEnvironment } from './Tauri.js';
import { log } from '../Framework/logger.js';

let _chamber = {};
async function loadWindowVariables() {
    /* Window Variables */
    _chamber = {};

    window.$ = $;
    window.jQuery = $;
    window.monaco = monaco;
    window.log = log;

    _chamber.services = {};
    _chamber.services.AI_Interface = new AI_Interface();
    _chamber.services.Store = new Store();
    _chamber.services.Version_Control = new Version_Control();

    _chamber.device = {};
    _chamber.device = await getEnvironment();

    _chamber.theme = 'dark';

}

function chamber() {
    return _chamber;
}

function toggleTheme() {
    $('body').removeClass('theme-light');
    $('body').removeClass('theme-dark');

    _chamber.theme = _chamber.theme === 'dark' ? 'light' : 'dark';
    if (_chamber.theme === 'dark') {
        $('body').addClass('theme-dark');
    } else {
        $('body').addClass('theme-light');
    }
}


export { loadWindowVariables, chamber, toggleTheme };