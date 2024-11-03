let ui = {
  ParticleNumber: 50000,
  ParticleSize: 1,
  ParticleColor: 0xffffff,
  ParticleOpacity: 1,
}

let params = {
  // (add)
};

const WORLD_SIZE = 500;
let pointCloud;
let particles = [];

function setupThree() {
  pointCloud = getPoints();
  scene.add(pointCloud);

  gui = new dat.GUI();
  gui.add(ui, "ParticleNumber", 10000, 50000, 10000).listen();
  gui.add(ui, "ParticleSize", 1, 10, 1).listen();
  gui.addColor(ui, "ParticleColor").listen();
  gui.add(ui, "ParticleOpacity", 0, 1, 0.1).listen();

}

function updateThree() {

  let posArray = pointCloud.geometry.attributes.position.array;

  for (let i = 0; i < particles.length; i++) {
    particles[i].move();
  }
  //add new particles if needed
  // if (ui.ParticleNumber != posArray.length / 3) {
  //   scene.remove(pointCloud);
  //   pointCloud = getPoints();
  //   scene.add(pointCloud);
  // }


  for (let i = 0; i < ui.ParticleNumber; i++) {
    // let position = p5.Vector.random3D();
    // position.mult(random(WORLD_SIZE));
    posArray[i*3 + 0] += particles[i].pos.x;
    posArray[i*3 + 1] += particles[i].pos.y;
    posArray[i*3 + 2] += particles[i].pos.z;
  }

  pointCloud.material.size = ui.ParticleSize;
  pointCloud.material.color = new THREE.Color(ui.ParticleColor);
  pointCloud.material.opacity = ui.ParticleOpacity;
  pointCloud.geometry.attributes.position.needsUpdate = true;
  pointCloud.geometry.drawRange.count = ui.ParticleNumber;
  // console.log(posArray);
}

function getPoints() {
  const vertices = [];

  for (let i = 0; i < ui.ParticleNumber; i++) {
    let position = p5.Vector.random3D();
    position.mult(random(WORLD_SIZE));
    // vertices.push(position.x, position.y, position.z);
    let particle = new Particle()
      .setPosition(position.x, position.y, position.z)
      .setVelocity(random(-1, 1) * 0.001, random(-1, 1)* 0.001, random(-1, 1)* 0.001)
      // .setScale(random(1, 5))
      // .setMass()
    particles.push(particle);
  }

  for (let i = 0; i < ui.ParticleNumber; i++) {
    let x = sin(i) * WORLD_SIZE;
    let y = cos(i) * WORLD_SIZE;
    let z = sin(random(-1,1)) * WORLD_SIZE;
    vertices.push(x, y, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ 
    color: 0xFFFFFF,
    // sizeAttenuation: false,
    size: ui.ParticleSize,
  });
  const points = new THREE.Points(geometry, material);
  return points;
}


// CLASS
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = 1;
    //this.setMass(); // feel free to use this method; it arbitrarily defines the mass based on the scale.

    this.lifespan = 1.0;
    this.lifeReduction = random(0.001, 0.005);
    this.isDone = false;
  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setVelocity(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setScale(w, h = w, d = w) {
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    return this;
  }
  setMass(mass) {
    if (mass) {
      this.mass = mass;
    } else {
      this.mass = 1 + (this.scl.x * this.scl.y * this.scl.z) * 0.000001; // arbitrary
    }
    return this;
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  adjustVelocity(amount) {
    this.vel.mult(1 + amount);
  }
  applyForce(f) {
    let force = f.copy();
    if (this.mass > 0) {
      force.div(this.mass);
    }
    this.acc.add(force);
  }
  reappear() {
    if (this.pos.z > WORLD_SIZE / 2) {
      this.pos.z = -WORLD_SIZE / 2;
    }
  }
  disappear() {
    if (this.pos.z > WORLD_SIZE / 2) {
      this.isDone = true;
    }
  }
  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  attractedTo(x, y, z) {
    let target = new p5.Vector(x, y, z);
    let force = p5.Vector.sub(target, this.pos);
    if (force.mag() < 100) {
      force.mult(-0.005);
    } else {
      force.mult(0.0001);
    }
    this.applyForce(force);
  }
  flow() {
    let xFreq = this.pos.x * 0.05 + frame * 0.005;
    let yFreq = this.pos.y * 0.05 + frame * 0.005;
    let zFreq = this.pos.z * 0.05 + frame * 0.005;
    let noiseValue = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(cos(frame * 0.005), sin(frame * 0.005), sin(frame * 0.002));
    force.normalize();
    force.mult(noiseValue * 0.01);
    this.applyForce(force);
  }
}