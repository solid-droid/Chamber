import '@fortawesome/fontawesome-free/js/all.js';
import { Button } from "./Core/Button/Button";
import { Icon } from "./Core/Icon/Icon";
import { Text } from "./Core/Text/Text";
import { Input_Search } from "./Input/Input-Search/Input-Search";
import { Input } from './Core/Input/Input';


export function init_AtomicUI(){
    customElements.define('ui-button', Button);
    customElements.define('ui-icon', Icon);
    customElements.define('ui-text', Text);
    customElements.define('ui-input', Input);

    customElements.define('ui-input-search', Input_Search);
}
