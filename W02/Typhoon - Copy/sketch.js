let frame1;
let amount = 1000;
let particles = [];
let fields = [];
let wBlockNum = 20;
let hBlockNum;
let blockSize;

function setup() {
  frame1 = createCanvas(windowWidth, windowHeight);
  blockSize = frame1.width / wBlockNum;
  hBlockNum = ceil(frame1.height / blockSize);
  for (let i = 0; i < amount; i++) {
    particles[i] = new Particle(
      random(windowWidth),
      random(windowHeight),
      random(5)
    );
  }
  // for (let i = 0; i < wBlockNum * hBlockNum; i++) {
  //   fields[i] = new Field(
  //     (i % wBlockNum) * blockSize + blockSize / 2,
  //     floor(i / wBlockNum) * blockSize + blockSize / 2,
  //     blockSize
  //   );
  // }
  for (let i = 0; i < wBlockNum; i++) {
    for (let j = 0; j < hBlockNum; j++) {
      fields.push(new Field(
        i,
        j,
        blockSize
      ));
    }
  }
}

function draw() {

  // text(mouseX, 0, 0);
  for (let j = 0; j < fields.length; j++) {
    fields[j].update(j);
    fields[j].display();
  }
  background(255, 1);
  for (let i = 0; i < amount; i++) {
    if (particles[i].isAlive()) {
      particles[i].update();
      particles[i].display();
    }
    else {
      particles[i] = new Particle(
       random(windowWidth),
        random(windowHeight),
        random(5)
      );
    }
  }
}


class Field {
  constructor(w, h, size) {
    this.pos = createVector(w * blockSize + blockSize / 2, h * blockSize + blockSize / 2);
    this.vector = createVector();
    this.size = size;
    this.num = createVector(w, h);
    this.FREQ_POS = 0.01;
    this.FREQ_SPD = 0.01;
    this.fieldNum = wBlockNum * this.num.y + this.num.x;
  }

  update(i) {
    let xFreq = this.pos.x * this.FREQ_POS + 1 * this.FREQ_SPD;
    let yFreq = this.pos.y * this.FREQ_POS + 1 * this.FREQ_SPD;
    let noiseValue = noise(xFreq, yFreq);
    let angle = map(noiseValue, 0, 1, 0, TWO_PI);
    this.vector = createVector(xFreq * 2 - 1, yFreq * 2 - 1).normalize();
    this.vector = p5.Vector.fromAngle(angle);
    // this.vector = createVector(noise(frameCount / 100 + i) * 2 - 1, noise(frameCount / 100 + i + 1) * 2 - 1).normalize();
  }

  display() {
    push();
    rectMode(CENTER);
    translate(this.pos.x, this.pos.y);
    // circle(0, 0, 5);
    rect(0, 0, this.size, this.size);
    line(0, 0, this.vector.x * this.size / 2, this.vector.y * this.size / 2);
    text(wBlockNum * this.num.y + this.num.x, 0, 0);
    pop();
  }
}


class Particle {
  constructor(posX, posY, size) {
    this.pos = createVector(posX, posY);
    this.size = size;
    this.speed = createVector();
    this.alive = true;
  }

  display() {
    push()
    translate(this.pos.x, this.pos.y);
    fill(0);
    noStroke();
    circle(0, 0, this.size);
    pop();
  }

  update() {
    this.field = this.currentField();
    if (this.field == undefined) {
      return;
    }
    text(this.field.fieldNum, this.pos.x, this.pos.y);
    let force = this.field.vector.copy();
    force.mult(1);
    this.speed=force;
    this.pos.add(this.speed);
  }

  currentField() {
    let x = floor(this.pos.x / blockSize);
    let y = floor(this.pos.y / blockSize);
    if (x < 0 || x > wBlockNum || y < 0 || y > hBlockNum) {
      return fields[-1];
    }
    return fields[y + x * (wBlockNum + 1)];
  }


  isAlive() {
    if (this.pos.x < 0 || this.pos.x > windowWidth || this.pos.y < 0 || this.pos.y > windowHeight) {
      return false;
    }
    return true;
  }
}
