import { Droppable } from './Dropable';
import './WindowLayout.css';
import Split from './Split';

export class WindowPane {
  static panes = {};
  static splits = {};

  constructor(config = {}) {
    this.config = config;
    this.root = config.root;
    this.type = config.type;
    this.children = [];
    this.name = this.config.name || '';
    this.isMinimized = !config.root;
    this.isFullscreen = false;

    this.minWidth = this.config.minWidth || this.config.minSize || 200;
    this.minHeight = this.config.minHeight || this.config.minSize || 200;

    this.onDragStart = config.onDragStart || (() => {});
    this.onDragEnd = config.onDragEnd || (() => {});
    this.onDrag = config.onDrag || (() => {});
    this.onLoad = config.onLoad || (() => {});
    this.onDestroy = config.onDestroy || (() => {});

    this.load();
  }

  load() {
    this.ParentElement = this.root ? $(this.config.parent) : this.config.parent.getElement();
    this.ParentPane = this.root ? null : this.config.parent;
    this.destroy();
    this.createElement();
    this.ParentElement.append(this.element);
    this.ParentPane?.addChild(this);
    this.createHeader();
    this.createBody();
    this.attachEvents();
    this.onLoad(this.body);
    WindowPane.panes[this.name] = this;
  }

  addChild(pane) {
    if (!this.children.length) {
      pane.active = true;
    }
    this.children.push(pane);
    pane.ParentPane = this;
    this.createHeader();
  }

  removeChild(pane) {
    const index = this.children.findIndex(x => x.name === pane.name);
    if (index > -1) this.children.splice(index, 1);
    this.createHeader();
  }

  getElement(name) {
    if (!name) return this.body;
    const child = this.children.find(x => x.name === name);
    return child?.getElement();
  }

  getTypeConfig() {
    return {
      row: { containerClass: 'w_row_container' },
      column: { containerClass: 'w_column_container' },
      stack: { containerClass: 'w_stack_container' },
      component: { containerClass: 'w_component_container' }
    }[this.type];
  }

  createElement() {
    this.element = $(`<div class="w_container ${this.getTypeConfig().containerClass}" data-name="${this.name}"></div>`);
    this.element.css({ 
        // border: 'solid 1px red', 
        display: 'none' });
    this.element.data('WindowPane', this);

    this.header = $('<div class="w_header"></div>');
    this.body = $('<div class="w_body"></div>');

    this.element.append(this.header);
    this.element.append(this.body);
  }

  attachEvents() {
    if((['row', 'column'].includes(this.type)))
        return;

    this.header.off('click').on('click', (e) => {
      if ($(e.target).hasClass('closeBtn')) {
        // close logic
        return;
      }
    });

    this.header.off('click', '.w_leftHeader>.w_header').on('click', '.w_leftHeader>.w_header', (e) => {
    //   e.stopPropagation();
      let selectedPane = this.children.find(x => x.name === $(e.currentTarget).data().name);
      if ($(e.target).hasClass('closeBtn')) {
        // close logic
        return;
      }
      this.children.forEach(x => x.hide());
      selectedPane.show();
    });
  }

  createHeaderContent(headerElem,name){
    const headerRight = `
      <div class="w_rightHeader">
        <div class="w_toggleMinMax">
          <i class="fa-solid fa-window-maximize minMaxBtn"></i>
        </div>
        <div class="w_close">
          <i class="fa-solid fa-xmark closeBtn"></i>
        </div>
      </div>`;
      const headerLeft = `
        <div class="w_leftHeader"></div>
      `
     headerElem.attr('data-name', name);
     headerElem.append(headerLeft);
     headerElem.append(headerRight);
     return headerElem;
  }
  createHeader() {
    this.header.empty();
    if (['row', 'column'].includes(this.type)) {
        this.header.hide();
        return;
    }

    this.header = this.createHeaderContent(this.header, this.name);

    if(this.type === 'component'){
        this.header.find('.w_leftHeader').append(`<div class="w_title">${this.config.title}</div>`)
        if (this.ParentPane.type !== 'stack') {
            this.header.css({ display: 'flex' });
            this.header.addClass('drop-zone');
        }
    }

    if(this.type === 'stack'){
        this.header.addClass('drop-zone')
        let stackHead = this.header.find('.w_leftHeader');
        this.children.forEach((x, idx) => {
            stackHead.append(x.header);
            x.header.addClass('sortable');
            x.header.css({ display: 'flex' });
        });
        this.header.css({ display: 'flex' });
    }
  }

  resize() {
    this.children.forEach(child => child.resize());
  }

  createBody() {
    this.body.empty();
    if(!['row', 'column'].includes(this.type))
      this.body.addClass('drop-zone')
  }

  getRootPane() {
    let pane = this;
    while (pane && !pane.root) {
      pane = pane.ParentPane;
    }
    return pane;
  }

  render() {
    if(this.root){
        this.attachDroppable();
    }

    if (['row', 'column'].includes(this.type)) {
      this.addSplitter();
    }
    if (this.type === 'stack') {
      this.children.forEach(x => x.active && x.show());
    }
    if (this.ParentPane?.type !== 'stack') {
      this.show();
    }
    this.children.forEach(x => x.render());


  }

attachDroppable() {
  const self = this;

  this.droppable = new Droppable(this.element.find('.w_header'), {
    dragStart({ source }) {
      self.droppable.updateGhostContent(`<strong>${$(source).text()}</strong>`);
    },

    drag({ source, target, event }) {
      const $target = $(target);
      const dropZone = $target.hasClass('drop-zone') ? $target : $target.closest('.drop-zone');

      if (dropZone.length) {
        if (dropZone.hasClass('w_header')) {
          self.droppable.showTargetGhost(dropZone[0], 'center');
        } else if (dropZone.hasClass('w_body')) {
          const rect = dropZone[0].getBoundingClientRect();
          const x = event.clientX;
          const y = event.clientY;

          const relX = x - rect.left;
          const relY = y - rect.top;

          const horizontal = rect.width / 3;
          const vertical = rect.height / 3;

          let side = 'center';
          if (relX < horizontal) side = 'left';
          else if (relX > 2 * horizontal) side = 'right';
          else if (relY < vertical) side = 'top';
          else if (relY > 2 * vertical) side = 'bottom';

          self.droppable.showTargetGhost(dropZone[0], side);
        }
      } else {
        self.droppable.removeTargetGhost();
      }
    },

    drop({ source, target, event }) {
      self.droppable.removeTargetGhost();
    },

    createGhost($el) {
      return $('<div>')
        .text('Dragging...')
        .css({ padding: '10px', background: '#eee', border: '1px dashed #333' });
    }
  });
}

  addSplitter() {
    this.splitter?.destroy()
    const panels = this.children.map(x => x.element[0]);
    this.splitter = Split(panels, {
      direction: this.type === 'row' ? 'horizontal' : 'vertical',
      sizes: this.config.sizes || Array(panels.length).fill(100 / panels.length),
      gutterSize: 6,
    });
    this.splitter.pairs.forEach(x => $(x.gutter).attr('data-name',this.name));
    this.splitter.onResize(ctx => {
       if(ctx.sizes.find(x => x < 20)) {
        ctx.cancel()
       }
      
    });
    WindowPane.splits[this.name] = this.splitter;
  }

  hide() {
    this.element.hide();
    this.header.removeClass('active');
  }

  show() {
    this.active = true;
    this.element.show();
    this.header.addClass('active');
  }

  destroy() {
    if (this.element) {
      this.children.forEach(child => child.destroy());
      this.onDestroy();
      this.ParentPane?.removeChild(this);
      this.element.remove();
    }
  }
}
