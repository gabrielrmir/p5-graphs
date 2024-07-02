const nodeRadius = 16;
const subNodeRadius = 8;
let nameInput;
let nameButton;
let picked;
let nodes = [];

class Node {
  constructor(x, y, data) {
    this.pos = createVector(x, y);
    this.data = data;
    this.subNodes = this.data.people.map((person, index) => {
      const angle = (TWO_PI / this.data.people.length) * index;
      const radius = nodeRadius + subNodeRadius + 4;
      const subNodePos = createVector(
        this.pos.x + cos(angle) * radius,
        this.pos.y + sin(angle) * radius,
      );
      return { pos: subNodePos, name: person };
    });
  }

  isHover() {
    return dist(this.pos.x, this.pos.y, mouseX, mouseY) <= nodeRadius;
  }

  drawBefore() {
    for (let subNode of this.subNodes) {
      line(this.pos.x, this.pos.y, subNode.pos.x, subNode.pos.y);
    }

    for (let otherNode of nodes) {
      if (
        this.data.priority === otherNode.data.priority &&
        this !== otherNode
      ) {
        line(this.pos.x, this.pos.y, otherNode.pos.x, otherNode.pos.y);
      }
    }
  }

  draw() {
    circle(this.pos.x, this.pos.y, nodeRadius * 2);
    textAlign(CENTER, CENTER);
    text(this.data.priority, this.pos.x, this.pos.y);

    for (let subNode of this.subNodes) {
      circle(subNode.pos.x, subNode.pos.y, subNodeRadius * 2);
    }
  }

  drawAfter() {
    for (let subNode of this.subNodes) {
      if (dist(subNode.pos.x, subNode.pos.y, mouseX, mouseY) <= subNodeRadius) {
        textBox(subNode.name, mouseX, mouseY);
      }
    }
  }
}

function setup() {
  createCanvas(800, 800);

  const inputsDiv = select("#inputs");

  const numPeopleInput = createInput();
  numPeopleInput.attribute("type", "number");
  numPeopleInput.attribute("placeholder", "Quantas pessoas irão comparecer?");
  numPeopleInput.style("width", "300px"); // Aumenta o tamanho do input
  numPeopleInput.parent(inputsDiv);

  const generateInputsButton = createButton("Gerar inputs");
  generateInputsButton.mousePressed(() =>
    generateInputs(numPeopleInput.value()),
  );
  generateInputsButton.parent(inputsDiv);

  nameButton = createButton("Gerar mapa");
  nameButton.mousePressed(updateGraph);
  nameButton.parent(inputsDiv);
}

function generateInputs(numPeople) {
  const inputsDiv = select("#inputs");
  inputsDiv.html("");

  const numPeopleInt = parseInt(numPeople);
  if (isNaN(numPeopleInt) || numPeopleInt <= 0) {
    alert("Por favor, insira um número válido de pessoas.");
    return;
  }

  const table = createElement("table");
  table.parent(inputsDiv);

  const thead = createElement("thead");
  thead.parent(table);

  const headerRow = createElement("tr");
  headerRow.parent(thead);

  const nameHeader = createElement("th", "Nome");
  nameHeader.parent(headerRow);

  const priorityHeader = createElement("th", "Prioridade");
  priorityHeader.parent(headerRow);

  const tbody = createElement("tbody");
  tbody.parent(table);

  for (let i = 0; i < numPeopleInt; i++) {
    const row = createElement("tr");
    row.parent(tbody);

    const nameCell = createElement("td");
    nameCell.parent(row);

    const nameInput = createElement("input");
    nameInput.attribute("type", "text");
    nameInput.parent(nameCell);

    const priorityCell = createElement("td");
    priorityCell.parent(row);

    const priorityInput = createElement("input");
    priorityInput.attribute("type", "number");
    priorityInput.attribute("min", "1");
    priorityInput.attribute("max", "4");
    priorityInput.parent(priorityCell);
  }

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

  for (let i = 0; i < picked.subNodes.length; i++) {
    const angle = (TWO_PI / picked.subNodes.length) * i;
    const radius = nodeRadius + subNodeRadius + 4;
    picked.subNodes[i].pos.x = picked.pos.x + cos(angle) * radius;
    picked.subNodes[i].pos.y = picked.pos.y + sin(angle) * radius;
  }
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
  textAlign(LEFT, TOP);
  const lines = txt.split("\n");
  const maxWidth = Math.max(...lines.map((line) => textWidth(line)));
  const boxWidth = maxWidth + 16;
  const boxHeight = lines.length * textSize() + 16;

  let boxX = x;
  let boxY = y - boxHeight;

  if (boxX + boxWidth > width) {
    boxX = width - boxWidth;
  }
  if (boxY < 0) {
    boxY = 0;
  }

  rect(boxX, boxY, boxWidth, boxHeight);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], boxX + 8, boxY + 8 + i * textSize());
  }
}

function updateGraph() {
  nodes = [];
  const tbody = select("tbody");
  const rows = tbody.elt.children;
  const peopleByPriority = { 1: [], 2: [], 3: [], 4: [] };

  for (let row of rows) {
    const nameInput = row.children[0].children[0];
    const priorityInput = row.children[1].children[0];
    const name = nameInput.value.trim();
    const priority = parseInt(priorityInput.value.trim());

    if (name && !isNaN(priority) && priority >= 1 && priority <= 4) {
      peopleByPriority[priority].push(name);
    }
  }

  for (let priority in peopleByPriority) {
    let people = peopleByPriority[priority];
    while (people.length > 0) {
      const data = {
        priority: parseInt(priority),
        people: people.splice(0, 4),
        conn: [],
      };
      let x = random(nodeRadius, width - nodeRadius);
      let y = random(nodeRadius, height - nodeRadius);
      const newNode = new Node(x, y, data);
      nodes.push(newNode);
    }
  }
}
