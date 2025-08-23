import { getLayout, getLayoutOBJ, getWorkspace, setLayout, setLayoutOBJ } from '../Runtime/global';
import { addView, createLayout, removeView } from '../Components/WindowLayout/create';
import { getWindow } from '../utils/tauri';
// const { invoke } = window.__TAURI__.core;

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
    attachLayoutButton();

    if(!devMode.value)
        return;

    //Devmode / Designmode code
    await new Promise(r => setTimeout(r, 1000))
    showDevMode(devMode.value);
}

function attachLayoutButton(){
    let layoutMenuState = false;
      $('#head-tools .layoutbutton').on('click',()=>{
        layoutMenuState = !layoutMenuState;
        if(layoutMenuState){
            $('#head-tools .layoutSubMenu').show();
            $('#head-tools .layoutbutton').addClass('active');
            let layout = getLayout();
            let views = new Set([    
                            "explorer", 
                            "monitor",
                            "viewPort",
                            "blueprint",
                            "focusView",
                            "codeEditor",
                            "configEditor"
                        ]);
            let list = getActiveViews(layout);
            let activeViews = list.intersection(views);
            [...views].forEach(x => {
                $(`#head-tools .${x}`).removeClass('active');
                $(`#head-tools .${x}`).off('click').on('click',()=>{
                    if($(`#head-tools .${x}`).hasClass('active')){
                        $(`#head-tools .${x}`).removeClass('active');
                        removeView(x);
                    } else {
                        $(`#head-tools .${x}`).addClass('active');
                        addView(x);
                    }
                    
                })
            });
            [...activeViews].forEach(x =>{
                $(`#head-tools .${x}`).addClass('active');
            });

        } else {
            $('#head-tools .layoutSubMenu').hide();
            $('#head-tools .layoutbutton').removeClass('active');
        }
        
    });
    
}

function getActiveViews(layout, list = new Set()){
    list.add(layout.name);
    layout.children?.forEach(x => {
        getActiveViews(x, list);
    });
    return list;
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
            $('#ViewPortContainer').hide();
            let BodyLayout = createLayout();
            setLayoutOBJ(BodyLayout);
            getWorkspace().updateSelectedNode(getWorkspace().SelectedNode);
        } else {
            $('#head-tools .chamber-devmode').hide();
            $('#head-tools .designMode').removeClass('active');
            $('#ViewPortContainer').prependTo($('#BodyContainer')); 
            $('#ViewPortContainer').show();
            setLayout(getLayoutOBJ().getLayout());
            getLayoutOBJ()?.destroy();
            $('#head-tools #projectName').text('');
        }
}