const nodeRadius = 16;
let nameInput;
let nameButton;
let picked;
let nodes = [];
let paths = [];

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
  picked.pos.x = mouseX;
  picked.pos.y = mouseY;
}

function mouseReleased() {
  picked = null;
}

function draw() {
  background(220);
  paths.forEach((p) => p.display());
  for (let node of nodes) {
    node.display();
    if (!node.isHover()) continue;
    textBox(node.hoverText, mouseX, mouseY);
  }
}

function textBox(txt, x, y) {
  textAlign(LEFT, BOTTOM);
  const w = textWidth(txt);
  rect(x, y - textSize() - 16, w + 16, textSize() + 16);
  text(txt, x + 8, y - 8);
}

function updateGraph() {
  nodes = [];
  paths = [];
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
    };
    let x, y;
    if (data.priority < 3) {
      x = random(width / 2 + nodeRadius, width - nodeRadius);
    } else {
      x = random(nodeRadius, width / 2 - nodeRadius);
    }
    y = random(nodeRadius, height - nodeRadius);
    const newNode = new Node(x, y, data);
    for (let node of nodes) {
      if (data.priority === node.data.priority) {
        const newPath = new Path(node, newNode);
        paths.push(newPath);
      }
    }
    newNode.displayText = newNode.data.priority;
    newNode.hoverText = newNode.data.name;
    nodes.push(newNode);
  }
}
