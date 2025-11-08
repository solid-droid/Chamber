import '@fortawesome/fontawesome-free/js/all.js';
import { Button } from "./Core/Button/Button";
import { Icon } from "./Core/Icon/Icon";
import { Text } from "./Core/Text/Text";
import { Input_Search } from "./Input/Input-Search/Input-Search";
import { Input } from './Core/Input/Input';
import { Layout_Tree } from './Layout/Layout-Tree/Layout-Tree';
import { Layout_List } from './Layout/Layout-List/Layout-List';


export function init_AtomicUI(){
    customElements.define('ui-button', Button);
    customElements.define('ui-icon', Icon);
    customElements.define('ui-text', Text);
    customElements.define('ui-input', Input);

    customElements.define('ui-input-search', Input_Search);

    customElements.define('ui-layout-list', Layout_List);
    customElements.define('ui-layout-tree', Layout_Tree);
}
