import { Droppable } from './Droppable';
import './WindowLayout.css';
import Split from './Split';

export class WindowPane {
  static panes = {};
  static splits = {};
  static maximized = false;

  constructor(config = {}) {
    this.config = config;
    this.root = config.root || false;
    this.type = config.type || 'row';
    this.children = [];
    this.name = this.config.name || crypto.randomUUID();
    this.isMinimized = !config.root;
    this.isFullscreen = false;

    this.closeIcon = this.config.closeIcon ?? true;
    this.resizeIcon = this.config.resizeIcon ?? true;

    this.minWidth = this.config.minWidth || this.config.minSize || 200;
    this.minHeight = this.config.minHeight || this.config.minSize || 200;

    this.onDragStart = config.onDragStart || (() => {});
    this.onDragEnd = config.onDragEnd || (() => {});
    this.onDrag = config.onDrag || (() => {});
    this.onLoad = config.onLoad || (() => {});
    this.onDestroy = config.onDestroy || (() => {});
    this.onResize = config.onResize || (() => {})

    this.load();
  }

  load() {
    this.ParentElement = $(this.root ? $(this.config.parent) : this.config.parent.body);
    this.ParentPane = this.root ? null : this.config.parent;
    this.destroy();
    this.createElement();
    let _index = this.config.index ?? null;
    if( _index !== null && _index > -1 && _index <= this.ParentElement.children.length){
      WindowPane.destroySplitter(this.ParentPane);
      WindowPane.insertAtIndex(this.element, this.ParentElement, _index);
      this.ParentPane.addChild(this,_index);
    } else {
      this.ParentElement.append(this.element);
      this.ParentPane?.addChild(this);
    }
    this.createHeader();
    this.createBody();
    this.attachEvents();
    this.onLoad(this.body);
    WindowPane.panes[this.name] = this;
  }

  static insertAtIndex(el, parent, index) {
    el = $(el);
    parent = $(parent);
    el.detach();
    const ref = parent.children().eq(index);
    ref.length ? el.insertBefore(ref) : parent.append(el);
  }
  
  addChild(pane, index , force = false) {
    let _index = index ?? this.children.length;
    if (!this.children.length) {
      pane.active = true;
    }

    pane.ParentPane = this;
    pane.ParentElement = this.body;

    if(pane.type === 'component' || pane.type === 'stack'){
      let parentInSync= $(this.body).is(pane.element.parent());
      if(!parentInSync || force){
        if(_index === this.children.length){
          $(pane.element).detach().appendTo(this.body);
        } else {
          WindowPane.destroySplitter(this);
          const $ref = this.body.children().eq(_index);
          $(pane.element).detach().insertAfter($ref);
        }  
        pane.element.css({height:'calc(100% - 1px)', width:'calc(100% - 1px)'});
        pane.createHeader();
      }
    }

    this.children.splice(_index+1, 0, pane);
    if(this.type === 'stack'){
      this.children.forEach(x => x.hide());
      const activeIndex = this.children.findIndex(x => x.config.active);
      index = index ?? (activeIndex < 0 ? _index : activeIndex);
      this.children[index].show();
    }
    this.createHeader();
  }

  removeChild(pane, index, done = true) {
    if(!pane.element) return;

    index = index ?? this.children.findIndex(x => x.name === pane.name);
    if (index < 0 && index > this.children.length)
      return; 
    
    this.children.splice(index, 1);
    
    if(this.type === 'stack'){
      if(!this.children.find(x => x.active))
        this.children[0]?.show();
    }
        
    if(!this.children.length){
      //children verification (brute force - can improve in addChild)
      if(this.body.children().length){
        [...this.body.children()].forEach(x => {
          let parent = WindowPane.panes[x.dataset.name].ParentPane;
          let index = parent.children.findIndex(y => y.name === x.dataset.name)
          WindowPane.insertAtIndex(x, parent.body, index) 
        });
      }
      this.destroy();
      return;
    }

    if(done && 
      this.children.length < 2 && 
      ['column','row'].includes(this.type) &&
      this.ParentPane
    ){
      let side = this.ParentPane.type === 'column' ? 'bottom' : 'right';
      this.children[0].moveTo(this,side);
    }

    this.createHeader();
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

    this.header = $('<div class="w_header dragable"></div>');
    this.body = $('<div class="w_body"></div>');

    this.element.append(this.header);
    this.element.append(this.body);
  }

