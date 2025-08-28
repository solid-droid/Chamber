import  './dropdown.css';
export class Dropdown {
    constructor(element, { items = [], ...options } = {}) {
      this.element = $(element);
      this.items = items;
      this.label = options.label || '';
      this.options = options;
      this.selectedItem = this.options.selectedItem || null;
      this.defaultText = this.options.defaultText || 'Select item';
      this.render();
    }

    selectItem(item) {
        this.selectedItem = item;
        this.render();
    }
    getSelectedItem() {
        return this.selectedItem;
    }
    setItems(items) {
        this.items = items;
        this.render();
    }

    render() {
      //div based custom dropdown
      const selector = $(`<div class="chamber-dropdown"></div>`);
      const selectedItem = this.getSelectedItem() || { label: this.defaultText };
      selector.append(`<div class="dropdown-selected">${selectedItem.label}</div>`);
      const optionsList = $(`<div class="dropdown-options"></div>`);
      this.items.forEach(item => {
          optionsList.append(`<div class="dropdown-item" data-value="${item.value}">${item.label}</div>`);
      });
      this.element.empty();
      optionsList.hide();
      selector.on('click', '.dropdown-selected', (e) => {
          optionsList.toggle();
      });

      selector.on('click', '.dropdown-item', (e) => {
          const itemValue = $(e.currentTarget).data('value');
          const item = this.items.find(i => i.value === itemValue);
          if (item) {
              this.selectItem(item);
              this.options?.onSelect?.(item);
          }
          optionsList.toggle();
      });
      selector.append(optionsList);
      this.element.append(selector);
    }

}