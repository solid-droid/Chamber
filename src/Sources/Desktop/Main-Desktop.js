import { log } from "../../Services/System/Framework/logger.js";
import { closeApp, minimizeApp } from "../../Services/System/Framework/Tauri.js";
import { AppTopMenu } from "../../UI/Module/InLine/AppTopMenu/AppTopMenu.js";
import './Main-Desktop.css';
import { toggleTheme } from "../../Services/System/Framework/Common.js";
import { AppBottomMenu } from "../../UI/Module/InLine/AppBottomMenu/AppBottomMenu.js";
import { AppLeftMenu } from "../../UI/Module/InLine/AppLeftMenu/AppLeftMenu.js";
import { AppRightMenu } from "../../UI/Module/InLine/AppRightMenu/AppRightMenu.js";
import { Layout_Resizable } from "../../UI/Atomic/Layout/Layout-Resizable/Layout-Resizable.js";
async function Main_Desktop() {
    //desktop specific code here
    log("Desktop Detected");
    loadDesignLayout();
}
const LAYOUT = {
    leftNav : false,
    rightNav : false,
}

const DOM = { 
    root: null,
    header: null,
    content: null,
    leftMenu: null,
    mainContent: null,
    rightMenu: null,
    footer: null
}

const INSTANCE = {
    AppTopMenu: null,
    AppBottomMenu: null,
    AppLeftMenu: null,
    AppRightMenu: null,
}

const RESIZABLE = {
    leftNav : null,
    rightNav : null,
}

const MENU_STATE = {
    //left menu
    project: false,
    node: false,
    datastore: false,
    service: false,
    package: false,
    //right menu
    workflow: false
}

function loadDesignLayout() {
    //html structure/layout
    initHTMLStructure();

    //making left and right nav resizable
    initResizableLayout();

    //default left and right Nav sizes
    setLeftAndRightNav({});

    //menu content
    initMenuContent();

    //main content
}


function initHTMLStructure(){
    DOM.root = $('#chamber-app');


    DOM.header = $('<div class="app-header"></div>');
    DOM.root.append(DOM.header);
    
    DOM.content = $('<div class="app-content"></div>');
    
    DOM.leftMenu = $('<div class="app-left-menu"></div>');
    DOM.content.append(DOM.leftMenu);
    DOM.mainContent = $('<div class="app-main-content"></div>');
    DOM.content.append(DOM.mainContent);
    DOM.rightMenu = $('<div class="app-right-menu"></div>');
    DOM.content.append(DOM.rightMenu);

    DOM.root.append(DOM.content);
    DOM.footer = $('<div class="app-footer"></div>');
    DOM.root.append(DOM.footer);
}

function initResizableLayout(){
    RESIZABLE.leftNav = new Layout_Resizable(DOM.leftMenu, {
        right: true,
        minWidth: 200,
        maxWidth: '40%',
    });

    RESIZABLE.rightNav = new Layout_Resizable(DOM.rightMenu, {
        left: true,
        minWidth: 200,
        maxWidth: '40%',
    });
}

function initMenuContent(){
    INSTANCE.AppTopMenu = new AppTopMenu(DOM.header, {
        onClose: () => closeApp(),
        onMinimize: () => minimizeApp(),
        onTheme: () => toggleTheme(),
        //left menu options
        onProjects: () => {
           toggleLeftMenu('project');
        },
        onNodes: () => {
            toggleLeftMenu('node');
        },
        onDatastore: () => {
            toggleLeftMenu('datastore');
        },
        onServices: () => {
            toggleLeftMenu('service');
        },
        onPackages: () => {
            toggleLeftMenu('package');
        },
        //right menu options
        onRun: () => {

        },
        onWorkflow: () => {
            toggleRightMenu('workflow');
        }
    });
    
    INSTANCE.AppBottomMenu = new AppBottomMenu(DOM.footer, {
        
    });

    INSTANCE.AppLeftMenu = new AppLeftMenu(DOM.leftMenu,{
        
    })

    INSTANCE.AppRightMenu = new AppRightMenu(DOM.rightMenu,{
        
    })

    toggleLeftMenu('project');
}

function toggleLeftMenu(buttonName){
    let state =  !MENU_STATE[buttonName];
    resetLeftMenuButtons();
    MENU_STATE[buttonName] = state;
    INSTANCE.AppTopMenu.markAllLeftMenuButton(false);
    INSTANCE.AppTopMenu.markButtonActive(buttonName, MENU_STATE[buttonName]);
    INSTANCE.AppLeftMenu.activate(buttonName);
    setLeftAndRightNav({leftNav: MENU_STATE[buttonName]});
}

function toggleRightMenu(buttonName){
    let state =  !MENU_STATE[buttonName];
    resetRightMenuButtons();
    MENU_STATE[buttonName] = state;
    INSTANCE.AppTopMenu.markAllRightMenuButton(false);
    INSTANCE.AppTopMenu.markButtonActive(buttonName, MENU_STATE[buttonName]);
    setLeftAndRightNav({rightNav: MENU_STATE[buttonName]});
}

function resetRightMenuButtons(){
    MENU_STATE.workflow = false;
}

function resetLeftMenuButtons(){
    MENU_STATE.project = false;
    MENU_STATE.node = false;
    MENU_STATE.datastore = false;
    MENU_STATE.service = false;
    MENU_STATE.package = false;
}

function setLeftAndRightNav({leftNav, rightNav}) {
    LAYOUT.leftNav = leftNav ?? LAYOUT.leftNav;
    LAYOUT.rightNav = rightNav ?? LAYOUT.rightNav;
    if(LAYOUT.leftNav){
        DOM.leftMenu.width(Math.max(DOM.leftMenu.width(),200)+'px');
        DOM.leftMenu.find('.resize-handle').show();
        DOM.leftMenu.addClass('open');
        setTimeout(()=> DOM.leftMenu.css('transition','none'), 100);
    } else {
        DOM.leftMenu.css('transition','0.1s');
        DOM.leftMenu.width('0');
        DOM.leftMenu.find('.resize-handle').hide();
        DOM.leftMenu.removeClass('open');
    }

    if(LAYOUT.rightNav){
        DOM.rightMenu.width(Math.max(DOM.rightMenu.width(),200)+'px');
        DOM.rightMenu.find('.resize-handle').show();
        DOM.rightMenu.addClass('open');
        setTimeout(()=> DOM.rightMenu.css('transition','none'), 100);
    } else {
        DOM.rightMenu.css('transition','0.1s');
        DOM.rightMenu.width('0');
        DOM.rightMenu.find('.resize-handle').hide();
        DOM.rightMenu.removeClass('open');
    }
}
export { Main_Desktop };