import { log } from "../../Services/System/Framework/logger.js";
import { closeApp, minimizeApp } from "../../Services/System/Framework/Tauri.js";
import { AppTopMenu } from "../../UI/Module/InLine/AppTopMenu/AppTopMenu.js";
import './Main-Desktop.css';
import { toggleTheme } from "../../Services/System/Framework/Common.js";
import { AppBottomMenu } from "../../UI/Module/InLine/AppBottomMenu/AppBottomMenu.js";
async function Main_Desktop() {
    //desktop specific code here
    log("Desktop Detected");
    loadDesignLayout();
}

function loadDesignLayout() {
    let root = $('#chamber-app');
    let header = $('<div class="app-header"></div>');
    root.append(header);
    let content = $('<div class="app-content"></div>');
    root.append(content);
    let footer = $('<div class="app-footer"></div>');
    root.append(footer);

    let App_Top_Menu = new AppTopMenu(header, {
        onClose: () => closeApp(),
        onMinimize: () => minimizeApp(),
        onTheme: () => toggleTheme()
    });
    
    let App_Bottom_Menu = new AppBottomMenu(footer, {
        
    });
}
export { Main_Desktop };