import '@fortawesome/fontawesome-free/css/all.css';
import $ from 'jquery';
import * as monaco from 'monaco-editor';
import { LLM } from './Services/App/AI/AI-Interface.js';

/* Window Variables */
window.$ = $;
window.monaco = monaco;

// import testHtml from './test.html?raw';
// document.getElementById('chamber-app').innerHTML = testHtml;

/* Application Variables */
window.brain = new LLM();