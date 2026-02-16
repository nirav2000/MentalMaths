/**
 * Number Line Visual
 * SVG-based number line with animated jumps for sequencing, counting, and compensation.
 */

export class NumberLineVisual {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      min: options.min || 0,
      max: options.max || 20,
      start: options.start || null,
      showLabels: options.showLabels !== false,
      tickInterval: options.tickInterval || 1,
      width: options.width || 800,
      height: options.height || 200,
      ...options
    };

    this.svg = null;
    this.lineGroup = null;
    this.jumpsGroup = null;
    this.highlightsGroup = null;
    this.tickOverlayGroup = null;
  }

  /**
   * Renders the base number line with ticks and labels.
   */
  render() {
    // Clear container
    this.container.innerHTML = '';

    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'number-line-svg');
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Create groups for layering
    this.lineGroup = this.createGroup('line-group');
    this.jumpsGroup = this.createGroup('jumps-group');
    this.highlightsGroup = this.createGroup('highlights-group');
    this.tickOverlayGroup = this.createGroup('tick-overlay-group');

    this.svg.appendChild(this.lineGroup);
    this.svg.appendChild(this.jumpsGroup);
    this.svg.appendChild(this.highlightsGroup);
    this.svg.appendChild(this.tickOverlayGroup);

    // Draw the horizontal line
    const padding = 60;
    const lineY = this.options.height / 2;
    const lineStart = padding;
    const lineEnd = this.options.width - padding;

    const line = this.createLine(lineStart, lineY, lineEnd, lineY, '#333', 3);
    this.lineGroup.appendChild(line);

    // Draw ticks and labels
    const range = this.options.max - this.options.min;
    const tickCount = Math.floor(range / this.options.tickInterval) + 1;

    for (let i = 0; i < tickCount; i++) {
      const value = this.options.min + (i * this.options.tickInterval);
      const x = this.valueToX(value);

      // Tick mark
      const tick = this.createLine(x, lineY - 10, x, lineY + 10, '#333', 2);
      this.lineGroup.appendChild(tick);

      // Label
      if (this.options.showLabels) {
        const label = this.createText(x, lineY + 30, value.toString(), '#666', '14px');
        this.lineGroup.appendChild(label);
      }
    }

    // Highlight start position if provided
    if (this.options.start !== null) {
      this.highlight(this.options.start, '#42A5F5');
    }

    this.container.appendChild(this.svg);
  }

  /**
   * Adds a jump arc from 'from' to 'to' with label.
   * @param {number} from - Starting value
   * @param {number} to - Ending value
   * @param {string} label - Jump label (e.g., "+200")
   * @param {string} colour - Arc colour
   */
  addJump(from, to, label, colour = '#4CAF50') {
    const x1 = this.valueToX(from);
    const x2 = this.valueToX(to);
    const lineY = this.options.height / 2;
    const isForward = to > from;
    const arcHeight = 40;

    // Arc path (curve above for forward, below for backward)
    const midX = (x1 + x2) / 2;
    const controlY = isForward ? lineY - arcHeight : lineY + arcHeight;
    const path = `M ${x1} ${lineY} Q ${midX} ${controlY} ${x2} ${lineY}`;

    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('d', path);
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', colour);
    arc.setAttribute('stroke-width', '3');
    arc.setAttribute('marker-end', 'url(#arrowhead)');
    arc.classList.add('jump-arc');

    // Arrowhead marker
    if (!this.svg.querySelector('#arrowhead')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrowhead');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '10');
      marker.setAttribute('refX', '8');
      marker.setAttribute('refY', '3');
      marker.setAttribute('orient', 'auto');
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', '0 0, 10 3, 0 6');
      polygon.setAttribute('fill', colour);
      marker.appendChild(polygon);
      defs.appendChild(marker);
      this.svg.insertBefore(defs, this.svg.firstChild);
    }

    // Label on arc
    const labelY = isForward ? controlY - 10 : controlY + 20;
    const labelText = this.createText(midX, labelY, label, colour, '16px', 'bold');
    labelText.classList.add('jump-label');

    this.jumpsGroup.appendChild(arc);
    this.jumpsGroup.appendChild(labelText);
  }

  /**
   * Animates jumps sequentially.
   * @param {Array} jumps - Array of {from, to, label, colour}
   * @param {number} delay - Delay between jumps in ms
   */
  async animateJumps(jumps, delay = 1000) {
    for (const jump of jumps) {
      this.addJump(jump.from, jump.to, jump.label, jump.colour || '#4CAF50');
      this.highlight(jump.to, jump.colour || '#4CAF50');
      await this.sleep(delay);
    }
  }

  /**
   * Highlights a value on the number line.
   * @param {number} value - Value to highlight
   * @param {string} colour - Highlight colour
   */
  highlight(value, colour = '#FF9800') {
    const x = this.valueToX(value);
    const lineY = this.options.height / 2;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', lineY);
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', colour);
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');
    circle.classList.add('highlight-dot');

    this.highlightsGroup.appendChild(circle);
  }

  /**
   * Clears jumps and highlights, keeping base line.
   */
  clear() {
    this.jumpsGroup.innerHTML = '';
    this.highlightsGroup.innerHTML = '';
  }

  /**
   * Enables clickable tick overlays for interactive selection.
   * @param {(value:number)=>void} onSelect - Callback for selected value
   */
  enableSelection(onSelect) {
    if (!this.tickOverlayGroup) return;

    this.tickOverlayGroup.innerHTML = '';
    const range = this.options.max - this.options.min;
    const tickCount = Math.floor(range / this.options.tickInterval) + 1;
    const lineY = this.options.height / 2;

    for (let i = 0; i < tickCount; i++) {
      const value = this.options.min + (i * this.options.tickInterval);
      const x = this.valueToX(value);
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hit.setAttribute('cx', x);
      hit.setAttribute('cy', lineY);
      hit.setAttribute('r', '14');
      hit.setAttribute('class', 'number-line-hit-area');
      hit.setAttribute('tabindex', '0');
      hit.setAttribute('aria-label', `Select ${value}`);

      const selectValue = () => onSelect(value);
      hit.addEventListener('click', selectValue);
      hit.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectValue();
        }
      });

      this.tickOverlayGroup.appendChild(hit);
    }
  }

  /**
   * Resizes the visual (re-renders).
   */
  resize() {
    this.render();
  }

  // Helper methods

  valueToX(value) {
    const padding = 60;
    const lineStart = padding;
    const lineEnd = this.options.width - padding;
    const range = this.options.max - this.options.min;
    const ratio = (value - this.options.min) / range;
    return lineStart + (ratio * (lineEnd - lineStart));
  }

  createGroup(className) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', className);
    return g;
  }

  createLine(x1, y1, x2, y2, stroke, strokeWidth) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', strokeWidth);
    return line;
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
