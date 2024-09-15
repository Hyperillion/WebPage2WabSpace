let frame1;
let amount = 300;
let particles = [];
let scale = 0.002;
let img;
let ui = {
  moveBG: false,
  amount: 300,
  southEarth: false,
}



function setup() {
  frame1 = createCanvas(windowWidth, windowHeight);
  img = noiseImage();
  ui.amount = frame1.height;
  let gui = new dat.GUI();
  gui.add(ui, 'moveBG').listen();
  gui.add(ui, 'amount', 0, 2000).listen();
  gui.add(ui, 'southEarth').listen();
  // drawNoiseImage();
  // image(img, 0, 0);
  for (let i = 0; i < ui.amount; i++) {
    particles[i] = new Particle(
      random(frame1.width),
      random(frame1.height),
      3,
      random(100, 500)
    );
  }
  // for (let i = 0; i < wBlockNum * hBlockNum; i++) {
  //   fields[i] = new Field(
  //     (i % wBlockNum) * blockSize + blockSize / 2,
  //     floor(i / wBlockNum) * blockSize + blockSize / 2,
  //     blockSize
  //   );
  // }

}

function draw() {
  // background(0, 10);

  tint(255, 50);
  // img = noiseImage();
  image(img, 0, 0);
  // if (mouseIsPressed){
  // text(pow(noise(mouseX * scale, mouseY * scale) + 0.1, 3) * 500, mouseX, mouseY);
  // }
  while (particles.length < ui.amount) {
    particles.push(new Particle(
      random(frame1.width),
      random(frame1.height),
      3,
      random(100, 500)
    ));
  }

  for (let i = 0; i < ui.amount; i++) {
    if (particles[i].isAlive()) {
      particles[i].update();
      particles[i].display();
    }
    else {
      particles[i] = new Particle(
       random(frame1.width),
        random(frame1.height),
        3,
        random(100, 500)
      );
    }
  }
  // text(pow(-noise(mouseX * scale, mouseY * scale), 2) * 360, mouseX, mouseY);
}


function noiseImage() {
  let noiseImg = createImage(frame1.width, frame1.height);
  noiseImg.loadPixels();
  for (let i = 0; i < frame1.width; i++) {
    for (let j = 0; j < frame1.height; j++) {
      let c = pow(noise(i * scale, j * scale, frameCount * 0.01), 2) * 400;
      noiseImg.pixels[(i+j*noiseImg.width)*4] = 255 - c;
      noiseImg.pixels[(i+j*noiseImg.width)*4+1] = c/2;
      noiseImg.pixels[(i+j*noiseImg.width)*4+2] = c*2;
      noiseImg.pixels[(i+j*noiseImg.width)*4+3] = 255;
    }
  }
  noiseImg.updatePixels();
  return noiseImg;
}

function drawNoiseImage() {
  // let noiseImg = createImage(windowWidth, windowHeight);
  // noiseImg.loadPixels();
  for (let i = 0; i < frame1.width; i++) {
    for (let j = 0; j < frame1.height; j++) {
      let c = pow(noise(i * scale, j * scale), 2) * 360;
      push();
      colorMode(HSL);
      stroke(c%360, 100, 50, 1);
      point(i, j);
      pop()
    }
  }
  // noiseImg.updatePixels();
  // return noiseImg;
}


class Particle {
  constructor(posX, posY, size, lifespan) {
    this.pos = createVector(posX, posY);
    this.size = size;
    this.speed = createVector();
    this.alive = true;
    this.lifecount = 0;
    this.lifespan = lifespan
    this.hue = pow(-noise(this.pos.x * scale, this.pos.y * scale), 2) * 360;
    this.close = this.hue
  }

  display() {
    push()
    // colorMode(HSL);
    translate(this.pos.x, this.pos.y);
    fill(255);
    // fill(this.hue, 100, 50, 1- (this.hue%360)/360);
    noStroke();
    circle(0, 0, this.size);
    pop();
  }

  calDirection(x, y) {
    let interval = 0.1;
    // if (ui.moveBG) {
    //   let x1 = noise(x + interval, y, frameCount * 0.01);
    //   let x2 = noise(x - interval, y, frameCount * 0.01);
    //   let y1 = noise(x, y + interval, frameCount * 0.01);
    //   let y2 = noise(x, y - interval, frameCount * 0.01);
    // }
    // else{
      let x1 = noise(x + interval, y);
      let x2 = noise(x - interval, y);
      let y1 = noise(x, y + interval);
      let y2 = noise(x, y - interval);
    // }


    let dx = (x1 - x2)/ (2 * interval);
    let dy = (y1 - y2)/ (2 * interval);

    return createVector(dx, dy);
  }

  update() {
    if (ui.southEarth) {
      this.speed = this.calDirection(this.pos.x * scale, this.pos.y * scale).rotate(-PI/3);
    }else{
      this.speed = this.calDirection(this.pos.x * scale, this.pos.y * scale).rotate(PI/3);
    }
    this.pos.add(this.speed.mult(5));
    this.lifecount++;
    // console.log(this.speed.mag());
  }

  isAlive() {
    if (this.pos.x < 0 || this.pos.x > frame1.width || this.pos.y < 0 || this.pos.y > frame1.height) {
      return false;
    }
    if (this.lifecount > 10 && this.speed.mag() < 0.3) {
      return false;
    }
    return true;
  }
}
