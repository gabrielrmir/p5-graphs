class Node {
  constructor(x, y, data) {
    this.pos = createVector(x, y);
    this.radius = 16;
    this.displayText = "";
    this.hoverText = "";
    this.data = data;
  }

  isHover() {
    return dist(this.pos.x, this.pos.y, mouseX, mouseY) <= this.radius;
  }

  display() {
    circle(this.pos.x, this.pos.y, this.radius * 2);
    textAlign(CENTER, CENTER);
    text(this.displayText, this.pos.x, this.pos.y);
  }
}

class Path {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  display() {
    line(this.from.pos.x, this.from.pos.y, this.to.pos.x, this.to.pos.y);
  }
}
