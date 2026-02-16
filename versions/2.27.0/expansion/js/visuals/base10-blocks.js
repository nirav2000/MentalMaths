/**
 * Base-10 Blocks Visual
 * SVG-based representation of place value using colored blocks.
 */

export class Base10Visual {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      unitSize: options.unitSize || 20,
      gap: options.gap || 4,
      strokeColor: options.strokeColor || '#fff',
      blockStyle: options.blockStyle || 'solid',
      colours: {
        ones: '#42A5F5',      // Blue
        tens: '#FF9800',      // Orange
        hundreds: '#66BB6A',  // Green
        thousands: '#9C27B0'  // Purple
      },
      ...options
    };

    this.svg = null;
    this.blocksGroup = null;
  }

  /**
   * Renders a number using base-10 blocks.
   * @param {number} n - Number to display
   */
  renderNumber(n) {
    this.container.innerHTML = '';

    const thousands = Math.floor(n / 1000);
    const hundreds = Math.floor((n % 1000) / 100);
    const tens = Math.floor((n % 100) / 10);
    const ones = n % 10;

    const totalWidth = 800;
    const totalHeight = 300;

    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'base10-svg');
    this.svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    this.blocksGroup = this.createGroup('blocks-group');
    this.svg.appendChild(this.blocksGroup);

    let xOffset = 20;

    // Thousands (cubes with 3D effect)
    for (let i = 0; i < thousands; i++) {
      const cube = this.createThousandsCube(xOffset, 50);
      this.blocksGroup.appendChild(cube);
      xOffset += 100 + this.options.gap;
    }

    // Hundreds (10×10 squares)
    for (let i = 0; i < hundreds; i++) {
      const hundred = this.createHundredBlock(xOffset, 50);
      this.blocksGroup.appendChild(hundred);
      xOffset += 100 + this.options.gap;
    }

    // Tens (1×10 rods)
    for (let i = 0; i < tens; i++) {
      const ten = this.createTenRod(xOffset, 50);
      this.blocksGroup.appendChild(ten);
      xOffset += this.options.unitSize + this.options.gap;
    }

    // Ones (1×1 squares)
    for (let i = 0; i < ones; i++) {
      const one = this.createOneUnit(xOffset, 50);
      this.blocksGroup.appendChild(one);
      xOffset += this.options.unitSize + this.options.gap;
    }

    // Add label
    const label = this.createText(totalWidth / 2, totalHeight - 20, `${n}`, '#333', '24px', 'bold');
    this.svg.appendChild(label);

    this.container.appendChild(this.svg);
  }

  /**
   * Animates breaking a block into smaller units.
   * @param {string} place - 'tens', 'hundreds', or 'thousands'
   */
  async animateBreak(place) {
    const breakGroup = this.createGroup('break-animation');
    this.svg.appendChild(breakGroup);

    if (place === 'tens') {
      // Show ten-rod breaking into 10 ones
      const tenRod = this.createTenRod(300, 100);
      breakGroup.appendChild(tenRod);
      await this.sleep(500);

      // Animate break
      tenRod.style.transition = 'opacity 0.3s';
      tenRod.style.opacity = '0';
      await this.sleep(300);

      // Show 10 separate ones
      for (let i = 0; i < 10; i++) {
        const one = this.createOneUnit(280 + (i * (this.options.unitSize + 2)), 100);
        one.style.opacity = '0';
        breakGroup.appendChild(one);
        await this.sleep(100);
        one.style.transition = 'opacity 0.3s';
        one.style.opacity = '1';
      }
    }
  }

  /**
   * Animates combining units into a larger block.
   * @param {string} place - 'tens', 'hundreds', or 'thousands'
   */
  async animateCombine(place) {
    const combineGroup = this.createGroup('combine-animation');
    this.svg.appendChild(combineGroup);

    if (place === 'tens') {
      // Show 10 ones combining into a ten-rod
      for (let i = 0; i < 10; i++) {
        const one = this.createOneUnit(280 + (i * (this.options.unitSize + 2)), 100);
        combineGroup.appendChild(one);
      }
      await this.sleep(500);

      // Fade out ones
      const ones = combineGroup.querySelectorAll('rect');
      ones.forEach(one => {
        one.style.transition = 'opacity 0.3s';
        one.style.opacity = '0';
      });
      await this.sleep(300);

      // Show ten-rod
      const tenRod = this.createTenRod(300, 100);
      tenRod.style.opacity = '0';
      combineGroup.appendChild(tenRod);
      await this.sleep(100);
      tenRod.style.transition = 'opacity 0.3s';
      tenRod.style.opacity = '1';
    }
  }

  /**
   * Animates adding units.
   * @param {number} n - Number of ones to add
   */
  async animateAdd(n) {
    const existingOnes = this.blocksGroup.querySelectorAll('.one-unit').length;
    let xOffset = 400;

    for (let i = 0; i < n; i++) {
      const one = this.createOneUnit(xOffset + (i * (this.options.unitSize + 2)), 150);
      one.style.opacity = '0';
      this.blocksGroup.appendChild(one);
      await this.sleep(200);
      one.style.transition = 'opacity 0.3s';
      one.style.opacity = '1';
    }
  }

  /**
   * Animates removing units.
   * @param {number} n - Number of ones to remove
   */
  async animateSubtract(n) {
    const ones = Array.from(this.blocksGroup.querySelectorAll('.one-unit')).slice(-n);

    for (const one of ones) {
      one.style.transition = 'opacity 0.3s';
      one.style.opacity = '0';
      await this.sleep(200);
      one.remove();
    }
  }

  // Helper methods

  createOneUnit(x, y) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'one-unit');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', this.options.unitSize);
    rect.setAttribute('height', this.options.unitSize);
    this.applyBlockStyle(rect, this.options.colours.ones);
    rect.setAttribute('stroke-width', '1');
    rect.setAttribute('rx', '2');
    return rect;
  }

  createTenRod(x, y) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'ten-rod');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', this.options.unitSize);
    rect.setAttribute('height', this.options.unitSize * 10);
    this.applyBlockStyle(rect, this.options.colours.tens);
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '3');
    return rect;
  }

  createHundredBlock(x, y) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'hundred-block');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 100);
    rect.setAttribute('height', 100);
    this.applyBlockStyle(rect, this.options.colours.hundreds);
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '4');
    return rect;
  }

  createThousandsCube(x, y) {
    const g = this.createGroup('thousands-cube');
    const size = 80;

    // Front face
    const front = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    front.setAttribute('x', x);
    front.setAttribute('y', y + 20);
    front.setAttribute('width', size);
    front.setAttribute('height', size);
    this.applyBlockStyle(front, this.options.colours.thousands);
    front.setAttribute('stroke-width', '2');

    // Top face (3D effect)
    const top = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    top.setAttribute('points', `${x},${y + 20} ${x + 20},${y} ${x + size + 20},${y} ${x + size},${y + 20}`);
    top.setAttribute('fill', this.options.colours.thousands);
    top.setAttribute('opacity', '0.8');
    top.setAttribute('stroke', this.options.strokeColor);
    top.setAttribute('stroke-width', '2');

    // Right face (3D effect)
    const right = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    right.setAttribute('points', `${x + size},${y + 20} ${x + size + 20},${y} ${x + size + 20},${y + size} ${x + size},${y + size + 20}`);
    right.setAttribute('fill', this.options.colours.thousands);
    right.setAttribute('opacity', '0.6');
    right.setAttribute('stroke', this.options.strokeColor);
    right.setAttribute('stroke-width', '2');

    g.appendChild(top);
    g.appendChild(right);
    g.appendChild(front);

    return g;
  }

  createGroup(className) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', className);
    return g;
  }

  applyBlockStyle(el, colour) {
    if (this.options.blockStyle === 'outline') {
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', colour);
    } else {
      el.setAttribute('fill', colour);
      el.setAttribute('stroke', this.options.strokeColor);
    }
  }

  createText(x, y, text, fill, fontSize = '14px', fontWeight = 'normal') {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', x);
    textEl.setAttribute('y', y);
    textEl.setAttribute('fill', fill);
    textEl.setAttribute('font-size', fontSize);
    textEl.setAttribute('font-weight', fontWeight);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.textContent = text;
    return textEl;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
