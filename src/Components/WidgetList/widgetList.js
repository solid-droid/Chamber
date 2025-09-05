import './WidgetList.css';
export class WidgetList {
  constructor(element, getWidgets) {
    this.element = $(element);
    this.getWidgets = getWidgets;
  }

  render() {
    console.log('Rendering widget list');
    this.element.empty();
    this.widgets = this.getWidgets() || [];
    const list = $('<div class="widget-list"></div>');
    let categories = new Set();
    let subCategories = new Set();
    this.widgets.forEach(widget => {
      if (widget.category) categories.add(widget.category);
      if (widget.subCategories) widget.subCategories && subCategories.add(JSON.stringify(widget.subCategories));
      const listItem = $(
        `<div class="widget-item-container" data-category="${widget.category || ''}" data-subcategories='${JSON.stringify(widget.subCategories || [])}'>
           <div class="widget-item">
            <div class="widget-item-name">${widget.name}</div>
            <div class="widget-item-content"></div>
           </div>
        </div>`);
      list.append(listItem);
    });
    this.element.append(list);
    categories.size > 0 && this.element.prepend($(
      `<div class="widget-category-List">
        <div class="widget-category-item">All</div>
        ${[...categories].map(cat => `<div class="widget-category-item" data-category="${cat}">${cat}</div>`).join('')}
        <div class="widget-category-item" data-category="Custom">Custom</div>
      </div>`));

    this.element.find('.widget-category-item').on('click', (e) => {
        if($(e.currentTarget).hasClass('active')) return;
        const category = $(e.currentTarget).data('category');
        this.element.find('.widget-category-item').removeClass('active');
        $(e.currentTarget).addClass('active');
        if (category) {
          this.element.find('.widget-item-container').each((i, el) => {
            if ($(el).data('category') === category || ($(el).data('subcategories') || []).includes(category)) {
              $(el).show();
            } else {
              $(el).hide();
            }
          });
        } else {
          this.element.find('.widget-item-container').show();
        }
    });
    this.element.find('.widget-category-item').first().addClass('active');
  }
}

export function createWidgetList(element, getWidgets) {
  const widgetList = new WidgetList(element, getWidgets);
  widgetList.render();
  return widgetList;
}