  closePane(){
    this.children?.slice().forEach(x => x.destroy());
    this.ParentPane.removeChild(this);
  }
  getRoot(){
    if(this.ParentPane.root)
      return this.ParentPane;

    return this.ParentPane.getRoot();
  }
  minMaxPane(){
    this.state = this.state ?? 1;
    if(this.state === 1){
      // normal -> expander
      this.state = 2
      WindowPane.maximized = this;
      let activeChild = this.children.find(x => x.active);
      Object.values(WindowPane.panes).forEach(x => x?.element.hide() );
      let container = this.getRoot().element.parent();
      this.minMaxCOnfig ??= {};
      this.minMaxCOnfig.index = this.ParentPane.children.findIndex(x => x.name === this.name);
      container.append(this.element);
      this.element.show();
      activeChild?.element.show();
      this.element.css({
        'height':'100%',
        'width': '100%'
      });
      this.header.find('.closeBtn').hide();
    } else if(this.state = 2){
      //expand -> normal
      this.state = 1;
      WindowPane.maximized = null;
      WindowPane.destroySplitter(this.ParentPane);
      Object.values(WindowPane.panes).forEach(x => x.element.show());
      this.header.find('.closeBtn').show();
      if(this.minMaxCOnfig.index === 0){
        this.element.prependTo(this.ParentElement);
      } else {
        this.element.insertAfter(this.ParentPane.children[this.minMaxCOnfig.index-1].element);
      }
      this.render();
      this.ParentPane.render();
    }
  }

  attachEvents() {
    if((['row', 'column'].includes(this.type)))
        return;

    this.header.off('click').on('click', (e) => {
      if ($(e.target).hasClass('closeBtn')) {
        e.stopPropagation();
        this.closePane(e);
        return;
      }
      if ($(e.target).hasClass('minMaxBtn')) {
        e.stopPropagation();
        this.minMaxPane(e);
        return;
      }
      
    });

    this.header.off('click', '.w_leftHeader>.w_header').on('click', '.w_leftHeader>.w_header', (e) => {
      e.stopPropagation();
      let selectedPane = this.children.find(x => x.name === $(e.currentTarget).data().name);
      if ($(e.target).hasClass('closeBtn')) {
        this.closePane(e);
        return;
      }

      if ($(e.target).hasClass('minMaxBtn')) {
        this.closePane(e);
        return;
      }
      this.children.forEach(x => x.hide());
      selectedPane.show();
    });
  }

