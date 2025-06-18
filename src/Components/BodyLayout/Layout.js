import './Layout.css';
import { editorStackConfig, layoutConfig } from '../../configs';
import { createEditor, createNodeTree } from '../Editor/editor';
import { getWorkspace } from '../../Runtime/global';

export class layoutWrapper{
    constructor(selector, config){
        this.config = config;
        this.layout = new GoldenLayout(config,  $(selector));
        this.addEvents();
        this.addScreens(config);
        this.layout.init();
        $(window).resize( () => {
            this.layout.updateSize($(window).width(), $(window).height()-26);
        });
    }

    addEvents() {
        const self = this;
        let dragSourceStackId = null;

        this.layout.on('stackCreated', (stack) => {
            const id = stack.config.id;

            if (id === 'DesignModeStack') {
                self.DesignModeStack = stack;
            }

            if (id === 'ViewPortStack') {
                self.ViewPortStack = stack;
            }

            // Add dragStart listeners to all components inside this stack
            stack.contentItems.forEach((item) => {
                if (item.isComponent && item.container) {
                    item.container.on('dragStart', () => {
                        const parentId = item.parent?.config?.id;
                        dragSourceStackId = parentId || null;
                        console.log(`Dragging from ${dragSourceStackId}`);
                    });
                }
            });
        });

        this.layout.on('itemDropped', (item) => {
            const targetStackId = item.parent?.config?.id;

            if (
                targetStackId === 'DesignModeStack' ||
                targetStackId === 'ViewPortStack'
            ) {
                console.warn('⛔ Drop from DesignModeStack to ViewPortStack is not allowed. Reverting...');

                // Remove the dropped item
                item.remove();

                // Add back to DesignModeStack
                this.layout.root.contentItems[0]?.addChild(item.config);
            }

            dragSourceStackId = null;
        });

        this.layout.on('initialised', () => {
            console.log('✅ Layout initialized. Drag control active.');
        });
    }

    addScreens(config){
        config?.content?.forEach(item => {
            if(item?.content?.length)
                this.addScreens(item);
            else {
                this.registerComponent(item)
            }            
        });
    }

    resize(){
        this.onResize?.();
        this.layout.updateSize($(window).width(), $(window).height()-30);
    }

    registerComponent(config){
        let self = this;
        this.layout.registerComponent(config.componentName,  function( container, state ){
            setTimeout(() => {
                self.onRegister?.(config, container, state);
            },100);
        });
    }

    destroy(){
        this.onDestroy?.();
        this.layout?.destroy();
    }

    getStack(id = ''){
        return this.layout._findAllStackContainers().find(x => x.config.id === id);
    }

    add(parent, config){
        if(parent === 'root'){
            parent = this.layout.root.contentItems[0]
        }


        if(parent && config){
            this.addScreens(config);
            parent.addChild(config);
        }
    }

}

export function createLayout(){
    let config = JSON.parse(JSON.stringify(layoutConfig));
    config.content[0].content[0].width = (250 / window.innerWidth) * 100;
    let layout = new layoutWrapper('#EditorContainer', config);
    let nodeTree, editorTabContainer;
    const getEditorTabContainer = () => editorTabContainer;

    layout.onRegister = (config, container) => {
        if(config.id === 'ViewPortTab'){
            $(container.getElement()).append($('#ViewPortContainer'));
            return;
        }
        if(config.id === 'NodeTreeTab'){
            nodeTree = createNodeTree(container.getElement(), {
                data: getWorkspace().workspaceTree,
                onSelect: async e => {
                    let editorStack = layout.getStack('editorStack');
                    if(!editorStack){
                        layout.add('root', editorStackConfig)
                    }
                    await new Promise(r => setTimeout(r, 200));
                    // createEditor(getEditorTabContainer(), e)
                }
            });
            return;
        }

        if(config.id = "editorTab"){
            editorTabContainer = container.getElement();
        }
        
    }
    layout.onDestroy = () => {
        $('#BodyContainer').prepend($('#ViewPortContainer'));
    }

    return layout;
}