export class dragable {
    constructor(element, options = {}) {
        this.element = $(element);
        this.options = options;
        this.options.onDragStart = this.options.onDragStart || (() => {});
        this.options.onDrag = this.options.onDrag || (() => {});
        this.options.onDrop = this.options.onDrop || (() => {});
        this.dragStarted = false;
        this.hasDragged = false;
        this.dragThreshold = 0;
        this.init();
    }

    init() {
        this.element.on('mousedown', (e) => this.onMouseDown(e));
        $(document).on('mousemove', (e) => this.onMouseMove(e));
        $(document).on('mouseup', (e) => this.onMouseUp(e));
    }

    onMouseDown(e) {
        this.dragStarted = true;
        this.startX = e.pageX;
        this.startY = e.pageY;
        this.options.onDragStart(e);
    }

    onMouseMove(e) {
        if (!this.dragStarted) return;

        const dx = e.pageX - this.startX;
        const dy = e.pageY - this.startY;

        if (Math.abs(dx) > this.dragThreshold || Math.abs(dy) > this.dragThreshold) {
            this.hasDragged = true;
            this.options.onDrag(e, { dx, dy });
        }
    }

    onMouseUp(e) {
        if (this.dragStarted) {
            this.dragStarted = false;
            if (this.hasDragged) {
                this.options.onDrop(e);
            }
        }
    }
}