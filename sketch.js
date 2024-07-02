const nodeRadius = 16;
let nameInput;
let nameButton;
let picked;
let nodes = [];

class Node {
  constructor(x, y, data) {
    this.pos = createVector(x, y);
    this.data = data;
  }

  isHover() {
    return dist(this.pos.x, this.pos.y, mouseX, mouseY) <= nodeRadius;
  }

  drawBefore() {
    for (let c of this.data.conn) {
      line(this.pos.x, this.pos.y, c.pos.x, c.pos.y);
    }
  }

  draw() {
    circle(this.pos.x, this.pos.y, nodeRadius * 2);
    textAlign(CENTER, CENTER);
    text(this.data.priority, this.pos.x, this.pos.y);
  }

  drawAfter() {
    if (!this.isHover()) return;
    textBox(this.data.name, mouseX, mouseY);
  }
}

function setup() {
  createCanvas(500, 500);

  const inputsDiv = select("#inputs");

  nameInput = createElement("textarea");
  const placeholder =
    [1, 2, 3].map((n) => `Nome ${n}, nº prioridade`).join("\n") + "\nEtc...";
  nameInput.attribute("placeholder", placeholder);
  nameInput.style("resize: none");
  nameInput.style("box-sizing: border-box");
  nameInput.size(400, 200);
  nameInput.parent(inputsDiv);

  nameButton = createButton("Gerar mapa");
  nameButton.mousePressed(updateGraph);
  nameButton.parent(inputsDiv);
}

function mousePressed() {
  for (let node of nodes) {
    if (!node.isHover()) continue;
    picked = node;
    break;
  }
}

function mouseDragged() {
  if (!picked) return;
  picked.pos.x = constrain(mouseX, nodeRadius, width - nodeRadius);
  picked.pos.y = constrain(mouseY, nodeRadius, height - nodeRadius);
}

function mouseReleased() {
  picked = null;
}

function draw() {
  background(220);
  nodes.forEach((n) => n.drawBefore());
  nodes.forEach((n) => n.draw());
  nodes.forEach((n) => n.drawAfter());
}

function textBox(txt, x, y) {
  textAlign(LEFT, BOTTOM);
  const w = textWidth(txt);
  rect(x, y - textSize() - 16, w + 16, textSize() + 16);
  text(txt, x + 8, y - 8);
}

function updateGraph() {
  nodes = [];
  const lines = nameInput.value().trim().split("\n");
  for (let line of lines) {
    if (!line) continue;
    const [name, p] = line.split(",").map((s) => s.trim());
    const priority = parseInt(p);
    if (isNaN(priority) || priority < 1 || priority > 4) {
      continue;
    }
    const data = {
      priority: priority,
      name,
      conn: [],
    };
    for (let node of nodes) {
      if (data.priority === node.data.priority) {
        data.conn.push(node);
      }
    }
    let x, y;
    if (data.priority < 3) {
      x = random(width / 2 + nodeRadius, width - nodeRadius);
    } else {
      x = random(nodeRadius, width / 2 - nodeRadius);
    }
    y = random(nodeRadius, height - nodeRadius);
    const newNode = new Node(x, y, data);
    nodes.push(newNode);
  }
}
