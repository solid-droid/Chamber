import './Layout-Resizable.css';
export class Layout_Resizable{
    constructor(element, options={}){
        this.element = $(element);
        this.options = options;

        this.min = {
            left: this.options.minLeft || this.options.minWidth || 100,
            top: this.options.minTop || this.options.minHeight || 100,
            bottom: this.options.minBottom || this.options.minHeight || 100,
            right: this.options.minRight || this.options.minWidth || 100,
        }

        this.max = {
            left: this.options.maxLeft || this.options.maxWidth || Infinity,
            top: this.options.maxTop || this.options.maxHeight || Infinity,
            bottom: this.options.maxBottom || this.options.maxHeight || Infinity,
            right: this.options.maxRight || this.options.maxWidth || Infinity,
        }

        this.handlePosition = {
            left: this.options.leftPosition,
            top: this.options.topPosition,
            right: this.options.rightPosition,
            bottom: this.options.bottomPosition
        }

        this.handleDOM = {
            left: null,
            top: null,
            right: null,
            bottom: null
        }

        this.handleTracker = {
            left : null,
            top: null,
            right: null,
            bottom: null
        }

        this.resizeStart = this.options.resizeStart || function(){};
        this.resize = this.options.resize || function(){};
        this.resizeEnd = this.options.resizeEnd || function(){};

        
        if(this.options.left) this.addHandle('left');
        if(this.options.top) this.addHandle('top');
        if(this.options.bottom) this.addHandle('bottom');
        if(this.options.right) this.addHandle('right');

        this.render();
    } 

    render(){
        this.element.addClass('layout-resizable');
        if(this.options.left) this.resizeObserve('left');
        if(this.options.top) this.resizeObserve('top');
        if(this.options.bottom) this.resizeObserve('bottom');
        if(this.options.right) this.resizeObserve('right');
       $(window).on('resize', () => {
            this.sync();
        });
    }

    resizeObserve(side){
        this.handleDOM[side].on('mousedown', e => this.onPointerDown(e, side));
        this.handleDOM[side].on('touchstart',e => this.onPointerDown(e, side), {passive:false});
    }

    addHandle(side){
        this.handleDOM[side] = $(`<div class="resize-handle resize-handle-${side}"></div>`);
        this.element.append(this.handleDOM[side]);
    }

    onPointerDown(e, side){
      e.preventDefault();
      const rect = this.element[0].getBoundingClientRect();
      this.handleTracker[side] = {
        mouseX: (e.touches ? e.touches[0].clientX : e.clientX),
        mouseY: (e.touches ? e.touches[0].clientY : e.clientY),
        startW: rect.width,
        startH: rect.height
      };
      $(document).on('mousemove', e => this.onPointerMove(e, side));
      $(document).on('mouseup', e => this.onPointerUp(e, side));
      $(document).on('touchmove',  e => this.onPointerMove(e, side), {passive:false});
      $(document).on('touchend',  e => this.onPointerUp(e, side));
    }

    sync(){
        const box = this.element[0];
        const rect = box.getBoundingClientRect();

        // 🛑 Skip sync if element is hidden or collapsed
        if (rect.width === 0) return;

        let changed = false;

        // Handle width (left/right)
        if (this.options.left || this.options.right) {
            const { min, max } = this.minmax(this.options.right ? 'right' : 'left');
            const currentWidth = rect.width;
            const clampedWidth = this.clamp(currentWidth, min, max);
            if (currentWidth !== clampedWidth) {
                box.style.width = clampedWidth + 'px';
                changed = true;
            }
        }

        // Handle height (top/bottom)
        if (this.options.top || this.options.bottom) {
            const { min, max } = this.minmax(this.options.bottom ? 'bottom' : 'top');
            const currentHeight = rect.height;
            const clampedHeight = this.clamp(currentHeight, min, max);
            if (currentHeight !== clampedHeight) {
                box.style.height = clampedHeight + 'px';
                changed = true;
            }
        }

        // Trigger resize callback if adjusted
        if (changed) {
            this.resize({
                element: this.element,
                width: box.offsetWidth,
                height: box.offsetHeight
            });
        }
    }

    onPointerMove(e, side){
      if(!this.handleTracker[side]) return;

      e.preventDefault();
      const box = this.element[0];
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const y = (e.touches ? e.touches[0].clientY : e.clientY);
      let dx = x - this.handleTracker[side].mouseX;
      let dy = y - this.handleTracker[side].mouseY;
      const {min, max} = this.minmax(side);
      if(side === 'top' || side === 'bottom'){
        const newH = this.clamp(this.handleTracker[side].startH + dy, min, max);
        box.style.height = newH + 'px';
      } 
      
      if(side === 'right'){
        const newW = this.clamp(this.handleTracker[side].startW + dx, min, max);
        box.style.width = newW + 'px';
      }

      if(side === 'left'){
        const newW = this.clamp(this.handleTracker[side].startW - dx, min, max);
        box.style.width = newW + 'px';
      }

    }

    minmax(side){
        let min, max;
        // handle min
        if (String(this.min[side]).includes('%')) {
            min = (parseFloat(this.min[side]) / 100) * this.element.parent().width();
        } else {
            min = parseFloat(this.min[side]);
        }

        // handle max
        if (String(this.max[side]).includes('%')) {
            max = (parseFloat(this.max[side]) / 100) * this.element.parent().width();
        } else {
            max = parseFloat(this.max[side]);
        }

        return {min,max};
    }
    clamp(v, a, b){ 
        return Math.min(b, Math.max(a, v)); 
    }
    onPointerUp(e, side){
      this.handleTracker[side] = null;
      $(document).off('mousemove', e => this.onPointerMove(e, side));
      $(document).off('mouseup', e => this.onPointerUp(e, side));
      $(document).off('touchmove', e => this.onPointerMove(e, side));
      $(document).off('touchend', e => this.onPointerUp(e, side));
    }

}