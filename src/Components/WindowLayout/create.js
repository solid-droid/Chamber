import { WindowPane } from "./WindowLayout";
import { FileBrowser } from "../FileBrowser/fileBrowser";
import { getWorkspace, setCodeEditor, setNodeTree } from "../../Runtime/global";
import { codeEditor } from "../CodeEditor/codeEditor";
import { debounce } from "../../utils/utils";
import { createBlueprint } from "../Blueprint/blueprint";

export function createLayout() {
    const root = new WindowPane({
        root: true,
        type: 'row',
        name: 'root',
        sizes:[20, 70, 30],
        parent: '#EditorContainer',
    });

    /* left */
    const left = new WindowPane({ 
        type: 'stack',
        closeIcon:false,
        resizeIcon:false, 
        name: 'left', 
        parent: root ,
    });
    new WindowPane({ 
        type: 'component', 
        name: 'explorer', 
        title: 'Explorer', 
        closeIcon:false,
        resizeIcon:false, 
        active:true,
        parent: left, 
        onLoad: el => {
            createNodeTree(el, {
                data: getWorkspace().workspaceTree
            });
        } 
    });
    new WindowPane({ 
        type: 'component', 
        name: 'datastore', 
        title: 'Datastore', 
        closeIcon:false,
        resizeIcon:false, 
        parent: left, 
        onLoad: el => el.text('Datastore - Varaiables, Signals and file storage')
    });

    /* center */
    const center = new WindowPane({ 
        type: 'stack', 
        name: 'center',
        parent: root,
        closeIcon:false,
    });
    new WindowPane({ 
        type: 'component', 
        name: 'ViewPort', 
        title: 'View Port',
        closeIcon:false, 
        active:true,
        parent: center, 
        onLoad: el =>{
            $('#ViewPortContainer').appendTo(el); 
        }
    });
      new WindowPane({ 
        type: 'component', 
        name: 'blueprint', 
        title: 'Blueprint', 
        closeIcon:false,
        resizeIcon:false, 
        parent: center, 
        onLoad: el => createBlueprint(el)
    });

    /* right */
    const right = new WindowPane({ 
        type: 'column', 
        name: 'rightCol',
        closeIcon:false, 
        parent: root,
        sizes:[40, 60],
    });
    new WindowPane({ 
        type: 'component', 
        name: 'FocusView', 
        title: 'Focus View', 
        closeIcon:false,
        parent: right, 
        onLoad: el => el.text('FocusView')
    });

    const rightBottom = new WindowPane({ 
        type: 'stack', 
        name: 'rightBottom',
        closeIcon:false, 
        parent: right,
    });

    new WindowPane({ 
        type: 'component', 
        name: 'CodeEditor',
        closeIcon:false, 
        title: 'Code',
        active:true,
        parent: rightBottom,
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
                console.log(e);
            }, 500);
            editor.onDidChangeModelContent(onChangeDebounce);
        }
    });
   new WindowPane({ 
        type: 'component', 
        name: 'ConfigEditor', 
        title: 'Config', 
        closeIcon:false,
        parent: rightBottom, 
        onLoad: el => el.text('ConfigEditor') 
    });

    root.render();
    return root;
}


function createNodeTree(element, options = {}){   
    let _nodeTree = new FileBrowser(element, {
        data: options?.data || [],
        onSelect: options?.onSelect || (() => {}),
        onExpandCollapse: options?.onExpandCollapse || (() => {})
    });
    setNodeTree(_nodeTree);
}