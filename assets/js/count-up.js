/**
 * CountUp Animation - Vanilla JavaScript implementation
 * Similar to the React CountUp component with spring animation
 */

class CountUp {
  constructor(element, options = {}) {
    this.element = element;
    this.to = options.to || 0;
    this.from = options.from || 0;
    this.duration = options.duration || 2;
    this.delay = options.delay || 0;
    this.separator = options.separator || ',';
    this.direction = options.direction || 'up';
    this.onStart = options.onStart;
    this.onEnd = options.onEnd;

    // Spring physics parameters
    this.damping = 20 + 40 * (1 / this.duration);
    this.stiffness = 100 * (1 / this.duration);

    this.currentValue = this.direction === 'down' ? this.to : this.from;
    this.velocity = 0;
    this.targetValue = this.direction === 'down' ? this.from : this.to;
    this.animationId = null;
    this.started = false;

    // Initialize display
    this.updateDisplay(this.currentValue);

    // Set up intersection observer for "in view" detection
    this.setupObserver();
  }

  setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.started) {
            this.started = true;
            setTimeout(() => this.start(), this.delay * 1000);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(this.element);
  }

  start() {
    if (typeof this.onStart === 'function') this.onStart();

    this.targetValue = this.direction === 'down' ? this.from : this.to;
    this.lastTime = performance.now();
    this.animate();
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap delta time
    this.lastTime = currentTime;

    // Spring physics simulation
    const displacement = this.currentValue - this.targetValue;
    const springForce = -this.stiffness * displacement;
    const dampingForce = -this.damping * this.velocity;
    const acceleration = springForce + dampingForce;

    this.velocity += acceleration * deltaTime;
    this.currentValue += this.velocity * deltaTime;

    this.updateDisplay(this.currentValue);

    // Check if animation should stop
    if (Math.abs(this.velocity) < 0.01 && Math.abs(displacement) < 0.01) {
      this.currentValue = this.targetValue;
      this.updateDisplay(this.currentValue);
      if (typeof this.onEnd === 'function') this.onEnd();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateDisplay(value) {
    const formatted = this.formatValue(value);
    this.element.textContent = formatted;
  }

  formatValue(value) {
    const rounded = Math.round(value);
    if (this.separator) {
      return rounded.toLocaleString('en-US').replace(/,/g, this.separator);
    }
    return rounded.toString();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize all count-up elements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const countUpElements = document.querySelectorAll('[data-countup]');
  
  countUpElements.forEach((element) => {
    const to = parseInt(element.getAttribute('data-countup'), 10);
    const from = parseInt(element.getAttribute('data-from') || '0', 10);
    const duration = parseFloat(element.getAttribute('data-duration') || '2');
    const delay = parseFloat(element.getAttribute('data-delay') || '0');
    const separator = element.getAttribute('data-separator') || ',';
    const direction = element.getAttribute('data-direction') || 'up';

    new CountUp(element, {
      to,
      from,
      duration,
      delay,
      separator,
      direction
    });
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CountUp;
}
