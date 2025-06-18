class LayoutWrapper {
    constructor(element){
        this.container = $(element);
        this.container.css({'border':'solid 1px red'})
    }
}

export function createLayout() {
   let layout = new LayoutWrapper('#EditorContainer');
   return layout;
}
