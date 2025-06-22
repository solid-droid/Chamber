export class Droppable {
  constructor(elements, options = {}) {
    this.elements = elements;
    this.ghost = null;
    this.targetGhost = null;
    this.activeElement = null;
    this.options = options;
    this.hasDragged = false;
    this.dragStarted = false;
    this.dragThreshold = 5; // px

    this.init();
    return this;
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
    this.dragStarted = false;

    $(document)
      .on('mousemove.draggable touchmove.draggable', (e) => this.onDrag(e))
      .on('mouseup.draggable touchend.draggable', (e) => this.onDrop(e));
  }

  onDrag(e) {
    const event = e.type === 'touchmove' ? e.touches[0] : e;

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!this.dragStarted && dist < this.dragThreshold) return;

    if (!this.dragStarted) {
      this.dragStarted = true;
      this.ghost = this.createGhost(this.activeElement);
      $('body').append(this.ghost);
      this.options.dragStart?.({
        source: this.activeElement.get(0),
        target: null,
        event,
      });
    }

    this.hasDragged = true;
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
    if (!this.dragStarted) {
      this.cleanup();
      return;
    }

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

  updateGhostContent(htmlOrElement) {
    if (!this.ghost) return;
    this.ghost.empty().append(htmlOrElement);
  }

  showTargetGhost(targetElement, position = 'center') {
    this.removeTargetGhost();

    const rect = targetElement.getBoundingClientRect();
    const ghost = $('<div class="target-ghost"></div>').css({
      position: 'fixed',
      background: 'rgba(0, 128, 255, 0.3)',
      zIndex: 9999,
      pointerEvents: 'none',
    });

    let thickness = 4;
    const width = rect.width;
    const height = rect.height;

    switch (position) {
      case 'top':
        thickness = height / 3;
        ghost.css({ left: rect.left + 'px', top: rect.top + 'px', width: width + 'px', height: thickness + 'px' });
        break;
      case 'bottom':
        thickness = height / 3;
        ghost.css({ left: rect.left + 'px', top: rect.bottom - thickness + 'px', width: width + 'px', height: thickness + 'px' });
        break;
      case 'left':
        thickness = width / 3;
        ghost.css({ left: rect.left + 'px', top: rect.top + 'px', width: thickness + 'px', height: height + 'px' });
        break;
      case 'right':
        thickness = width / 3;
        ghost.css({ left: rect.right - thickness + 'px', top: rect.top + 'px', width: thickness + 'px', height: height + 'px' });
        break;
      case 'center':
      default:
        ghost.css({ left: rect.left + 'px', top: rect.top + 'px', width: width + 'px', height: height + 'px' });
        break;
    }

    $('body').append(ghost);
    this.targetGhost = ghost;
  }

  removeTargetGhost() {
    this.targetGhost?.remove();
    this.targetGhost = null;
  }

  cleanup() {
    this.ghost?.remove();
    this.ghost = null;
    this.removeTargetGhost();
    this.activeElement = null;
    this.hasDragged = false;
    this.dragStarted = false;
    $(document).off('.draggable');
  }

  destroy() {
    this.cleanup();
    this.elements.css('cursor', '').off('mousedown touchstart');
  }
}
