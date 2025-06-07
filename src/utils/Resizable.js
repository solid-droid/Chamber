export default class Resizable{

    constructor(selector, options = {}){
        options.left = options.left || false;
        options.right = options.right || false;
        options.bottom = options.bottom || false;
        options.right = options.right || false;

        options.minWidth = options.minWidth || 200;
        options.maxWidth = options.maxWidth || null;
        options.minHeight = options.minHeight || 200;
        options.maxHeight = options.maxHeight || null;

        options.minTop = options.minTop || 40;
        this.options = options;
        this.resizableDiv = $(selector);
        this.addResizeHandle();
        this.attachResizeEvents();
    }
    addResizeHandle(){
        this.resizableDiv.prepend(`
            ${this.options.left ? '<div class="resizer-left resizer"></div>': ''}
            ${this.options.top ? '<div class="resizer-top resizer"></div>' : ''}
            ${this.options.right ? '<div class="resizer-right resizer"></div>' : ''}
            ${this.options.bottom ? '<div class="resizer-bottom resizer"></div>' : ''}
        `)
        this.resizer = this.resizableDiv.find('.resizer');
        this.isResizing = false;
        this.initialX = 0;
        this.initialY = 0;
        this.initialTop = 0;
        this.initialWidth = 0;
        this.initialHeight = 0;
    }
    
    attachResizeEvents(){
        this.resizer.on('mousedown', (e) => {
            this.onMouseDown(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isResizing) return;
            this.onMouseMove(e);
        });

        document.addEventListener('mouseup', () => {
            this.isResizing = false;
        });
    }

    onMouseDown(e){
        this.initialX = e.clientX;
        this.initialY = e.clientY;
        this.initialTop = this.resizableDiv[0].offsetTop;
        this.initialWidth = this.resizableDiv[0].offsetWidth;
        this.initialHeight = this.resizableDiv[0].offsetHeight;
        let classList = [...e.target.classList];

        if(classList.includes('resizer-left')){
            this.isResizing = 'left';
        } else if(classList.includes('resizer-top')){
            this.isResizing = 'top';
        } else if(classList.includes('resizer-bottom')){
            this.isResizing = 'bottom';
        } else if(classList.includes('resizer-right')){
            this.isResizing = 'right';
        }
        e.preventDefault();
    }

    onMouseMove(e){
                        
        const minWidth = this.options.minWidth;
        const maxWidth = this.options.maxWidth || window.innerWidth - 50;
        const minHeight = this.options.minHeight;
        const maxHeight = this.options.maxHeight || window.innerHeight - 50;

        if(this.isResizing === 'left'){
            const newWidth = this.initialWidth - (e.clientX - this.initialX);
            if (newWidth > minWidth && newWidth < maxWidth) {
                if(this.options.leftControl){
                    this.resizableDiv.css('margin-left' , `${this.initialMarginLeft + (e.clientX - this.initialX)}px`)
                }
                this.resizableDiv[0].style.width = `${newWidth}px`;
            }
        } else if(this.isResizing === 'right'){
            const newWidth = this.initialWidth + (e.clientX - this.initialX);
            if (newWidth > minWidth && newWidth < maxWidth) {
                this.resizableDiv[0].style.width = `${newWidth}px`;
            }
        } else if (this.isResizing === 'top') {
            const clientY = e.clientY;
            const deltaY = clientY - this.initialY;
            const newHeight = this.initialHeight - deltaY;

            if (newHeight > minHeight && newHeight < maxHeight) {
                const newTop = this.initialTop + deltaY;

                // Make sure new top doesn't go above minTop and bottom stays fixed
                if (newTop >= this.options.minTop) {
                    this.resizableDiv[0].style.top = `${newTop}px`;
                    this.resizableDiv[0].style.height = `${newHeight}px`;
                }
            }
        } else if (this.isResizing === 'bottom') {
            const newHeight = this.initialHeight + (e.clientY - this.initialY);
            if (newHeight > minHeight && newHeight < maxHeight) {
                this.resizableDiv[0].style.height = `${newHeight}px`;
            }
        }
    }

    resize(css){
        this.resizableDiv.css(css)
    }

}