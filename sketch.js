// Define o raio do nó principal
const nodeRadius = 16;
// Define o raio dos subnós
const subNodeRadius = 8;
// Variável para armazenar o nó selecionado pelo usuário
let picked;
// Array para armazenar todos os nós criados
let nodes = [];
let inputs;

let viewOffset;

// Classe que representa um nó no gráfico
class Node {
  // Construtor da classe Node
  constructor(x, y, data) {
    this.pos = createVector(x, y); // Posição do nó principal
    this.data = data; // Dados associados ao nó
    this.subNodes = [];
    this.updateSubNodes();
  }

  updateSubNodes() {
    this.subNodes = this.data.people.map((person, index) => {
      const angle = (TWO_PI / this.data.people.length) * index; // Ângulo para posicionamento dos subnós
      const radius = nodeRadius + subNodeRadius + 4; // Raio para posicionamento dos subnós
      const subNodePos = createVector(
        constrain(
          this.pos.x + cos(angle) * radius,
          subNodeRadius,
          width - subNodeRadius,
        ),
        constrain(
          this.pos.y + sin(angle) * radius,
          subNodeRadius,
          height - subNodeRadius,
        ),
      );
      return { pos: subNodePos, name: person }; // Retorna um objeto com a posição e nome do subnó
    });
  }

  isColliding(node) {
    return (
      dist(this.pos.x, this.pos.y, node.pos.x, node.pos.y) <=
      nodeRadius * 2 + subNodeRadius * 4
    );
  }

  // Método para verificar se o mouse está sobre o nó principal
  isHover() {
    return (
      dist(this.pos.x, this.pos.y, globalMouseX(), globalMouseY()) <= nodeRadius
    );
  }

  // Método para desenhar as linhas antes dos nós e subnós
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

  // Método para desenhar o nó principal e os subnós
  draw() {
    fill(255);
    circle(this.pos.x, this.pos.y, nodeRadius * 2);
    textAlign(CENTER, CENTER);
    fill(0);
    noStroke();
    text(this.data.priority, this.pos.x, this.pos.y);

    stroke(0);
    fill(255);
    for (let subNode of this.subNodes) {
      circle(subNode.pos.x, subNode.pos.y, subNodeRadius * 2);
    }
  }

  // Método para desenhar as caixas de texto após os nós e subnós
  drawAfter() {
    for (let subNode of this.subNodes) {
      if (
        dist(subNode.pos.x, subNode.pos.y, globalMouseX(), globalMouseY()) <=
        subNodeRadius
      ) {
        textBox(subNode.name, globalMouseX(), globalMouseY());
      }
    }
  }
}

class InputsDiv {
  constructor() {
    const inputsDiv = select("#inputs");

    const preInputsDiv = createElement("div");
    preInputsDiv.parent(inputsDiv);

    const numPeopleInput = createInput();
    numPeopleInput.attribute("type", "number");
    numPeopleInput.attribute("placeholder", "Quantas pessoas irão comparecer?");
    numPeopleInput.style("width", "300px");
    numPeopleInput.parent(preInputsDiv);
    this.getNumPeople = () => numPeopleInput.value();

    const numChairsInput = createInput();
    numChairsInput.attribute("type", "number");
    numChairsInput.attribute("placeholder", "Quantas cadeiras por mesa?");
    numChairsInput.style("width", "300px");
    numChairsInput.parent(preInputsDiv);
    this.getNumChairs = () => numChairsInput.value();

    const generateInputsButton = createButton("Gerar inputs");
    generateInputsButton.mousePressed(() =>
      generateInputs(this.getNumPeople()),
    );
    generateInputsButton.parent(preInputsDiv);

    const postInputsDiv = createElement("div");
    postInputsDiv.parent(inputsDiv);
    postInputsDiv.hide();

    const table = createElement("table");
    table.parent(postInputsDiv);

    const thead = createElement("thead");
    thead.parent(table);

    const headerRow = createElement("tr");
    headerRow.parent(thead);

    const nameHeader = createElement("th", "Nome");
    nameHeader.parent(headerRow);

    const priorityHeader = createElement("th", "Prioridade");
    priorityHeader.parent(headerRow);

    const actionsHeader = createElement("th");
    actionsHeader.parent(headerRow);

    const tbody = createElement("tbody");
    tbody.parent(table);
    this.addTableRow = (el) => {
      el.parent(tbody);
    };
    this.getTableRows = () => tbody.elt.children;
    this.clearTable = () => {
      tbody.html("");
    };

    const addInputButton = createButton("+");
    addInputButton.mousePressed(() => {
      this.addTableRow(generateInput(tbody));
    });
    addInputButton.parent(postInputsDiv);

    const nameButton = createButton("Gerar mapa");
    nameButton.mousePressed(updateGraph);
    nameButton.parent(inputsDiv);

    this.showPre = () => {
      preInputsDiv.style("display", "flex");
      postInputsDiv.hide();
    };
    this.showPost = () => {
      preInputsDiv.hide();
      postInputsDiv.style("display", "flex");
    };
  }
}

