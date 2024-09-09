let amount = 10;
let mozz = [];
let hand;
let handsfree;
let sketch;
// let handDisplay = true;

function setup() {
  sketch = createCanvas(windowWidth, windowHeight);
  // hand = new Hand();
  for (i = 0; i < amount; i++) {
    mozz[i] = new Mozzie(
      random(windowWidth),
      random(windowHeight),
      random(1, 2)
      // 100,100,2
    );
  }

  // handsfree = new Handsfree({
  //   // showDebug: true,
  //   hands: true,
  //   maxNumHands: 2,
  //   minDetectionConfidence: 0.5,
  // })
  // // handsfree.enablePlugins('browser');
  // handsfree.plugin.pinchScroll.disable();
  // handsfree.start();
}

function draw() {
  background(200);

  // hand.update();

  // drawHands()


  // if (handDisplay) {
  //   hand.display();
  // }

  for (i = 0; i < amount; i++) {
    mozz[i].display();
    mozz[i].update();
    // if (mouseIsPressed){
    //   // for (i = 0; i < amount; i++) {
    //     mozz[i].attract();
    //   // }
    //   text((mouseX - 100) / 10 + " " + (mouseY - 100) / 10, 10, 10);//mouse position
    // }    
    mozz[i].attract();
  }

}

// function drawHands() {
//   const handData = handsfree.data?.hands;
//   if (!handData) return;

//   //draw circle at each hand position
//   handData.multiHandLandmarks.forEach((landmark, index) => {
//     console.log(landmark);
//     landmark.forEach((point, index) => {
//       circle(sketch.width - point.x * sketch.width, point.y * sketch.height, 10);
//     });
//   })
// }

function mousePressed() {
  // if (handDisplay) {
  //   handDisplay = false;
  // } else {
  //   handDisplay = true;
  // }

}

class Hand {
  constructor() {
    this.pos = createVector(mouseX, mouseY);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    fill(255, 0, 0);
    ellipse(0, 0, 20, 20);
    pop();
  }

  update() {
    this.pos.x = lerp(this.pos.x, mouseX, 0.2);
    this.pos.y = lerp(this.pos.y, mouseY, 0.2);
  }
}


class Mozzie {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.status = 0;//0 means in the canvas, 1 means out of the canvas
    this.size = size;
    this.wingSpeed = 0;
    this.eyeSpeed = 0
  }

  display() {
    push();
    strokeWeight(0.5);
    translate(this.pos.x, this.pos.y);
    scale(this.size);
    if (this.vel.x > 0) {
      translate(40, 0);
      scale(-1, 1);
    }

    ellipse(21, 1, 25, 10);//body

    this.drawLegs();//legs
    this.drawWings();//wings

    circle(7, 1.5, 10);//head
    circle(0, 0, 10);//left eye
    circle(14, 3, 12);//right eye

    noFill();
    //left eyeline
    curve(5, -10, -2.6, -4.4, 5, 0, 10, -10);
    curve(3, -9, -4.3, -2.7, 4.5, 2, 8, -9);
    //right eyeline
    curve(5, -10, 8.5, 0.3, 19.2, 0, 20, -10);
    curve(3, -9, 8, 2.5, 20, 2., 8, -9);

    fill(0);
    circle(1 + this.eyeSpeed, 0 + this.eyeSpeed * 0.4, 1) //left eyeball
    circle(12 + this.eyeSpeed, 2 + this.eyeSpeed * 0.1, 1.3) //right eyeball

    //mouse
    push();
    strokeWeight(0.3);
    fill(200);
    beginShape();
    curveVertex(5, 5.3);
    curveVertex(5, 5.3);
    curveVertex(0, 20);
    curveVertex(6, 5.6);
    curveVertex(6, 5.6);
    endShape();
    pop();

    pop();
  }

  drawLegs() {
    //draw legs
    push()

    noFill();
    //leg2
    beginShape();
    curveVertex(13, 3);
    curveVertex(13, 3);
    curveVertex(20, 4);
    curveVertex(20, 16);
    curveVertex(25, 23);
    curveVertex(25, 23);
    endShape();

    //leg3
    push();
    scale(0.9);
    translate(30, 0);
    rotate(-PI / 9);
    beginShape();
    curveVertex(0, 5);
    curveVertex(0, 5);
    curveVertex(0 + this.eyeSpeed * 0.1, 16);
    curveVertex(5 + this.eyeSpeed * 0.1, 23);
    curveVertex(5 + this.eyeSpeed * 0.1, 23);
    endShape();
    pop();

    //leg1
    push();
    scale(-1, 0.8);
    translate(-15, 0);
    rotate(-PI / 10);
    beginShape();
    curveVertex(0, 5);
    curveVertex(0, 5);
    curveVertex(0, 16);
    curveVertex(5, 23);
    curveVertex(5, 23);
    endShape();
    pop();
    pop();
  }

  drawWings() {
    //draw wings
    push()
    //right wing

    beginShape();
    curveVertex(19, 0);
    curveVertex(19, 0);
    curveVertex(30, 17 * this.wingSpeed);
    curveVertex(33.4, 17.8 * this.wingSpeed);
    curveVertex(33.1, 9 * this.wingSpeed);
    curveVertex(25.7, 2.1 * this.wingSpeed);
    curveVertex(22, 0);
    curveVertex(22, 0);
    endShape();

    //left wing
    scale(-1, 0.7);
    translate(-33, 0);
    beginShape();
    curveVertex(19, 0);
    curveVertex(19, 0);
    curveVertex(30, 17 * this.wingSpeed);
    curveVertex(33.4, 17.8 * this.wingSpeed);
    curveVertex(33.1, 9 * this.wingSpeed);
    curveVertex(25.7, 2.1 * this.wingSpeed);
    curveVertex(22, 0);
    curveVertex(22, 0);
    endShape();
    pop()
  }

  checkStatus() {
    if (this.pos.x > windowWidth || this.pos.x < 0 || this.pos.y > windowHeight || this.pos.y < 0) {
      this.status = 1;
    }
  }

  hitwall() {
    if (this.pos.x > windowWidth - 50) {
      this.pos.x = windowWidth - 50;
      this.vel.x = -this.vel.x / 10;
    }
    if (this.pos.x < 0) {
      this.pos.x = 0;
      this.vel.x = -this.vel.x / 10;
    }
    if (this.pos.y > windowHeight - 50) {
      this.pos.y = windowHeight - 50;
      this.vel.y = -this.vel.y / 10;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.vel.y = -this.vel.y / 10;
    }
  }

  randomMove() {
    this.vel.add(p5.Vector.random2D().mult(0.2));
  }

  attract() {
    let target = createVector(mouseX, mouseY);
    let force = p5.Vector.sub(target, this.pos);
    let d = force.mag();
    force.normalize();
    force.mult(0.05);
    this.vel.add(force);
  }

  update() {
    this.hitwall();
    this.wingSpeed = sin(frameCount);
    this.eyeSpeed = sin(frameCount / 10);
    // this.wingSpeed = sin(frameCount);
    this.randomMove();
    // this.attract();
    this.pos.add(this.vel);
  }
}
