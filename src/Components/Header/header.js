import { getCurrentWindow } from '@tauri-apps/api/window';
const { invoke } = window.__TAURI__.core;

export function configueToolbar({
    getWorkspace,
    getEditor,
    devMode,
    openFileBrowser,
    inspectMode
}){

    if(window.isDev){
        $('.devTools').show();
    }

    setTimeout(()=>{
        if(devMode.value){
            showDevMode(getEditor(),devMode.value);
            if(openFileBrowser.value)
                showFileBrowser(getEditor(),openFileBrowser.value);
            if(inspectMode.value)
                showInspectMode(getEditor(),inspectMode.value);
        }
    },1000);

    $(document).on('keydown', (e) => {
        if (e.key === 'F11') {
            windowAPI.appWindow.openDevtools();
            e.preventDefault();
        }
    });

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

    $('#head-tools .devTools').on('click',async () => {
            invoke('open_devtools_command');
    });

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


    
    $('#head-tools .inspectMode').on('click', ()=>{
        inspectMode.value = !inspectMode.value;
        showInspectMode(getEditor(),inspectMode.value);
     });

     $('#head-tools .designMode').on('click', ()=>{
        devMode.value  = !devMode.value ;
        showDevMode(getEditor(),devMode.value);
        if(!devMode.value){
            openFileBrowser.value  = false ;
            inspectMode.value = false;
            showFileBrowser(getEditor(),openFileBrowser.value);
            showInspectMode(getEditor(),inspectMode.value);
        }
     });

     $('#head-tools .fileBrowser').on('click', ()=>{
        openFileBrowser.value  = !openFileBrowser.value ;
        showFileBrowser(getEditor(),openFileBrowser.value);
     });

     $('#head-tools .exportButton').on('click',()=>{
        getWorkspace().export();
     });
}

function showInspectMode(editor, value){
     if(value){
            $('#head-tools .inspectMode').addClass('active');
            editor.showInspectMode(value);
    } else {
        $('#head-tools .inspectMode').removeClass('active');
        editor.showInspectMode(value);
    }
}

function showFileBrowser(editor, value){
    if(value){
            $('#head-tools .fileBrowser').addClass('active');
            editor.showFileBrowser(value);
    } else {
        $('#head-tools .fileBrowser').removeClass('active');
        editor.showFileBrowser(value);
    }
}

function showDevMode(editor, value){
        if(value){
            $('#head-tools .chamber-devmode').css({'display':'flex'});
            $('#head-tools .designMode').addClass('active');
            editor.activateDevMode(value);
        } else {
            $('#head-tools .chamber-devmode').hide();
            $('#head-tools .designMode').removeClass('active');
            editor.activateDevMode(value);
        }
}