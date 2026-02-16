/**
 * Ten Frame Visual
 * SVG-based 2×5 ten frame for visualizing number bonds and making 10.
 */

export class TenFrameVisual {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      count: options.count || 10,
      total: options.total || 10,
      colours: options.colours || ['#4CAF50', '#42A5F5'],
      cellSize: options.cellSize || 60,
      gap: options.gap || 4,
      ...options
    };

    this.svg = null;
    this.frames = [];
    this.interactiveState = null;
  }

  /**
   * Renders ten frame(s) with specified number of filled dots.
   * @param {number} filled - Number of dots to fill
   */
  render(filled = 0) {
    this.container.innerHTML = '';

    // Calculate number of frames needed
    const framesNeeded = Math.ceil(Math.max(filled, this.options.total) / 10);
    const frameWidth = (this.options.cellSize * 5) + (this.options.gap * 4);
    const frameHeight = (this.options.cellSize * 2) + this.options.gap;
    const totalWidth = (frameWidth + 20) * framesNeeded;
    const totalHeight = frameHeight + 40;

    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'ten-frame-svg');
    this.svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Create frames
    for (let f = 0; f < framesNeeded; f++) {
      const frameX = f * (frameWidth + 20);
      const frameGroup = this.createFrame(frameX, 20);
      this.svg.appendChild(frameGroup);
      this.frames.push(frameGroup);

      // Fill dots for this frame
      const dotsInThisFrame = Math.min(10, Math.max(0, filled - (f * 10)));
      for (let i = 0; i < dotsInThisFrame; i++) {
        const dot = this.createDot(i, this.options.colours[0]);
        dot.setAttribute('transform', `translate(${frameX}, 20)`);
        this.svg.appendChild(dot);
      }
    }

    this.container.appendChild(this.svg);
  }

  /**
   * Animates adding dots one by one.
   * @param {number} count - Number of dots to add
   * @param {string} colour - Dot colour
   */
  async animateAdd(count, colour = null) {
    const dotColour = colour || this.options.colours[0];
    const currentDots = this.svg.querySelectorAll('.dot').length;

    for (let i = 0; i < count; i++) {
      const dotIndex = currentDots + i;
      const frameIndex = Math.floor(dotIndex / 10);
      const frameX = frameIndex * ((this.options.cellSize * 5) + (this.options.gap * 4) + 20);

      const dot = this.createDot(dotIndex % 10, dotColour);
      dot.setAttribute('transform', `translate(${frameX}, 20)`);
      dot.style.opacity = '0';
      this.svg.appendChild(dot);

      // Fade in
      await this.sleep(200);
      dot.style.transition = 'opacity 0.3s';
      dot.style.opacity = '1';
      await this.sleep(100);
    }
  }

  /**
   * Animates removing dots one by one.
   * @param {number} count - Number of dots to remove
   */
  async animateRemove(count) {
    const dots = Array.from(this.svg.querySelectorAll('.dot'));
    const dotsToRemove = dots.slice(-count);

    for (const dot of dotsToRemove) {
      dot.style.transition = 'opacity 0.3s';
      dot.style.opacity = '0';
      await this.sleep(300);
      dot.remove();
    }
  }

  /**
   * Animates making 10 with two colors.
   * Shows 'a' dots in colour1, then adds dots from 'b' filling to 10,
   * remaining in colour2 in a second frame.
   * @param {number} a - First number (e.g., 7)
   * @param {number} b - Second number (e.g., 5)
   */
  async animateMake10(a, b) {
    this.container.innerHTML = '';

    const framesNeeded = Math.ceil((a + b) / 10);
    const frameWidth = (this.options.cellSize * 5) + (this.options.gap * 4);
    const frameHeight = (this.options.cellSize * 2) + this.options.gap;
    const totalWidth = (frameWidth + 20) * framesNeeded;
    const totalHeight = frameHeight + 80;

    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'ten-frame-svg');
    this.svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Create frames
    for (let f = 0; f < framesNeeded; f++) {
      const frameX = f * (frameWidth + 20);
      const frameGroup = this.createFrame(frameX, 20);
      this.svg.appendChild(frameGroup);
    }

    this.container.appendChild(this.svg);

    // Step 1: Show 'a' dots in colour1
    const colour1 = this.options.colours[0];
    for (let i = 0; i < a; i++) {
      const dot = this.createDot(i, colour1);
      dot.setAttribute('transform', 'translate(0, 20)');
      dot.style.opacity = '0';
      this.svg.appendChild(dot);
      await this.sleep(150);
      dot.style.transition = 'opacity 0.3s';
      dot.style.opacity = '1';
    }

    await this.sleep(500);

    // Step 2: Add dots from 'b' to fill to 10 (colour2)
    const colour2 = this.options.colours[1];
    const needToFill10 = 10 - a;
    const dotsToAdd = Math.min(b, needToFill10);

    for (let i = 0; i < dotsToAdd; i++) {
      const dotIndex = a + i;
      const dot = this.createDot(dotIndex, colour2);
      dot.setAttribute('transform', 'translate(0, 20)');
      dot.style.opacity = '0';
      this.svg.appendChild(dot);
      await this.sleep(200);
      dot.style.transition = 'opacity 0.3s';
      dot.style.opacity = '1';
    }

    await this.sleep(500);

    // Step 3: Show remaining dots in second frame if needed
    const remaining = b - needToFill10;
    if (remaining > 0) {
      const frameX = frameWidth + 20;
      for (let i = 0; i < remaining; i++) {
        const dot = this.createDot(i, colour2);
        dot.setAttribute('transform', `translate(${frameX}, 20)`);
        dot.style.opacity = '0';
        this.svg.appendChild(dot);
        await this.sleep(200);
        dot.style.transition = 'opacity 0.3s';
        dot.style.opacity = '1';
      }
    }

    // Add labels below
    await this.sleep(300);
    const label1 = this.createLabel(frameWidth / 2, frameHeight + 50, `${a} + ${b} = 10 + ${remaining}`, '#333');
    this.svg.appendChild(label1);
  }

  // Helper methods

  createFrame(x, y) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'ten-frame');
    group.setAttribute('transform', `translate(${x}, ${y})`);

    const cellSize = this.options.cellSize;
    const gap = this.options.gap;

    // Draw 2×5 grid
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', col * (cellSize + gap));
        rect.setAttribute('y', row * (cellSize + gap));
        rect.setAttribute('width', cellSize);
        rect.setAttribute('height', cellSize);
        rect.setAttribute('fill', '#f5f5f5');
        rect.setAttribute('stroke', '#999');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '4');
        group.appendChild(rect);
      }
    }

    return group;
  }

  createDot(index, colour) {
    const cellSize = this.options.cellSize;
    const gap = this.options.gap;
    const row = Math.floor(index / 5);
    const col = index % 5;

    const cx = col * (cellSize + gap) + (cellSize / 2);
    const cy = row * (cellSize + gap) + (cellSize / 2);
    const r = cellSize * 0.35;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'dot');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', colour);
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');

    return circle;
  }

  createLabel(x, y, text, fill) {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', x);
    textEl.setAttribute('y', y);
    textEl.setAttribute('fill', fill);
    textEl.setAttribute('font-size', '18px');
    textEl.setAttribute('font-weight', 'bold');
    textEl.setAttribute('text-anchor', 'middle');
    textEl.textContent = text;
    return textEl;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Renders an interactive ten-frame partition activity for a + b.
   * Users can click cells to assign them to section A or B.
   * @param {number} a - First addend
   * @param {number} b - Second addend
   * @param {Object} options - Interaction options
   * @param {'a'|'b'} [options.activeSection='a'] - Initially active section
   * @param {(state:Object)=>void} [options.onChange] - Callback on every change
   */
  renderInteractivePartition(a, b, options = {}) {
    const total = a + b;
    const framesNeeded = Math.ceil(Math.max(10, total) / 10);
    const frameWidth = (this.options.cellSize * 5) + (this.options.gap * 4);
    const frameHeight = (this.options.cellSize * 2) + this.options.gap;
    const totalWidth = (frameWidth + 20) * framesNeeded;
    const totalHeight = frameHeight + 40;

    this.interactiveState = {
      a,
      b,
      total,
      framesNeeded,
      activeSection: options.activeSection || 'a',
      selectedA: new Set(),
      selectedB: new Set(),
      onChange: options.onChange || null
    };

    this.container.innerHTML = '';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'ten-frame-svg');
    this.svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    for (let frame = 0; frame < framesNeeded; frame++) {
      const frameX = frame * (frameWidth + 20);
      const frameGroup = this.createFrame(frameX, 20);
      this.svg.appendChild(frameGroup);

      for (let i = 0; i < 10; i++) {
        const globalIndex = frame * 10 + i;
        const cell = this.createInteractiveCell(i, frameX, globalIndex);
        this.svg.appendChild(cell);
      }
    }

    this.container.appendChild(this.svg);
    this.notifyInteractiveChange();
  }

  setInteractiveSection(section) {
    if (!this.interactiveState) return;
    if (section !== 'a' && section !== 'b') return;

    this.interactiveState.activeSection = section;
    this.notifyInteractiveChange();
  }

  clearInteractiveSelections() {
    if (!this.interactiveState) return;

    this.interactiveState.selectedA.clear();
    this.interactiveState.selectedB.clear();

    this.svg?.querySelectorAll('.ten-frame-interactive-cell').forEach((cell) => {
      cell.classList.remove('selected-a', 'selected-b');
    });

    this.notifyInteractiveChange();
  }

  createInteractiveCell(index, frameX, globalIndex) {
    const cellSize = this.options.cellSize;
    const gap = this.options.gap;
    const row = Math.floor(index / 5);
    const col = index % 5;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'ten-frame-interactive-cell');
    rect.setAttribute('x', frameX + col * (cellSize + gap));
    rect.setAttribute('y', 20 + row * (cellSize + gap));
    rect.setAttribute('width', cellSize);
    rect.setAttribute('height', cellSize);
    rect.setAttribute('rx', '4');
    rect.dataset.index = String(globalIndex);

    rect.addEventListener('click', () => this.toggleInteractiveCell(globalIndex, rect));
    return rect;
  }

  toggleInteractiveCell(globalIndex, rect) {
    if (!this.interactiveState) return;
    const { total, activeSection, selectedA, selectedB } = this.interactiveState;

    if (globalIndex >= total) return;

    const wasSelected = selectedA.has(globalIndex) || selectedB.has(globalIndex);

    if (selectedA.has(globalIndex)) {
      selectedA.delete(globalIndex);
      rect.classList.remove('selected-a');
    }
    if (selectedB.has(globalIndex)) {
      selectedB.delete(globalIndex);
      rect.classList.remove('selected-b');
    }

    if (wasSelected) {
      this.notifyInteractiveChange();
      return;
    }

    const alreadySelectedCount = selectedA.size + selectedB.size;
    if (alreadySelectedCount >= total) {
      this.notifyInteractiveChange();
      return;
    }

    if (activeSection === 'a') {
      selectedA.add(globalIndex);
      rect.classList.add('selected-a');
    } else {
      selectedB.add(globalIndex);
      rect.classList.add('selected-b');
    }

    this.notifyInteractiveChange();
  }

  getInteractiveSummary() {
    if (!this.interactiveState) return null;

    const { a, b, total, activeSection, selectedA, selectedB } = this.interactiveState;
    const countA = selectedA.size;
    const countB = selectedB.size;
    const countTotal = countA + countB;

    return {
      a,
      b,
      total,
      activeSection,
      countA,
      countB,
      countTotal,
      isComplete: countTotal === total,
      isCorrect: countA === a && countB === b && countTotal === total
    };
  }

  notifyInteractiveChange() {
    if (!this.interactiveState?.onChange) return;
    this.interactiveState.onChange(this.getInteractiveSummary());
  }
}
