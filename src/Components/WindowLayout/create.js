import { WindowPane } from "./WindowLayout";
import { FileBrowser } from "../FileBrowser/fileBrowser";
import { getWorkspace, setNodeTree } from "../../Runtime/global";

export function createLayout() {
    const root = new WindowPane({
        root: true,
        type: 'row',
        name: 'root',
        sizes:[30, 60, 30],
        parent: '#EditorContainer'
    });

    /* left */
    const left = new WindowPane({ 
        type: 'stack',
        closeIcon:false,
        resizeIcon:false, 
        name: 'left', 
        parent: root ,
    });
    const explorer = new WindowPane({ 
        type: 'component', 
        name: 'explorer', 
        title: 'Explorer', 
        closeIcon:false,
        resizeIcon:false, 
        parent: left, 
        onLoad: el => {
            createNodeTree(el, {
                data: getWorkspace().workspaceTree
            });
        } 
    });

    /* center */
    const center = new WindowPane({ 
        type: 'stack', 
        name: 'center',
        parent: root,
    });
    const viewPort = new WindowPane({ 
        type: 'component', 
        name: 'ViewPort', 
        title: 'View Port', 
        active:true,
        parent: center, 
        onLoad: el =>{
            $('#ViewPortContainer').appendTo(el); 
        }
    });
     const focusView = new WindowPane({ 
        type: 'component', 
        name: 'FocusView', 
        title: 'Focus View', 
        parent: center, 
        onLoad: el => el.text('FocusView')
    });

    /* right */
    const right = new WindowPane({ 
        type: 'column', 
        name: 'rightCol', 
        parent: root,
    });
    const codeEditor = new WindowPane({ 
        type: 'component', 
        name: 'CodeEditor', 
        title: 'Editor',
        parent: right,
        onLoad: el => el.text('CodeEditor')
    });
    const configEditor = new WindowPane({ 
        type: 'component', 
        name: 'ConfigEditor', 
        title: 'Config', 
        parent: right, 
        onLoad: el => el.text('ConfigEditor') 
    });

    root.render();
    return root;
}


function createNodeTree(element, options = {}){   
    let _nodeTree = new FileBrowser(element, {
        data: options?.data || [],
        onSelect: options?.onSelect || (() => {}),
        onIconClick: options?.onIconClick || (() => {}),
        onExpandCollapse: options?.onExpandCollapse || (() => {})
    });
    setNodeTree(_nodeTree);
}