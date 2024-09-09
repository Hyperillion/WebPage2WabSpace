let amount = 3;
let aliveAmount;
let mozz = [];
let hand;
let handsfree;
let sketch;
let handPosition;
let handSize;
let handMarks;
let handGesture;
let prevHandGesture;
let gui;
let ui = {
  TotalMozzies: 10,
  AliveMozzies: 10,
  MozzieSound: true,
  DarkMode: false,
  SeeAttackRange: false,
}
// let handDisplay = true;

function setup() {
  ui.renderWidth = windowWidth;
  ui.renderHeight = windowHeight;

  gui = new dat.GUI();
  gui.add(ui, 'TotalMozzies', 1, 20).step(1).listen();
  gui.add(ui, 'AliveMozzies', 1, 20).step(1).listen();
  gui.add(ui, 'MozzieSound').listen();
  gui.add(ui, 'DarkMode').listen();
  gui.add(ui, 'SeeAttackRange').listen();


  mozzSound = createAudio('./assets/mozz.mp3');
  mozzSound.loop = true;
  sketch = createCanvas(windowWidth, windowHeight);
  // hand = new Hand();
  aliveAmount = amount;
  for (i = 0; i < amount; i++) {
    mozz[i] = new Mozzie(
      random(windowWidth),
      random(windowHeight),
      random(1, 2)
      // 100,100,2
    );
  }

  handsfree = new Handsfree({
    // showDebug: true,
    hands: true,
    maxNumHands: 1,
    minDetectionConfidence: 0.5,
  })
  // handsfree.enablePlugins('browser');
  handsfree.plugin.pinchScroll.disable();
  //generated gesture model
  handsfree.useGesture({
    "name": "kill",
    "algorithm": "fingerpose",
    "models": "hands",
    "confidence": "5",
    "description": [
      [
        "addCurl",
        "Thumb",
        "HalfCurl",
        1
      ],
      [
        "addCurl",
        "Thumb",
        "NoCurl",
        0.07142857142857142
      ],
      [
        "addDirection",
        "Thumb",
        "DiagonalUpRight",
        0.9166666666666666
      ],
      [
        "addDirection",
        "Thumb",
        "VerticalUp",
        0.5
      ],
      [
        "addDirection",
        "Thumb",
        "DiagonalUpLeft",
        1
      ],
      [
        "addDirection",
        "Thumb",
        "HorizontalLeft",
        0.08333333333333333
      ],
      [
        "addCurl",
        "Index",
        "FullCurl",
        1
      ],
      [
        "addCurl",
        "Index",
        "HalfCurl",
        0.20833333333333334
      ],
      [
        "addCurl",
        "Index",
        "NoCurl",
        0.041666666666666664
      ],
      [
        "addDirection",
        "Index",
        "HorizontalRight",
        0.8
      ],
      [
        "addDirection",
        "Index",
        "DiagonalUpRight",
        1
      ],
      [
        "addDirection",
        "Index",
        "VerticalUp",
        0.6
      ],
      [
        "addDirection",
        "Index",
        "DiagonalUpLeft",
        0.6
      ],
      [
        "addCurl",
        "Middle",
        "FullCurl",
        1
      ],
      [
        "addCurl",
        "Middle",
        "NoCurl",
        0.03571428571428571
      ],
      [
        "addCurl",
        "Middle",
        "HalfCurl",
        0.03571428571428571
      ],
      [
        "addDirection",
        "Middle",
        "DiagonalUpRight",
        1
      ],
      [
        "addDirection",
        "Middle",
        "VerticalUp",
        0.5
      ],
      [
        "addDirection",
        "Middle",
        "DiagonalUpLeft",
        0.9
      ],
      [
        "addDirection",
        "Middle",
        "HorizontalRight",
        0.6
      ],
      [
        "addCurl",
        "Ring",
        "FullCurl",
        1
      ],
      [
        "addCurl",
        "Ring",
        "NoCurl",
        0.03571428571428571
      ],
      [
        "addCurl",
        "Ring",
        "HalfCurl",
        0.03571428571428571
      ],
      [
        "addDirection",
        "Ring",
        "DiagonalUpRight",
        1
      ],
      [
        "addDirection",
        "Ring",
        "VerticalUp",
        0.6363636363636364
      ],
      [
        "addDirection",
        "Ring",
        "DiagonalUpLeft",
        0.8181818181818182
      ],
      [
        "addDirection",
        "Ring",
        "HorizontalRight",
        0.2727272727272727
      ],
      [
        "addCurl",
        "Pinky",
        "FullCurl",
        1
      ],
      [
        "addCurl",
        "Pinky",
        "HalfCurl",
        0.1111111111111111
      ],
      [
        "addDirection",
        "Pinky",
        "DiagonalUpRight",
        0.9166666666666666
      ],
      [
        "addDirection",
        "Pinky",
        "VerticalUp",
        0.4166666666666667
      ],
      [
        "addDirection",
        "Pinky",
        "DiagonalUpLeft",
        1
      ],
      [
        "addDirection",
        "Pinky",
        "HorizontalLeft",
        0.08333333333333333
      ],
      [
        "addDirection",
        "Pinky",
        "HorizontalRight",
        0.08333333333333333
      ]
    ],
    "enabled": true
  })
  handsfree.start();
}

