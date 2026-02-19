import './app.css';
import { Designer } from './Designer/designer';

export async function start() {
    createBasicUI();
}

const DOM = { 
    root: null,
    header: null,
    body: null,
    footer: null,
};

function createBasicUI() {
    DOM.root = $('#chamber-app');


    DOM.header = $('<div class="app-header" data-tauri-drag-region>Header</div>');
    DOM.root.append(DOM.header);
    
    DOM.body = $('<div class="app-body">Body</div>');
    DOM.root.append(DOM.body);

    let _designerView = $('<canvas class="designer-view"></canvas>');
    DOM.body.empty();
    DOM.body.append(_designerView);
    new Designer(_designerView);

    DOM.footer = $('<div class="app-footer">Footer</div>');
    DOM.root.append(DOM.footer);
}