/** @type {import('./types').IUI} */

import './Theme/Theme.css';
import '@fortawesome/fontawesome-free/js/all.js';

const registry = new Map();

// The "State" and Core Logic
const core = {
  theme: 'theme-dark',
  selector: 'body',
  
  init(selector) {
    this.selector = selector || this.selector;
    return UI; // Chainable
  },

  setTheme(newTheme) {
    document.querySelector(this.selector).classList.remove(this.theme);
    this.theme = newTheme;
    document.querySelector(this.selector).classList.add(this.theme);
    return UI;
  },

  register(name, plugin) {
    registry.set(name, plugin);
    console.log(`🔌 Plugin Attached: UI.${name}`);
    return UI;
  }
};

// The Proxy Gateway
export const UI = new Proxy(core, {
  get(target, prop) {
    // 1. Check core methods first (init, setTheme, register)
    if (prop in target) return target[prop];

    // 2. Check registered plugins (add, canvas, etc.)
    if (registry.has(prop)) return registry.get(prop);

    // 3. The "Ghost" Fallback for better DX
    return new Proxy(() => {}, {
      get: () => {
        console.warn(`🎨 UI.${String(prop)} is not plugged in.`);
        return () => UI; // Return UI to prevent chain breaking
      },
      apply: () => {
        console.warn(`🎨 UI.${String(prop)}() called but not found.`);
        return UI;
      }
    });
  }
});