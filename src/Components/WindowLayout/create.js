import { WindowPane } from "./WindowLayout";
import { FileBrowser } from "../FileBrowser/fileBrowser";
import { getLayout, getLayoutOBJ, getWorkspace, setCodeEditor, setLayout, setLayoutOBJ, setNodeTree } from "../../Runtime/global";
import { codeEditor } from "../CodeEditor/codeEditor";
import { debounce } from "../../utils/utils";
import { createBlueprint } from "../Blueprint/blueprint";
import { createMonitorLogs } from "../Monitor/Monitor";
import { getSession, setSession } from "../../Runtime/session";
import { Audio_entries, Automation_entries, Canvas2D_entries, Canvas3D_entries, Datastore_entries, Scripts_entries, WebView_entries } from "../../Runtime/defaults";

let configMap = {
    root: {
        root: true,
        type: 'row',
        name: 'root',
        parent: '#EditorContainer',
    },
    left:{
        type: 'stack',
        closeIcon:false,
        resizeIcon:false, 
        name: 'left', 
    },
    center:{
        type: 'stack', 
        name: 'center',
        closeIcon:false,
    },
    right: {
        type: 'column', 
        name: 'rightCol',
        closeIcon:false, 
        sizes:[40, 60],
    },
    rightBottom:{
        type: 'stack', 
        name: 'rightBottom',
        closeIcon:false,
    },
    explorer:{
        type: 'component', 
        name: 'explorer', 
        title: 'Explorer', 
        closeIcon:false,
        active:true,
        onLoad: (el, meta) => {
            let widgetMode = (meta.widgetMode ?? getSession('widgetMode')) || false;
            setSession('widgetMode', widgetMode);
            createNodeTree(el, {
                data: getWorkspace().workspaceTree,
                onSelect: node => getWorkspace().SelectedNode = node,
                widgetMode: widgetMode,
                onWidgetModeChange: function(mode){
                    setSession('widgetMode', mode);
                    this.widgetList.render();
                }
            });
        } 
    },
    monitor:{
        type: 'component', 
        name: 'monitor', 
        title: 'Monitor', 
        closeIcon:false,
        onLoad: el => createMonitorLogs(el)
    },
    viewPort:{
        type: 'component', 
        name: 'viewPort', 
        title: 'View Port',
        closeIcon:false, 
        active:true,
        onLoad: el =>{
            $('#ViewPortContainer').appendTo(el); 
            $('#ViewPortContainer').show();
        }
    },
    blueprint:{
        type: 'component', 
        name: 'blueprint', 
        title: 'Blueprint', 
        closeIcon:false,
        onLoad: el => createBlueprint(el)
    },
    focusView:{
        type: 'component', 
        name: 'focusView', 
        title: 'Focus View', 
        closeIcon:false,
        onLoad: el => el.text('FocusView')
    },
    codeEditor:{
        type: 'component', 
        name: 'codeEditor',
        closeIcon:false, 
        title: 'Code',
        active:true,
        onLoad: async el => {
            el.append(`<div id="Chamber_codeEditor_container">
                  <div id="Chamber_codeEditor"></div>
                </div>`);
            const Chamber_codeEditor = el.find('#Chamber_codeEditor');
            while(Chamber_codeEditor.is(':hidden'))
                await new Promise(r => setTimeout(r, 50));
            let editor = codeEditor(Chamber_codeEditor[0]);
            setCodeEditor(editor);
            let onChangeDebounce = debounce((e)=>{
                let workspace = getWorkspace();
                let node = workspace.SelectedNode;

                if(workspace.setCodePath && workspace.setCodePath === node.path){
                    workspace.setCodePath = null;
                    return;
                }

                if(node.code === editor.getValue())
                    return;

                node.code = editor.getValue();
                workspace.updateNode(node,`code-update: ${node.name}`,{ stringDiff: true })
            }, 500);
            getWorkspace().updateSelectedNode();
            editor.onDidChangeModelContent(onChangeDebounce);
        }
    },
    configEditor:{
        type: 'component', 
        name: 'configEditor', 
        title: 'Config', 
        closeIcon:false,
        onLoad: el => el.text('ConfigEditor') 
    }

}

