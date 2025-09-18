import './WidgetList.css';
export class WidgetList {
  constructor(element, getWidgets) {
    this.element = $(element);
    this.getWidgets = getWidgets;
  }

  render() {
    this.element.empty();
    this.widgets = this.getWidgets() || [];
    let container = $('<div class="widget-list-container"></div>');
    let categories = new Set();
    let subCategories = new Set();
    let prevTag = '';

    let listTemplate = '<div class="widget-list"></div>';
    let list;
    this.tagList =  [];
    this.widgets.forEach(widget => {
      if(prevTag !== widget.mainTag){
        prevTag = widget.mainTag;
        this.tagList.push(widget.mainTag);
        const horizontalLine = `<div class="widgetList-horizontalLine" data-maintag="${widget.mainTag || ''}">
          <span class="widgetList-mainTag">${widget.mainTag}</span>
          <span class="widgetList-hline"></span>
        </div>`
        container.append(horizontalLine);
        list = $(listTemplate);
        container.append(list); 
      }
      if (widget.category) categories.add(widget.category);
      if (widget.subCategories) widget.subCategories && subCategories.add(JSON.stringify(widget.subCategories));
      const listItem = $(
        `<div class="widget-item-container" title="${widget.title}" data-name="${widget.name}" data-category="${widget.category || ''}" data-subcategories='${JSON.stringify(widget.subCategories || [])}'>
            <div class="widget-item-name">${widget.name}</div>
            <div class="widget-item-content"></div>
        </div>`);
      list.append(listItem);
    });
    this.element.append(container);

    this.element.find('.widget-item-container').off('click').on('click', el => {
      alert( $(el.currentTarget).data('name'));
    });

    categories.size > 0 && this.element.prepend($(
      `<div class="widget-category-List">
        <div class="widget-category-item">All</div>
        ${[...categories].map(cat => `<div class="widget-category-item" data-category="${cat}">${cat}</div>`).join('')}
        <div class="widget-category-item" data-category="Custom">Custom</div>
      </div>`));

    this.element.find('.widget-category-item').on('click', (e) => {
        if($(e.currentTarget).hasClass('active')) return;
        this.element.find('.widgetList-horizontalLine').show();
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

          let tagMap = {};
          this.tagList.forEach(x => tagMap[x] = false);
          this.widgets.forEach(x => {
            if(x.category !== category)
              return;
            tagMap[x.mainTag] = tagMap[x.mainTag] || true;
          });

          Object.entries(tagMap).forEach(([tag,exist])=>{
            if(!exist){
               this.element.find(`.widgetList-horizontalLine[data-maintag="${tag}"]`).hide();
            }
          })
          
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