function draw() {
  background(ui.DarkMode ? 0 : 255);

  getHandData();
  drawHands();

  for (i = 0; i < amount; i++) {
    mozz[i].display();
    mozz[i].update();
    mozz[i].attract();
  }
  killMoz()

  generateMozz();

  updateUI();
  // text(aliveAmount, 100, 100);
}

function updateUI() {
  ui.AliveMozzies = aliveAmount;
  ui.TotalMozzies = amount;
  // ui.MozzieSound = mozzSound;
}

function generateMozz() {
  if (random(1) < 0.005 && aliveAmount < 5) {
    mozz.push(
      new Mozzie(
        random(windowWidth),
        random(windowHeight),
        random(1, 2)
      ));
    amount++;
    aliveAmount++;
  }
}

function getHandData() {
  const handData = handsfree.data?.hands;
  if (!handData) return;
  handMarks = handData.multiHandLandmarks;
  const gesture = handData.gesture?.[0];
  if (!gesture) return;
  prevHandGesture = handGesture;
  handGesture = gesture.name;
  const handmark = handMarks[0];
  if (!handmark) return;
  handPosition = createVector(sketch.width - handmark[9].x * sketch.width, handmark[9].y * sketch.height);
  handSize = dist(handmark[21].x * sketch.width, handmark[21].y * sketch.height, handmark[5].x * sketch.width, handmark[5].y * sketch.height);
  // text(handSize, 100, 100);
}

function killMoz() {
  // console.log(handGesture);
  if (handGesture == "kill" && prevHandGesture != "kill") {
    for (i = 0; i < amount; i++) {
      if (mozz[i].pos.dist(handPosition) < handSize && mozz[i].alive) {
        mozz[i].alive = false;
        // mozz.splice(i, 1);
        aliveAmount--;
      }
      else if (mozz[i].pos.dist(handPosition) < handSize * 4 && mozz[i].alive) {

        mozz[i].vel.add(p5.Vector.sub(mozz[i].pos, handPosition).mult(0.3));
      }
    }
  }
}

