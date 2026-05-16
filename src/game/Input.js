export class Input {
  constructor() {
    this.down = new Set();
    this.justPressed = new Set();
    this.justReleased = new Set();
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.mousePos = { x: 0, y: 0 };
    this.movementX = 0;
    this.movementY = 0;
    this.isPointerLocked = false;

    window.addEventListener(
      'keydown',
      (e) => {
        if (this.isGameKey(e.code)) {
          e.preventDefault();
        }

        if (!this.down.has(e.code)) {
          this.justPressed.add(e.code);
        }

        this.down.add(e.code);
      },
      { passive: false }
    );

    window.addEventListener(
      'keyup',
      (e) => {
        if (this.isGameKey(e.code)) {
          e.preventDefault();
        }

        if (this.down.has(e.code)) {
          this.justReleased.add(e.code);
        }

        this.down.delete(e.code);
      },
      { passive: false }
    );

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        if (!this.down.has('Click')) this.justPressed.add('Click');
        this.down.add('Click');
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        if (this.down.has('Click')) this.justReleased.add('Click');
        this.down.delete('Click');
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      // Calculate NDC (-1 to +1) for raycasting
      this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Move crosshair visual
      const crosshair = document.getElementById('crosshair');
      if (crosshair && crosshair.style.display !== 'none') {
        crosshair.style.left = e.clientX + 'px';
        crosshair.style.top = e.clientY + 'px';
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

  isGameKey(code) {
    return (
      code === 'KeyW' ||
      code === 'KeyA' ||
      code === 'KeyS' ||
      code === 'KeyD' ||
      code === 'Space' ||
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'ControlLeft'
    );
  }

  isDown(code) {
    return this.down.has(code);
  }

  wasPressed(code) {
    return this.justPressed.has(code);
  }

  endFrame() {
    this.justPressed.clear();
    this.justReleased.clear();
    this.movementX = 0;
    this.movementY = 0;
  }
}