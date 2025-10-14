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
        rows: ['30px', '1fr', '25px'],
        columns: ['38px', '1fr', '38px'],
    });
    root.append(Layout.element);

    //add left pane
    let PaneLeft = new UI.Module.PaneLeft({
        type: 'MenuBar', 
        isVisible: true,
        minimized:true,
        onResize: minimized =>{
            if(minimized){
                Layout.resizeColumn(0, '40px');
            } else {
                Layout.resizeColumn(0, '20%');
            }
        }
    });
    Layout.addBlock(1, 2, 0, 1, PaneLeft.element);

    let PaneRight = new UI.Module.PaneRight({
        type: 'RightPaneToolbar', 
        isVisible: true, 
        minimized:true,
        onResize: minimized =>{
            if(minimized){
                Layout.resizeColumn(2, '40px');
            } else {
                Layout.resizeColumn(2, '20%');
            }
        }
    });
    Layout.addBlock(1, 2, 2,3, PaneRight.element);

    let PaneTop = new UI.Module.PaneTop({
        type: 'HeaderToolbar', 
        isVisible: true,
        minimized:true,
        onResize: minimized =>{
            if(minimized){
                Layout.resizeRow(0, '30px');
            } else {
                Layout.resizeRow(0, '20%');
            }
        }
    });
    Layout.addBlock(0, 0, 0, 3, PaneTop.element);

    let PaneBottom = new UI.Module.PaneBottom({
        type: 'FooterToolbar', 
        isVisible: true,
        minimized:true,
        onResize: minimized =>{
            if(minimized){
                Layout.resizeRow(2, '25px');
            } else {
                Layout.resizeRow(2, '20%');
            }
        }
    });
    Layout.addBlock(2, 2, 0, 3, PaneBottom.element);
}
export { Main_Desktop };