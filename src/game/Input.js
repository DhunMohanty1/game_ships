export class Input {
  constructor() {
    this.keys = {};
    this.mouseButtons = {};
    this.mouseDelta = { x: 0, y: 0 };
    this.isPointerLocked = false;
    this.justClicked = false;

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => (this.keys[e.code] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.code] = false));

    window.addEventListener('mousedown', (e) => {
      this.mouseButtons[e.button] = true;
      if (e.button === 0 && this.isPointerLocked) {
        this.justClicked = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons[e.button] = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseDelta.x += e.movementX;
        this.mouseDelta.y += e.movementY;
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === document.body;
    });
  }

  requestPointerLock() {
    if (!this.isPointerLocked) {
      document.body.requestPointerLock();
    }
  }

  isKeyPressed(code) {
    return !!this.keys[code];
  }

  isMouseButtonPressed(button) {
    return !!this.mouseButtons[button];
  }

  consumeClick() {
    if (this.justClicked) {
      this.justClicked = false;
      return true;
    }
    return false;
  }

  endFrame() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.justClicked = false;
  }
}