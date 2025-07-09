import { getWorkspace } from '../Runtime/global';
import { createLayout } from '../Components/WindowLayout/create';
import { getWindow } from '../utils/tauri';
// const { invoke } = window.__TAURI__.core;

let BodyLayout;

export async function attachHeaderEvents({
    devMode,
    remoteAccess
}){
    attachVersionFileInput();
    attachWindowButtons();
    // attachDevTools();
    attachRemoteAccess(remoteAccess);
    attachDesignMode(devMode);
    attachExportButton();
    attachPackagesButton();

    if(!devMode.value)
        return;

    //Devmode / Designmode code
    await new Promise(r => setTimeout(r, 1000))
    showDevMode(devMode.value);
}

function attachExportButton(){
    $('#head-tools .exportButton').on('click',()=>{
       getWorkspace().export();
    });
}

function attachPackagesButton(){
     $('#head-tools .packagesButton').on('click',()=>{
       alert('Plugins, Components, Workspaces')
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

function attachDesignMode(devMode){
    $('#head-tools .designMode').on('click', ()=>{
        devMode.value  = !devMode.value ;
        showDevMode(devMode.value);
    });
}

function attachVersionFileInput(){
    $('#head-tools .loadWorkspace').on('click',async ()=>{
         $('#versionFileInput').trigger('click');
    });

    $('#versionFileInput').on('change', async () => {
        const file = $('#versionFileInput')[0].files[0];
        if (!file) return;
        
     
        if(file.type == 'application/json') {
            const jsonContent = await file.text();
            getWorkspace().import(JSON.parse(jsonContent));
        } else if(file.type == 'application/octet-stream') {
            const content = await file.arrayBuffer(); // or file.arrayBuffer() for binary
            const uint8Array = new Uint8Array(content);
            const workspaceData = await window.JsonHandler.extract(uint8Array, {isEncrypted:true, seed:'chamber'});
            getWorkspace().import(workspaceData);
        }

        // $('#versionFileInput').val('');
    });
}

function attachWindowButtons(){
    $('#head-tools .closeButton').on('click', async() => {
            await getWindow().close();
    });

    $('#head-tools .minimizeButton').on('click',async () => {
        await getWindow().minimize();
    });
    
    $('#head-tools .maximizeButton').on('click',async () => {
        if(await getWindow().isMaximized())
            await getWindow().unmaximize();
        else
            await getWindow().maximize();
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

    // $('#head-tools .devTools').on('click',async () => {
    //     invoke('open_devtools_command');
    // });
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