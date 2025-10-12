export class Layout_Grid {
  constructor(params={}) {
    this.element = $('<div class="UI-Layout-Grid"></div>');
    this.height = params.height ?? '100%';
    this.width = params.width ?? '100%';
    this.gap = params.gap ?? '0px';
    this.rows = params.rows ?? ['100%'];
    this.columns = params.columns ?? ['100%'];
    this.render();
  }

  render() {
    this.element.css({
      display: 'grid',
      height: this.height,
      width: this.width,
      gap: this.gap,
      gridTemplateRows: this.rows.join(' '),
      gridTemplateColumns: this.columns.join(' '),
    });
  }

  add(row, column, element) {
    this.element.append(element);
    element.css({
      gridRow: row + 1,
      gridColumn: column + 1,
    });
  }  

  addBlock(rowStart, rowEnd, colStart, colEnd, element) {
    this.element.append(element);
    element.css({
      gridRow: `${rowStart + 1} / ${rowEnd + 1}`,
      gridColumn: `${colStart + 1} / ${colEnd + 1}`,
    });
  }

}