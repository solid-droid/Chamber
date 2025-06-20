export class Droppable {
  constructor(elements, options = {}) {
    this.elements = elements;
    this.ghost = null;
    this.activeElement = null;
    this.options = options;
    this.hasDragged = false;

    this.init();
  }

  init() {
    this.elements.css('cursor', 'grab');
    this.elements.on('mousedown touchstart', (e) => this.onDragStart(e));
  }

  onDragStart(e) {
    const event = e.type === 'touchstart' ? e.touches[0] : e;
    e.stopPropagation();
    e.preventDefault();

    this.activeElement = $(e.currentTarget);
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.hasDragged = false;

    $(document)
      .on('mousemove.draggable touchmove.draggable', (e) => this.onDrag(e))
      .on('mouseup.draggable touchend.draggable', (e) => this.onDrop(e));
  }

  onDrag(e) {
    const event = e.type === 'touchmove' ? e.touches[0] : e;

    if (!this.hasDragged) {
      this.hasDragged = true;
      this.ghost = this.createGhost(this.activeElement);
      $('body').append(this.ghost);
      this.options.dragStart?.({
        source: this.activeElement.get(0),
        target: null,
        event,
      });
    }

    this.updateGhostPosition(event);

    if (this.options.drag) {
      this.options.drag({
        source: this.activeElement.get(0),
        target: document.elementFromPoint(event.clientX, event.clientY),
        event,
      });
    }
  }

  onDrop(e) {
    const event = e.type === 'touchend' ? (e.changedTouches ? e.changedTouches[0] : e) : e;
    const data = {
      source: this.activeElement.get(0),
      target: document.elementFromPoint(event.clientX, event.clientY),
      event,
    };

    this.cleanup();
    this.options.drop?.(data);
  }

  createGhost($el) {
    const ghost = this.options.createGhost
      ? this.options.createGhost($el)
      : $el.clone();

    ghost
      .addClass('draggable-ghost')
      .css({
        position: 'fixed',
        pointerEvents: 'none',
        opacity: 0.6,
        zIndex: 10000,
        transform: 'scale(0.95)',
      });

    return ghost;
  }

  updateGhostPosition(e) {
    if (!this.ghost) return;
    this.ghost.css({
      left: e.clientX + 10 + 'px',
      top: e.clientY + 10 + 'px',
    });
  }

  cleanup() {
    this.ghost?.remove();
    this.ghost = null;
    this.activeElement = null;
    this.hasDragged = false;
    $(document).off('.draggable');
  }
}
