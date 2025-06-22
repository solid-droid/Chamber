import { getCurrentWindow } from '@tauri-apps/api/window';
import { getWorkspace } from '../Runtime/global';
import { createLayout } from '../Components/WindowLayout/create';
const { invoke } = window.__TAURI__.core;

let BodyLayout;

export async function attachHeaderEvents({
    devMode,
    inspectMode,
    remoteAccess
}){
    attachVersionFileInput();
    attachWindowButtons();
    // attachDevTools();
    attachRemoteAccess(remoteAccess);
    attachDesignMode(devMode, ()=>{
        if(!devMode.value){
            inspectMode.value = false;
            showInspectMode(inspectMode.value);
        }
    });
    attachInspectMode(inspectMode);
    attachExportButton();

    if(!devMode.value)
        return;

    //Devmode / Designmode code
    await new Promise(r => setTimeout(r, 1000))
    showDevMode(devMode.value);
    showInspectMode(inspectMode.value);   
}

function attachExportButton(){
    $('#head-tools .exportButton').on('click',()=>{
       getWorkspace().export();
    });
}

function attachInspectMode(inspectMode){
    $('#head-tools .inspectMode').on('click', ()=>{
        inspectMode.value = !inspectMode.value;
        showInspectMode(inspectMode.value);
    });
}

function attachRemoteAccess(remoteAccess){
     $('#head-tools .remoteAccess').on('click', ()=>{
        remoteAccess.value  = !remoteAccess.value ;
        if(remoteAccess.value ){
            $('#head-tools .remoteAccess').addClass('active activeGreen');
        } else {
            $('#head-tools .remoteAccess').removeClass('active activeGreen');
        }

    });
}

function attachDesignMode(devMode, callback){
    $('#head-tools .designMode').on('click', ()=>{
        devMode.value  = !devMode.value ;
        showDevMode(devMode.value);
        callback();
    });
}

function attachVersionFileInput(){
    $('#head-tools .loadProject').on('click',async ()=>{
         $('#versionFileInput').trigger('click')
    });

    $('#versionFileInput').on('change', async () => {
        const file = $('#versionFileInput')[0].files[0];
        if (!file) return;
        
        console.log("📄 Filename:", file.name);
        
        const content = await file.arrayBuffer(); // or file.arrayBuffer() for binary
        const uint8Array = new Uint8Array(content);
        const workspaceData = await window.JsonHandler.extract(uint8Array, {isEncrypted:true, seed:'chamber'});
        getWorkspace().import(workspaceData);

        $('#versionFileInput').val('');
    });
}

function attachWindowButtons(){
    $('#head-tools .closeButton').on('click', async() => {
            await getCurrentWindow().close();
    });

    $('#head-tools .minimizeButton').on('click',async () => {
        await getCurrentWindow().minimize();
    });
    
    $('#head-tools .maximizeButton').on('click',async () => {
        if(await getCurrentWindow().isMaximized())
            await getCurrentWindow().unmaximize();
        else
            await getCurrentWindow().maximize();
        getWorkspace()?.resize();
    });
}

function attachDevTools(){
    if(!window.isDev){
        $('.devTools').hide();
        return;
    }
    $('.devTools').show();
    $(document).on('keydown', (e) => {
        if (e.key === 'F11') {
            windowAPI.appWindow.openDevtools();
            e.preventDefault();
        }
    });

    $('#head-tools .devTools').on('click',async () => {
        invoke('open_devtools_command');
    });
}

function showInspectMode(value){
     if(value){
            $('#head-tools .inspectMode').addClass('active');
            // showInspectMode(value);
    } else {
        $('#head-tools .inspectMode').removeClass('active');
        // editor.showInspectMode(value);
    }
}

function showDevMode(value){
        if(value){
            $('#head-tools .chamber-devmode').css({'display':'flex'});
            $('#head-tools .designMode').addClass('active');
            BodyLayout = createLayout();
        } else {
            $('#head-tools .chamber-devmode').hide();
            $('#head-tools .designMode').removeClass('active');
            $('#ViewPortContainer').prependTo($('#BodyContainer')); 
            BodyLayout?.destroy();
        }
}