let frame1

function setup() {
    frame1 = createCanvas(640, 480);
    frame1.parent('p5Container');
    background(220);
}

function draw() {
    background(220);
    ellipse(mouseX, mouseY, 50, 50);
    // noLoop();
}