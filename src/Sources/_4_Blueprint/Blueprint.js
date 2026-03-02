import { RAR } from '@/Services/Runtime/RAR/RAR';
import { Store } from '@Store';
export class Blueprint {
    constructor(DOM, options = {}) {
        this.DOM = $(DOM);
        this.options = options;
        this.init();
    }

    async init() {

        const rarDOM = await this.RAR_demo();
        console.log('RAR Demo DOM:', rarDOM);
        this.DOM.append(rarDOM);
    }

    async RAR_demo() {
            const rar = new RAR();

            // --- VFS: GLOBAL INPUT MAP ---
            rar.vfs.write('@input/global', {
                "Keyboard_Space": { "onPress": [{ "@input": "ACTION_JUMP", "active": true }] }
            });

            // --- VFS: SCRIPTS ---

            // Root Widget Bind (UI Definition)
            rar.vfs.write('@scripts/bindRoot', (ctx) => {
                const dom = document.createElement('div');
                dom.className = "rar-root-widget";
                dom.innerHTML = `
                    <style>
                        .rar-root-widget {
                            width: 100%;
                            min-width: 320px;
                            max-width: 400px;
                            background-color: #1f2937;
                            border-radius: 0.75rem;
                            border: 1px solid #374151;
                            padding: 1.25rem;
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                            position: relative;
                            overflow: hidden;
                            box-sizing: border-box;
                        }
                        .rar-root-bar {
                            position: absolute; top: 0; left: 0; width: 100%; height: 0.25rem; 
                            background: linear-gradient(to right, #3b82f6, #9333ea);
                        }
                        .rar-root-header {
                            display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;
                        }
                        .rar-root-title {
                            font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0;
                        }
                        .rar-root-subtitle {
                            font-size: 0.75rem; color: #9ca3af; margin: 0.25rem 0 0 0;
                        }
                        .rar-root-buffer {
                            font-size: 10px; color: #6b7280; margin: 0.25rem 0 0 0;
                        }
                        .rar-root-clock-box {
                            padding: 0.25rem 0.5rem; background-color: #111827; border-radius: 0.25rem; 
                            font-size: 0.75rem; font-family: monospace; border: 1px solid #374151; color: #d1d5db;
                        }
                        .rar-root-clock-val {
                            color: #60a5fa;
                        }
                        .rar-root-children {
                            display: grid; grid-template-columns: 1fr; gap: 1rem;
                        }
                    </style>
                    <div class="rar-root-bar"></div>
                    <div class="rar-root-header">
                        <div>
                            <h2 class="rar-root-title">Dashboard Root</h2>
                            <p class="rar-root-subtitle">@instance/${ctx.id.split('/')[1]}</p>
                            <p class="rar-root-buffer">Buffer X: <span id="buf-x">${ctx.StateBuffer.x}</span></p>
                        </div>
                        <div class="rar-root-clock-box">
                            Global Clock: <span id="global-clock" class="rar-root-clock-val">0</span>
                        </div>
                    </div>
                    <!-- Child widgets injected here -->
                    <div data-rar-children class="rar-root-children"></div>
                `;

                // Proxy subscription
                const clockEl = dom.querySelector('#global-clock');
                ctx.Store.subscribe('globalClock', (val) => clockEl.innerText = val);

                return dom;
            });

            // Root Widget Clock Pulse (Logic)
            rar.vfs.write('@scripts/pulseClock', (ctx) => {
                const current = ctx.Store.globalClock || 0;
                ctx.Store.globalClock = current + 1;
                
                ctx.StateBuffer.x = ctx.StateBuffer.x + 0.1; 

                // Update buffer UI manually to show it ticks along silently without react notifications
                const bufEl = document.getElementById('buf-x');
                if (bufEl) bufEl.innerText = ctx.StateBuffer.x.toFixed(1);
            });

            // Counter Widget Bind (Child UI)
            rar.vfs.write('@scripts/bindCounter', (ctx) => {
                const dom = document.createElement('div');
                dom.className = "rar-counter-widget";
                dom.innerHTML = `
                    <style>
                        .rar-counter-widget {
                            background-color: rgba(17, 24, 39, 0.8);
                            border-radius: 0.5rem; padding: 1rem; border: 1px solid #374151;
                            display: flex; flex-direction: column; align-items: center; justify-content: center;
                            position: relative; transition: transform 0.1s ease; box-sizing: border-box;
                        }
                        .rar-btn { 
                            flex: 1; border-radius: 0.25rem; padding: 0.5rem 0; font-size: 0.875rem; 
                            font-weight: 600; color: white; cursor: pointer; border: 1px solid transparent; 
                            transition: background-color 0.15s; 
                        }
                        .rar-btn-dec { background-color: #1f2937; border-color: #4b5563; }
                        .rar-btn-dec:hover { background-color: #374151; }
                        .rar-btn-dec:active { background-color: #4b5563; }
                        
                        .rar-btn-inc { background-color: #2563eb; border-color: #3b82f6; }
                        .rar-btn-inc:hover { background-color: #3b82f6; }
                        .rar-btn-inc:active { background-color: #60a5fa; }
                        
                        .rar-val { 
                            font-size: 2.25rem; font-weight: 900; color: #ffffff; margin: 0.75rem 0; 
                            transition: transform 0.15s, color 0.15s; display: inline-block; 
                        }
                        .rar-val.pop { transform: scale(1.1); color: #60a5fa; }
                        
                        .rar-counter-label {
                            position: absolute; top: 0.5rem; left: 0.75rem; font-size: 10px; 
                            color: #6b7280; font-family: monospace; letter-spacing: 0.1em;
                        }
                        .rar-btn-container {
                            display: flex; gap: 0.5rem; width: 100%; margin-top: 0.5rem;
                        }
                    </style>
                    <span class="rar-counter-label">WIDGET // COUNTER</span>
                    <div class="rar-val" id="counter-val">0</div>
                    <div class="rar-btn-container">
                        <button id="btn-dec" class="rar-btn rar-btn-dec">-</button>
                        <button id="btn-inc" class="rar-btn rar-btn-inc">+</button>
                    </div>
                `;

                const valEl = dom.querySelector('#counter-val');
                
                // State Proxy subscription
                ctx.Store.subscribe('counterVal', (val) => {
                    valEl.innerText = val;
                    valEl.classList.remove('pop');
                    void valEl.offsetWidth; // trigger reflow
                    valEl.classList.add('pop');
                    setTimeout(() => valEl.classList.remove('pop'), 150);
                });

                // DOM Input translated to Proxy state mutation
                dom.querySelector('#btn-inc').addEventListener('click', () => {
                    ctx.Store.counterVal = ctx.Store.counterVal + 1;
                });
                dom.querySelector('#btn-dec').addEventListener('click', () => {
                    ctx.Store.counterVal = ctx.Store.counterVal - 1;
                });

                return dom;
            });

            // Action Handler Script
            rar.vfs.write('@scripts/handleJump', (ctx) => {
                Debug.log(`JUMP ACTION Executed on widget!`, 'event', ctx.id);
                if (ctx.view) {
                    ctx.view.style.transform = 'translateY(-20px)';
                    setTimeout(() => ctx.view.style.transform = 'translateY(0)', 150);
                    // Proxy state mutation
                    ctx.Store.counterVal = ctx.Store.counterVal + 10;
                }
            });

            // --- VFS: WIDGET SCHEMAS ---
            
            rar.vfs.write('@widget/counter', {
                "@meta": { "name": "CounterWidget" },
                "@state": { "counterVal": { "value": 0, "meta": { "reactive": true } } },
                "@bind": { "Ref": "@scripts/bindCounter" },
                "@inputs": {
                    "ACTION_JUMP": { "Ref": "@scripts/handleJump", "consume": true }
                }
            });

            rar.vfs.write('@widget/root', {
                "@meta": { "name": "AppRoot" },
                "@stateBuffer": {
                    "x": 10,
                    "y": 15
                },
                "@state": { 
                    "globalClock": { "value": 0, "meta": { "reactive": true } },
                    "heavyDataBuffer": { "value": 1024, "meta": { "reactive": false, "arrayBuffer": true } }
                },
                "@bind": { "Ref": "@scripts/bindRoot" },
                "@scripts": [
                    { "Ref": "@scripts/pulseClock", "@pulse": "normal" } // 10hz clock
                ],
                "@widgets": [
                    { "Ref": "@widget/counter" }
                ]
            });

            // --- BOOT AND MOUNT ---
            await rar.boot();
            
            const rootDOMNode = await rar.mount('@widget/root');
            return rootDOMNode;
    };

}