function globalMouseX() {
  return mouseX - viewOffset.x;
}

function globalMouseY() {
  return mouseY - viewOffset.y;
}

// Função de configuração inicial do canvas e elementos de entrada
function setup() {
  createCanvas(800, 800);
  viewOffset = createVector(0, 0);
  inputs = new InputsDiv();
}

function generateInput() {
  const row = createElement("tr");

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

  const actionsCell = createElement("td");
  actionsCell.parent(row);

  const deleteButton = createButton("x");
  deleteButton.mousePressed(() => row.remove());
  deleteButton.parent(row);

  return row;
}

// Função para gerar os inputs de nome e prioridade com base no número de pessoas
function generateInputs(numPeople) {
  const numPeopleInt = parseInt(numPeople);
  if (isNaN(numPeopleInt) || numPeopleInt <= 0) {
    alert("Por favor, insira um número válido de pessoas.");
    return;
  }

  inputs.clearTable();
  for (let i = 0; i < numPeopleInt; i++) {
    const row = generateInput();
    inputs.addTableRow(row);
  }
  inputs.showPost();
}

// Função chamada quando o mouse é pressionado
function mousePressed() {
  for (let node of nodes) {
    if (!node.isHover()) continue;
    picked = node;
    break;
  }
}

// Função chamada quando o mouse é arrastado
function mouseDragged(mouse) {
  if (mouse.target.tagName !== "CANVAS") return;
  if (!picked) {
    viewOffset.x += mouse.movementX;
    viewOffset.y += mouse.movementY;
    return;
  }
  picked.pos.x = constrain(globalMouseX(), nodeRadius, width - nodeRadius);
  picked.pos.y = constrain(globalMouseY(), nodeRadius, height - nodeRadius);
  picked.updateSubNodes();
}

// Função chamada quando o mouse é liberado
function mouseReleased() {
  picked = null;
}

// Função principal de desenho do canvas
function draw() {
  background(210);
  translate(viewOffset);
  fill(220);
  noStroke();
  rect(0, 0, width, height);
  fill(255);
  stroke(0);

  nodes.forEach((n) => n.drawBefore());
  nodes.forEach((n) => n.draw());
  nodes.forEach((n) => n.drawAfter());
}

// Função para desenhar uma caixa de texto com o nome do subnó
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

  fill(255);
  rect(boxX, boxY, boxWidth, boxHeight);
  fill(0);
  noStroke();
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], boxX + 8, boxY + 8 + i * textSize());
  }
}

// Função para atualizar o gráfico com base nos inputs de nome e prioridade
function updateGraph() {
  nodes = [];
  const rows = inputs.getTableRows();
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

  const numChairs = inputs.getNumChairs();
  for (let priority in peopleByPriority) {
    let people = peopleByPriority[priority];
    const priorityNodes = [];
    while (people.length > 0) {
      const data = {
        priority: parseInt(priority),
        people: people.splice(0, numChairs),
        conn: [],
      };

      let x, y;
      const newNode = new Node(0, 0, data);
      for (let tries = 20; tries > 0; tries--) {
        if (priorityNodes.length === 0) {
          x = random(nodeRadius, width - nodeRadius);
          y = random(nodeRadius, height - nodeRadius);
        } else {
          let angle = random(0, TWO_PI);
          let rNode = random(priorityNodes);
          x = rNode.pos.x + cos(angle) * 72;
          y = rNode.pos.y + sin(angle) * 72;
        }
        newNode.pos.x = x;
        newNode.pos.y = y;
        let collided = false;
        for (let n of nodes) {
          if (!newNode.isColliding(n)) continue;
          collided = true;
          break;
        }
        if (!collided) break;
      }

      nodes.push(newNode);
      priorityNodes.push(newNode);
    }

    let minX = nodeRadius;
    let minY = nodeRadius;
    let maxX = width - nodeRadius;
    let maxY = height - nodeRadius;
    for (let priorityNode of priorityNodes) {
      if (priorityNode.pos.x < minX) minX = priorityNode.pos.x;
      if (priorityNode.pos.y < minY) minY = priorityNode.pos.y;
      if (priorityNode.pos.x > maxX) maxX = priorityNode.pos.x;
      if (priorityNode.pos.y > maxY) maxY = priorityNode.pos.y;
    }
    priorityNodes.forEach((n) => {
      n.pos.x -= minX - nodeRadius;
      n.pos.y -= minY - nodeRadius;
      n.pos.x -= maxX - (width - nodeRadius);
      n.pos.y -= maxY - (height - nodeRadius);
      n.updateSubNodes();
    });
  }
}