function drawHands() {
  // const handData = handsfree.data?.hands;
  if (!handMarks) return;

  //draw circle at each hand position
  handMarks.forEach((landmark, index) => {

    firstHandmark = handMarks[0];
    // console.log(index, firstHandmark);
    // beginShape();
    // landmark.forEach((point, index) => {
    //   // circle(sketch.width - point.x * sketch.width, point.y * sketch.height, 10);
    //   curveVertex(sketch.width - point.x * sketch.width, point.y * sketch.height);
    // });
    // endShape(CLOSE);

    let handPoints = [1, 2, 3, 4, 3, 2, 5, 6, 7, 8, 7, 6, 5, 9, 10, 11, 12, 11, 10, 9, 13, 14, 15, 16, 15, 14, 13, 17, 18, 19, 20, 19, 18, 17, 0];
    let palmPoints = [0, 1, 5, 9, 13, 17, 0];
    let fingerPoints = [
      [1, 2, 3, 4],   // Thumb
      [5, 6, 7, 8],      // Index finger
      [9, 10, 11, 12],   // Middle finger
      [13, 14, 15, 16],  // Ring finger
      [17, 18, 19, 20],  // Pinky finger
    ];
    // console.log(hand);
    push();

    strokeWeight(10);
    strokeCap(ROUND);
    stroke(ui.DarkMode ? 200 : 0);
    fill(ui.DarkMode ? 100 : 200);

    // handPoints.forEach((index) => {
    //   const point = landmark[index];
    //   // circle(sketch.width - point.x * sketch.width, point.y * sketch.height, 10);
    //   circle(sketch.width - point.x * sketch.width, point.y * sketch.height, 20);
    // });

    mappedHand = map(handPosition.x, 0, sketch.width, sketch.width / 4, sketch.width * 3 / 4);

    beginShape();
    curveVertex(mappedHand + 50, sketch.height);
    curveVertex(mappedHand + 50, sketch.height);
    handPoints.forEach((index) => {
      const point = firstHandmark[index];
      // circle(sketch.width - point.x * sketch.width, point.y * sketch.height, 10);
      curveVertex(sketch.width - point.x * sketch.width, point.y * sketch.height);
    });
    curveVertex(mappedHand - 50, sketch.height);
    curveVertex(mappedHand - 50, sketch.height);
    endShape();


    // beginShape();
    // palmPoints.forEach((index) => {
    //   const point = landmark[index];
    //   // circle(sketch.width - point.x * sketch.width, point.y * sketch.height, 10);
    //   curveVertex(sketch.width - point.x * sketch.width, point.y * sketch.height);
    // });
    // endShape(CLOSE);



    // fingerPoints.forEach((finger) => {
    //   beginShape();
    //   finger.forEach((index) => {
    //     const point = landmark[index];
    //     // circle(sketch.width - point.x * sketch.width, point.y * sketch.height, 10);
    //     curveVertex(sketch.width - point.x * sketch.width, point.y * sketch.height);
    //   });
    //   endShape(CLOSE);
    // });
    if (ui.SeeAttackRange) {
      push();
      noStroke();
      fill(255, 0, 0, 50);
      circle(handPosition.x, handPosition.y, handSize * 2);
      pop();
    }
    pop();
  })
}

function mousePressed() {
}

class Mozzie {
  constructor(x, y, size) {
    if (ui.MozzieSound) {
      this.mozzSound = createAudio('./assets/mozz.mp3');
      this.mozzSound.loop(true);
      this.mozzSound.volume(0.2);
      this.mozzSound.play();
    }
    this.mozzSoundOn = ui.MozzieSound;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.status = 0;//0 means in the canvas, 1 means out of the canvas
    this.size = size;
    this.wingSpeed = 0;
    this.eyeSpeed = 0
    this.alive = true;
    this.rotate = 0;
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
    rotate(this.rotate);

    fill(180, 150, 214);
    ellipse(21, 1, 25, 10);//body

    this.drawLegs();//legs
    this.drawWings();//wings

    fill(145, 100, 200);
    circle(7, 1.5, 10);//head
    fill(255);
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
    fill(255, 10, 10);
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
    stroke(100);
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

    noStroke();
    fill(180, 200);
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
    if (!handMarks) return;
    //get hand position
    const handmark = handMarks[0];
    if (!handmark) return;
    handPosition = createVector(sketch.width - handmark[21].x * sketch.width, handmark[21].y * sketch.height);
    let target = handPosition.copy();
    let force = p5.Vector.sub(target, this.pos);
    let d = force.mag();
    force.normalize();
    force.mult(0.1);
    this.vel.add(force);
    //apply friction to the object
    this.vel.mult(0.99);
  }

  update() {
    if (!this.alive) {
      if (this.mozzSoundOn) {
        this.mozzSound.stop();
      }
      this.rotate = PI;
      this.pos.y = lerp(this.pos.y, windowHeight, 0.1);
      // aliveAmount --;
    } else {
      // mozzSound.play();
      this.hitwall();
      this.wingSpeed = sin(frameCount);
      this.eyeSpeed = sin(frameCount / 10);
      // this.wingSpeed = sin(frameCount);
      this.randomMove();
      // this.attract();
      this.pos.add(this.vel);
    }
  }
}