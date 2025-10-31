import { Button } from "./Core/Button/Button";
import { Icon } from "./Core/Icon/Icon";
import { Text } from "./Core/Text/Text";
import '@fortawesome/fontawesome-free/js/all.js';


export function init_AtomicUI(){
    customElements.define('ui-button', Button);
    customElements.define('ui-icon', Icon);
    customElements.define('ui-text', Text);
}
