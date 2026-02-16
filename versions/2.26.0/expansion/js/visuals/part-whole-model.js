/**
 * Part-Whole Model Visual
 * SVG-based cherry/part-whole diagram for number bonds and fact families.
 */

export class PartWholeVisual {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      circleRadius: options.circleRadius || 50,
      colours: {
        whole: '#42A5F5',    // Blue
        part1: '#66BB6A',    // Green
        part2: '#FFB74D',    // Orange
        blank: '#EEEEEE'     // Grey
      },
      ...options
    };

    this.svg = null;
  }

  /**
   * Renders a complete part-whole model.
   * @param {number} whole - The whole value
   * @param {number} part1 - First part value
   * @param {number} part2 - Second part value
   */
  render(whole, part1, part2) {
    this.container.innerHTML = '';

    const width = 400;
    const height = 300;
    const radius = this.options.circleRadius;

    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'part-whole-svg');
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Positions
    const wholeCx = width / 2;
    const wholeCy = 80;
    const part1Cx = wholeCx - 80;
    const part1Cy = 220;
    const part2Cx = wholeCx + 80;
    const part2Cy = 220;

    // Draw lines first (so they appear behind circles)
    const line1 = this.createLine(wholeCx, wholeCy + radius, part1Cx, part1Cy - radius, '#999', 3);
    const line2 = this.createLine(wholeCx, wholeCy + radius, part2Cx, part2Cy - radius, '#999', 3);
    this.svg.appendChild(line1);
    this.svg.appendChild(line2);

    // Draw circles
    const wholeCircle = this.createCircle(wholeCx, wholeCy, radius, this.options.colours.whole, whole);
    const part1Circle = this.createCircle(part1Cx, part1Cy, radius, this.options.colours.part1, part1);
    const part2Circle = this.createCircle(part2Cx, part2Cy, radius, this.options.colours.part2, part2);

    this.svg.appendChild(wholeCircle);
    this.svg.appendChild(part1Circle);
    this.svg.appendChild(part2Circle);

    this.container.appendChild(this.svg);
  }

  /**
   * Renders a model with one value blank.
   * @param {Object} known - Known values {whole, part1, part2}
   * @param {string} unknown - Which value is unknown: 'whole', 'part1', or 'part2'
   */
  renderBlank(known, unknown) {
    this.container.innerHTML = '';

    const width = 400;
    const height = 300;
    const radius = this.options.circleRadius;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'part-whole-svg');
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const wholeCx = width / 2;
    const wholeCy = 80;
    const part1Cx = wholeCx - 80;
    const part1Cy = 220;
    const part2Cx = wholeCx + 80;
    const part2Cy = 220;

    // Draw lines
    const line1 = this.createLine(wholeCx, wholeCy + radius, part1Cx, part1Cy - radius, '#999', 3);
    const line2 = this.createLine(wholeCx, wholeCy + radius, part2Cx, part2Cy - radius, '#999', 3);
    this.svg.appendChild(line1);
    this.svg.appendChild(line2);

    // Draw circles based on what's known/unknown
    const wholeValue = unknown === 'whole' ? '?' : known.whole;
    const part1Value = unknown === 'part1' ? '?' : known.part1;
    const part2Value = unknown === 'part2' ? '?' : known.part2;

    const wholeColour = unknown === 'whole' ? this.options.colours.blank : this.options.colours.whole;
    const part1Colour = unknown === 'part1' ? this.options.colours.blank : this.options.colours.part1;
    const part2Colour = unknown === 'part2' ? this.options.colours.blank : this.options.colours.part2;

    const wholeCircle = this.createCircle(wholeCx, wholeCy, radius, wholeColour, wholeValue);
    const part1Circle = this.createCircle(part1Cx, part1Cy, radius, part1Colour, part1Value);
    const part2Circle = this.createCircle(part2Cx, part2Cy, radius, part2Colour, part2Value);

    this.svg.appendChild(wholeCircle);
    this.svg.appendChild(part1Circle);
    this.svg.appendChild(part2Circle);

    this.container.appendChild(this.svg);
  }

  /**
   * Animates splitting the whole into two parts.
   * @param {number} whole - Whole value
   * @param {number} part1 - First part
   * @param {number} part2 - Second part
   */
  async animateSplit(whole, part1, part2) {
    this.container.innerHTML = '';

    const width = 400;
    const height = 300;
    const radius = this.options.circleRadius;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'part-whole-svg');
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const wholeCx = width / 2;
    const wholeCy = 80;
    const part1Cx = wholeCx - 80;
    const part1Cy = 220;
    const part2Cx = wholeCx + 80;
    const part2Cy = 220;

    // Show whole circle first
    const wholeCircle = this.createCircle(wholeCx, wholeCy, radius, this.options.colours.whole, whole);
    this.svg.appendChild(wholeCircle);
    this.container.appendChild(this.svg);
    await this.sleep(800);

    // Draw lines
    const line1 = this.createLine(wholeCx, wholeCy + radius, part1Cx, part1Cy - radius, '#999', 3);
    const line2 = this.createLine(wholeCx, wholeCy + radius, part2Cx, part2Cy - radius, '#999', 3);
    line1.style.opacity = '0';
    line2.style.opacity = '0';
    this.svg.insertBefore(line1, wholeCircle);
    this.svg.insertBefore(line2, wholeCircle);

    await this.sleep(100);
    line1.style.transition = 'opacity 0.5s';
    line2.style.transition = 'opacity 0.5s';
    line1.style.opacity = '1';
    line2.style.opacity = '1';
    await this.sleep(500);

    // Show part circles
    const part1Circle = this.createCircle(part1Cx, part1Cy, radius, this.options.colours.part1, part1);
    const part2Circle = this.createCircle(part2Cx, part2Cy, radius, this.options.colours.part2, part2);
    part1Circle.style.opacity = '0';
    part2Circle.style.opacity = '0';
    this.svg.appendChild(part1Circle);
    this.svg.appendChild(part2Circle);

    await this.sleep(100);
    part1Circle.style.transition = 'opacity 0.5s';
    part2Circle.style.transition = 'opacity 0.5s';
    part1Circle.style.opacity = '1';
    part2Circle.style.opacity = '1';
  }

  /**
   * Animates combining two parts into the whole.
   * @param {number} part1 - First part
   * @param {number} part2 - Second part
   * @param {number} whole - Whole value
   */
  async animateCombine(part1, part2, whole) {
    this.container.innerHTML = '';

    const width = 400;
    const height = 300;
    const radius = this.options.circleRadius;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'part-whole-svg');
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const wholeCx = width / 2;
    const wholeCy = 80;
    const part1Cx = wholeCx - 80;
    const part1Cy = 220;
    const part2Cx = wholeCx + 80;
    const part2Cy = 220;

    // Show part circles first
    const part1Circle = this.createCircle(part1Cx, part1Cy, radius, this.options.colours.part1, part1);
    const part2Circle = this.createCircle(part2Cx, part2Cy, radius, this.options.colours.part2, part2);
    this.svg.appendChild(part1Circle);
    this.svg.appendChild(part2Circle);
    this.container.appendChild(this.svg);
    await this.sleep(800);

    // Draw lines
    const line1 = this.createLine(wholeCx, wholeCy + radius, part1Cx, part1Cy - radius, '#999', 3);
    const line2 = this.createLine(wholeCx, wholeCy + radius, part2Cx, part2Cy - radius, '#999', 3);
    line1.style.opacity = '0';
    line2.style.opacity = '0';
    this.svg.insertBefore(line1, part1Circle);
    this.svg.insertBefore(line2, part1Circle);

    await this.sleep(100);
    line1.style.transition = 'opacity 0.5s';
    line2.style.transition = 'opacity 0.5s';
    line1.style.opacity = '1';
    line2.style.opacity = '1';
    await this.sleep(500);

    // Show whole circle
    const wholeCircle = this.createCircle(wholeCx, wholeCy, radius, this.options.colours.whole, whole);
    wholeCircle.style.opacity = '0';
    this.svg.appendChild(wholeCircle);

    await this.sleep(100);
    wholeCircle.style.transition = 'opacity 0.5s';
    wholeCircle.style.opacity = '1';
  }

  // Helper methods

  createCircle(cx, cy, r, fill, label) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '3');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx);
    text.setAttribute('y', cy + 8);
    text.setAttribute('fill', '#fff');
    text.setAttribute('font-size', '28px');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = label;

    g.appendChild(circle);
    g.appendChild(text);

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

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
