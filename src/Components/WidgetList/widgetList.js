import './WidgetList.css';
export class WidgetList {
  constructor(element, widgets) {
    this.element = $(element);
    this.widgets = widgets;
  }

  render() {
    this.element.empty();
    const list = $('<div class="widget-list"></div>');
    this.widgets.forEach(widget => {
      const listItem = $(
        `<div class="widget-item-container">
           <div class="widget-item">
            <div class="widget-item-name">${widget.name}</div>
            <div class="widget-item-content"></div>
           </div>
        </div>`);
      list.append(listItem);
    });
    this.element.append(list);
  }
}

export function createWidgetList(element, widgets) {
  const widgetList = new WidgetList(element, widgets);
  widgetList.render();
  return widgetList;
}