let frame1;
let amount = 1000;
let things = [];
let globalGravity = 10;
let ui = {
  space: 30,
  diameter: 50
}

function setup() {
  frameRate(60);
  frame1 = createCanvas(windowWidth, windowHeight);

  gui = new dat.GUI();
  gui.add(ui, 'space', 1, 200).step(1).listen();
  gui.add(ui, 'diameter', 1, 1000).step(1).listen();

  for (let i = 0; i < amount; i++) {
    things.push(new Thing(
      random(windowWidth),
      random(windowHeight),
      10
    ));
  }
}

function draw() {
  background(0);

  for (let j = 0; j < things.length; j++) {
    things[j].update();
    things[j].display();
  }
}

function smoothCurve(radius, dst) {
  let volume = PI * (radius ** 8) / 4;
  let value = max(0, radius * radius - dst * dst);
  return (value ** 3 / volume).toFixed(2); // 限制为两位小数
}

function calculateDensity() {
  let density = 0;
  let mass = 1;
  for (let i = 0; i < things.length; i++) {
    density += mass * parseFloat(smoothCurve(ui.diameter, dist(things[i].pos.x, things[i].pos.y, 400, 400)));
  }
  return density.toFixed(2); // 限制为两位小数
}

class Thing {
  constructor(posX, posY, size) {
    this.pos = createVector(posX, posY);
    this.size = size;
    this.vel = createVector();
    this.acc = createVector();
    this.bounceCut = 0.9;
    this.density = 0;
    this.mass = 1;
  }

  display() {
    push();
    fill(255 * this.density * 300, 0, 200);
    stroke(255);
    translate(this.pos.x, this.pos.y);

    circle(0, 0, this.size);
    pop();
  }

  gravity() {
    this.applyForce(createVector(0, globalGravity));
  }

  bounce() {
    if (this.pos.y >= windowHeight - this.size) {
      this.pos.y = windowHeight - this.size;
      if (this.vel.y >= 0) {
        this.vel.y *= -1 * this.bounceCut;
      }
    }
    if (this.pos.x >= windowWidth - this.size / 2) {
      this.pos.x = windowWidth - this.size / 2;
      if (this.vel.x >= 0) {
        this.vel.x *= -1 * this.bounceCut;
      }
    }
    if (this.pos.x <= this.size / 2) {
      this.pos.x = 0 + this.size / 2;
      if (this.vel.x <= 0) {
        this.vel.x *= -1 * this.bounceCut;
      }
    }
  }

  calculateDensity() {
    this.density = 0;
    for (let i = 0; i < things.length; i++) {
      this.density += this.mass * parseFloat(smoothCurve(ui.diameter, dist(things[i].pos.x, things[i].pos.y, 400, 400)));
    }
    return this.density.toFixed(2); // 限制为两位小数
  }

  update() {
    this.gravity();
    this.bounce();
    this.calculateDensity();
    this.updatePosition();
  }

  updatePosition() {
    this.vel.add(this.acc);
    this.pos.add(this.vel.mult(0.99));
    this.acc.mult(0); // 重置加速度
  }

  applyForce(force) {
    this.acc.add(force);
  }
}
