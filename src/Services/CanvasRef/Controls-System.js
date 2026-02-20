export class ControlsSystem {
  constructor(scene, canvasDOM) {
    this._scene = null;
    this.canvasDOM = canvasDOM;
    
    this.pressedKeys = new Set();
    this.actionMap = new Map();
    this.mouse = {
        x: 0, 
        y: 0,
        deltaX: 0, 
        deltaY: 0,
        left: false, 
        right: false, 
        middle: false,
        locked: false
    };

    // Initialize with the provided scene
    this.scene = scene; 
  }

  // Getter/Setter for scene to handle switching
  get scene() { return this._scene; }
  set scene(newScene) {
      if (this._scene) {
          this._detachObservables();
      }
      this._scene = newScene;
      if (this._scene) {
          this._attachObservables();
      }
  }

  _attachObservables() {
      // Keyboard
      this._keyboardObserver = this._scene.onKeyboardObservable.add((kbInfo) => {
          const key = kbInfo.event.key.toLowerCase();
          if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
              this.pressedKeys.add(key);
          } else if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
              this.pressedKeys.delete(key);
          }
      });

      // Mouse
      this._pointerObserver = this._scene.onPointerObservable.add((pointerInfo) => {
          const evt = pointerInfo.event;
          switch (pointerInfo.type) {
              case BABYLON.PointerEventTypes.POINTERDOWN:
                  if (evt.button === 0) this.mouse.left = true;
                  if (evt.button === 1) this.mouse.middle = true;
                  if (evt.button === 2) this.mouse.right = true;
                  break;
              case BABYLON.PointerEventTypes.POINTERUP:
                  if (evt.button === 0) this.mouse.left = false;
                  if (evt.button === 1) this.mouse.middle = false;
                  if (evt.button === 2) this.mouse.right = false;
                  break;
              case BABYLON.PointerEventTypes.POINTERMOVE:
                  this.mouse.x = evt.clientX;
                  this.mouse.y = evt.clientY;
                  // Accumulate deltas between frames
                  this.mouse.deltaX += evt.movementX || 0;
                  this.mouse.deltaY += evt.movementY || 0;
                  break;
          }
      });
  }

  _detachObservables() {
      if (this._scene) {
          if (this._keyboardObserver) {
              this._scene.onKeyboardObservable.remove(this._keyboardObserver);
              this._keyboardObserver = null;
          }
          if (this._pointerObserver) {
              this._scene.onPointerObservable.remove(this._pointerObserver);
              this._pointerObserver = null;
          }
      }
      // Reset state on scene switch
      this.pressedKeys.clear();
      this.mouse.left = false;
      this.mouse.right = false;
      this.mouse.middle = false;
      this.mouse.deltaX = 0;
      this.mouse.deltaY = 0;
  }

  // --- Public API ---

  // Check if a specific key is held down
  isPressed(key) {
      return this.pressedKeys.has(key.toLowerCase());
  }

  // Bind keys to an action name (e.g. bind('jump', ' ', 'arrowup'))
  bind(actionName, ...keys) {
      this.actionMap.set(actionName, keys.map(k => k.toLowerCase()));
  }

  // Check if an action is active
  isActive(actionName) {
      const keys = this.actionMap.get(actionName);
      if (!keys) return false;
      return keys.some(k => this.pressedKeys.has(k));
  }

  // Consumes the accumulated mouse delta and resets it
  readMouseDelta() {
      const delta = { x: this.mouse.deltaX, y: this.mouse.deltaY };
      this.mouse.deltaX = 0;
      this.mouse.deltaY = 0;
      return delta;
  }

 lockPointer() {
      if(this.canvasDOM) {
           this.canvasDOM.requestPointerLock = this.canvasDOM.requestPointerLock || this.canvasDOM.mozRequestPointerLock;
           if(this.canvasDOM.requestPointerLock) {
               this.canvasDOM.requestPointerLock();
               this.mouse.locked = true;
           }
      }
  }

  unlockPointer() {
      document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
      if (document.exitPointerLock) {
          document.exitPointerLock();
          this.mouse.locked = false;
      }
  }
}