  createHeaderContent(headerElem,name){
    let resizeIcon = this.ParentPane?.type === 'stack' ? false : this.resizeIcon
    const headerRight = `
      <div class="w_rightHeader">
          ${resizeIcon ? '<i class="fa-solid fa-window-maximize headerButton minMaxBtn"></i>' : ''}
          ${this.closeIcon ? '<i class="fa-solid fa-xmark headerButton closeBtn"></i>' : '' }
      </div>`;
      const headerLeft = `
        <div class="w_leftHeader"></div>
      `
     headerElem.attr('data-name', name);
     headerElem.attr('data-element', 'header');
     headerElem.append(headerLeft);
     headerElem.append(headerRight);
     return headerElem;
  }
  createHeader() {   
    if(this.type === 'stack'){
      this.children.forEach((x, idx) => {
          x.header.detach().prependTo(x.element);
      });
    }
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
        } else {
            this.header.removeClass('drop-zone');
        }
    }

    if(this.type === 'stack'){
        this.header.removeClass('dragable');
        this.header.addClass('drop-zone');
        let stackHead = this.header.find('.w_leftHeader');
        this.children.forEach((x, idx) => {
            stackHead.append(x.header);
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
    this.body.attr('data-name', this.name);
    this.body.attr('data-element', 'body');
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

  render(deep = true) {
    if(!this.element) return;

    if(this.root){
        this.attachDroppable();
    }

    if (['row', 'column'].includes(this.type)) {
      this.addSplitter();
    }
    if (this.type === 'stack') {
      this.children.forEach(x => x.active ? x.show() : x.hide());
    }
    if (this.ParentPane?.type !== 'stack') {
      this.show();
    }

    deep && this.children.forEach(x => x.render());
  }

attachDroppable() {
  const self = this;
  let side = 'center';
  this.droppable?.destroy();
  this.droppable = new Droppable(this.element.find('.dragable'), {
    dragStart({ source }) {
      self.droppable.updateGhostContent(`<strong>${$(source).text()}</strong>`);
    },

    drag({ source, target, event }) {
      const $target = $(target);
      const dropZone = $target.hasClass('drop-zone') ? $target : $target.closest('.drop-zone');

      if (dropZone.length) {
        if (dropZone.hasClass('w_header')) {
          side = 'center'
          self.droppable.showTargetGhost(dropZone[0], side);
        } else if (dropZone.hasClass('w_body')) {
          const rect = dropZone[0].getBoundingClientRect();
          const x = event.clientX;
          const y = event.clientY;

          const relX = x - rect.left;
          const relY = y - rect.top;

          const horizontal = rect.width / 3;
          const vertical = rect.height / 3;

          side = 'center';
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
      
      if($(event.target).hasClass('headerButton'))
        return;

      if(!target?.dataset?.name){
        target = $(target).closest('.drop-zone')[0];
      }

      if(!(source && target?.dataset?.name))
        return;

      WindowPane.panes[source.dataset.name].moveTo(target.dataset, side);
    },

    createGhost($el) {
      return $('<div>')
        .text('Dragging...')
        .css({ padding: '10px', background: '#eee', border: '1px dashed #333' });
    }
  });
}

  getPanePath(panel, list = []){
    list.unshift(panel);
    if(['row','column'].includes(panel.type) && panel.children.length > 1){
      return list;
    } else {
      return this.getPanePath(panel.ParentPane, list);
    }
  }

  moveTo(target, side) {
    if(!target.name) 
      return;

    if(
      this.ParentPane.type !== 'stack' && 
      this.name === target.name && 
      this.type === 'component'
    ){
      //drag and drop inside same component
      //if stack -> dont return => use closest parent row/col
      return;
    }

    const targetPane = WindowPane.panes[target.name];
    //find closest row/column
    let panePath = this.getPanePath(targetPane);
    let _root = panePath[0];
    let _paneGroup = panePath[1];
    let tIndex = _root.children.findIndex(x => x.name === _paneGroup.name);
    
    if(!side){
      side = _root.type === 'row' ? 'left' : 'top';
    }
    
    let isColumn  = ['left','right'].includes(side);
    let isRow = ['top','bottom'].includes(side);
    let next = ['right','bottom'].includes(side);;
    let createColChild = _root.type === 'row' && isRow;
    let createRowChild = _root.type === 'column' && isColumn;
    let sIndex = null;
    
    
    
    if(targetPane.type === 'stack' && target.element === 'header') {
      this.moveToExistingStack(targetPane);
    } else  if(target.element === 'header' || side === 'center'){
      if(targetPane.ParentPane.type === 'stack'){
        this.moveToExistingStack(targetPane.ParentPane);
      }else {
        let _stack = new WindowPane({
          type:'stack',
          name: crypto.randomUUID(),
          parent: targetPane.ParentPane,
          index: tIndex
        });
        targetPane.moveToExistingStack(_stack);
        this.moveToExistingStack(_stack);
      }

    } else if(createRowChild){

      const isStack = targetPane.ParentPane.type === 'stack';
      let _row = new WindowPane({
        type:'row',
        name: crypto.randomUUID(),
        parent: isStack ? _root : targetPane.ParentPane,
        index:  tIndex
      });
      (isStack ? targetPane.ParentPane : targetPane).moveToRowOrColumn(_row, 0 - !next , false);
      this.moveToRowOrColumn(_row, 1 - !next);

    } else if(createColChild){

      const isStack = targetPane.ParentPane.type === 'stack';
      let _column = new WindowPane({
        type:'column',
        name: crypto.randomUUID(),
        parent: isStack ? _root : targetPane.ParentPane,
        index:  tIndex
      });
      (isStack ? targetPane.ParentPane : targetPane).moveToRowOrColumn(_column, 0 - !next , false);
      this.moveToRowOrColumn(_column, 1 - !next);
    
    } else if(this.ParentElement.is(_root.body)){
        //move inside same row/column

        sIndex = _root.children.findIndex(x => x.name === this.name);
        if(sIndex === tIndex) return;

        WindowPane.destroySplitter(_root);
        WindowPane.moveIndex(_root.children, sIndex, tIndex, next);
        WindowPane.moveDOM(_root.body,sIndex, tIndex, next);
        
    } else {
        //move to another row/column
        tIndex -= !next;
        this.moveToRowOrColumn(_root, tIndex);
      }
    _root.render();

  }

  moveToRowOrColumn(parent,tIndex, done = true){
    WindowPane.destroySplitter(this.ParentPane);
    this.header.detach().prependTo(this.element);
    let prevParent = this.ParentPane;
    parent.addChild(this, tIndex, true);
    prevParent.removeChild(this, null , done);
    this.render();
    prevParent.render();
  }

  static moveDOM(parentDOM, sourceIndex, targetIndex, next) {
    const $parent = $(parentDOM);
    const $children = $parent.children();

    if (
      sourceIndex < 0 || targetIndex < 0 ||
      sourceIndex >= $children.length || targetIndex >= $children.length
    ) {
      throw new Error("Invalid index");
    }

    if (sourceIndex === targetIndex || 
      (next && sourceIndex === targetIndex + 1) || 
      (!next && sourceIndex === targetIndex - 1)) {
      return; // no move needed
    }

    const $item = $children.eq(sourceIndex);
    const $target = $children.eq(targetIndex);

    // Remove the item before inserting (preserves event handlers etc.)
    $item.detach();

    if (next) {
      $target.after($item);
    } else {
      $target.before($item);
    }
  }

  moveToExistingStack(targetPane){
      if(this.ParentElement.is(targetPane.body)){
        //same stack movement
        return;
      } 
      const tIndex = targetPane.children.length;
      let prevParent = this.ParentPane;
      targetPane.addChild(this, tIndex, true);
      prevParent.removeChild(this);
      this.render();
      prevParent.render();
  }

  static moveIndex(arr, sourceIndex, targetIndex, next) {
    if (
      sourceIndex < 0 || targetIndex < 0 ||
      sourceIndex >= arr.length || targetIndex >= arr.length
    ) {
      throw new Error("Invalid index");
    }

    // Don't do anything if moving to the same position or just before/after it depending on `next`
    if (
      (next && sourceIndex === targetIndex + 1) ||
      (!next && sourceIndex === targetIndex)
    ) {
      return arr;
    }

    const item = arr.splice(sourceIndex, 1)[0];

    let insertIndex = targetIndex;
    if (next && sourceIndex < targetIndex) {
      insertIndex = targetIndex; // after removal, target shifts left
    } else if (next) {
      insertIndex = targetIndex + 1;
    }

    arr.splice(insertIndex, 0, item);
    return arr;
  }

  static destroySplitter(elem){
    elem.body.find('>.gutter').length && elem.splitter?.destroy();
  }
  addSplitter() {
    WindowPane.destroySplitter(this);
    const panels = this.children.map(x => {
      x.element.css({height:'calc(100% - 1px)', width:'calc(100% - 1px)'});
      return x.element[0]
    });
    if(panels.length < 2)
      return;
    this.config.sizes = this.config.sizes?.length === panels.length ? this.config.sizes : Array(panels.length).fill(100 / panels.length);
    this.splitter = Split(panels, {
      direction: this.type === 'row' ? 'horizontal' : 'vertical',
      sizes: this.config.sizes,
      gutterSize: 6
    });
    this.splitter.pairs.forEach(x => $(x.gutter).attr('data-name',this.name));
    let self = this;
    this.splitter.onResize(ctx => {
       if(ctx.sizes.find(x => x < 10)) {
        ctx.cancel();
       } else {
        self.onResize();
        self.children.forEach(x => x.onResize());
       }
      
    });
    WindowPane.splits[this.name] = this.splitter;
  }

  hide() {
    this.active = false;
    this.element.hide();
    this.header.removeClass('active');
  }

  show() {
    this.active = true;
    this.element.show();
    this.header.addClass('active');
  }

  destroy() {
    WindowPane.maximized?.minMaxPane?.();
    if (this.element) {
      this.onDestroy();
      this.children.forEach(child => child.destroy());
      this.ParentPane?.removeChild(this);
      this.element?.remove();
      this.element = null;
      this.ParentPane?.render();
    }
  }
}
