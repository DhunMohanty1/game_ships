export class Input {
    constructor() {
      this.down = new Set();
      this.justPressed = new Set();
      this.justReleased = new Set();
  
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
        code === 'ArrowRight'
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
    }
  }