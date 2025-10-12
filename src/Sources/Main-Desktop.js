import { resizeWindow } from "../Services/System/Framework/Tauri.js";
import { UI } from "../UI/UI.js";
import { log } from "./../Services/System/Framework/logger.js";

async function Main_Desktop() {
    //desktop specific code here
    log("Desktop Detected");
    await resizeWindow(900, 650);
    $('#Loading-Screen').fadeOut(500, function() {
        $(this).remove();
    });

    loadDesignLayout();
}

function loadDesignLayout() {
    let root = $('#chamber-app');

    //create grid layout
    let Layout = new UI.Atomic.Layout.Grid({
        height:'100%',
        width:'100%',
        gap:'0px',
        rows: ['25px', '1fr', '20px'],
        columns: ['200px', '1fr', '300px'],
    });
    root.append(Layout.element);

    //add left pane
    let PaneLeft = new UI.Module.PaneLeft({type: 'MenuBar', isVisible: true, width: 200});
    Layout.addBlock(1, 2, 0, 1, PaneLeft.element);

    let PaneTop = new UI.Module.PaneTop({type: 'HeaderToolbar', isVisible: true, height: 20});
    Layout.addBlock(0, 0, 0, 3, PaneTop.element);
}
export { Main_Desktop };