export function addView(view){
    $('.designerPlaceholder').hide();
    let layout = getLayoutOBJ().getLayout();
    layout.children??=[];
    layout.children.push(configMap[view]);
    setLayout(layout);
    redrawWindowPanes();
}

export function removeView(view){
    if(view === 'viewPort'){
        $('#ViewPortContainer').hide();
        $('#ViewPortContainer').prependTo($('#BodyContainer')); 
    }
    let layout = getLayoutOBJ();
    const {_view, _parent, _index} = findView(layout, view);
    _view?.destroy();
    if(! layout?.children?.length ){
        $('.designerPlaceholder').show();
    }
    layout.render();
    setLayout(layout.getLayout());
}


export function redrawWindowPanes(){
    $('#ViewPortContainer').hide();
    $('#ViewPortContainer').prependTo($('#BodyContainer')); 
    getLayoutOBJ()?.destroy();
    setLayoutOBJ(createLayout());
}

function findView(layout, view, _parent = null, _index = null){
    if(!layout)
        return {_view:layout, _parent, _index};
    if(layout.name === view)
        return {_view:layout, _parent, _index};

    let _view;
    for (const [index, value] of layout.children?.entries() || []) {
        _view = findView(value, view, layout, index);
        if(_view)
            break;
    }
    return _view;
}

export function createLayout() {
    let layout = getLayout();
    if(!layout){
        // $('.designerPlaceholder').show();
        // layout = configMap.root;
        layout = getDefaultLayout();
        setLayout(layout);
    }
    let root =  WindowPane.createFromLayout(layout);
    root.render();
    return root;
}

function getDefaultLayout(){
   $('.designerPlaceholder').hide();
  let layout = {
        ...configMap.root,
        children:[
            {
                ...configMap.explorer,
                meta:{widgetMode:true},
            }
        ]
    }
    return layout;
}

function createDefaultLayout(){
    const root = new WindowPane({
        ...configMap.root,
        sizes:[20, 70, 30],
    });

    /* left */
    const left = new WindowPane({ 
        ...configMap.left,
        parent: root ,
    });
    new WindowPane({ 
        ...configMap.explorer,
        parent: left, 
    });
    new WindowPane({ 
        ...configMap.monitor,
        parent: left, 
    });

    /* center */
    const center = new WindowPane({ 
        ...configMap.center,
        parent: root,
    });
    new WindowPane({ 
        ...configMap.viewPort,
        parent: center, 
    });
      new WindowPane({ 
        ...configMap.blueprint,
        parent: center, 
    });

    /* right */
    const right = new WindowPane({ 
        ...configMap.right,
        parent: root,
    });
    new WindowPane({ 
        ...configMap.focusView,
        parent: right, 
    });

    const rightBottom = new WindowPane({ 
        ...configMap.rightBottom,
        parent: right,
    });

    new WindowPane({ 
       ...configMap.codeEditor,
       parent:rightBottom
    });
   new WindowPane({ 
        ...configMap.configEditor,
        parent: rightBottom, 
    });

    root.render();
    return root;
}


function createNodeTree(element, options = {}){   
    let _nodeTree = new FileBrowser(element, {
        data: options?.data || [],
        onSelect: options?.onSelect || (() => {}),
        onExpandCollapse: options?.onExpandCollapse || (() => {}),
        widgetMode: options?.widgetMode || false,
        onWidgetModeChange: options?.onWidgetModeChange || (() => {}),
        getWidgets: () => {
            let customWidgets = Object.keys(getWorkspace().treeMap).filter(x => x.split('/').length > 2 &&  x.split('/')[0] !== 'Projects');
            let list =  [
            ...WebView_entries,
            ...Scripts_entries,
            ...Datastore_entries,
            ...Automation_entries,
            ...Audio_entries,
            ...Canvas2D_entries,
            ...Canvas3D_entries
            ].map(x => ({...x, category: x.category || x.path.split('/')[0]}));

            return [...list, ...customWidgets.map(x => ({name: x.split('/').pop(), path: x, category:x.split('/')[0] , subCategories: ['Custom']}))];
        },
    });
    setNodeTree(_nodeTree);
}