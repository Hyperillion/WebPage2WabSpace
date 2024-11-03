// https://threejs.org/docs/index.html?q=light#api/en/lights/PointLight
// https://threejs.org/docs/index.html?q=phong#api/en/materials/MeshPhongMaterial
let PARAMS = {
  test: false,
  colorA: "#FFFFFF",
  colorB: "#000000",
  curveFactor: 0.5,
}
const pane = new Pane();
let light, lightMesh;
let sculpture;
let cameraDirection;



//write a custom shader for the material
let inkwashMaterial = new THREE.ShaderMaterial({
  uniforms: {
    colorA: { type: "vec3", value: new THREE.Color(PARAMS.colorA) },
    colorB: { type: "vec3", value: new THREE.Color(PARAMS.colorB) },
    time: { type: "float", value: 0.0 },
    cameraPosition: { type: "vec3", value: new THREE.Vector3() },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normal;
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float time;
    uniform float cameraAngle;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 color;
    void main() {
      vec3 displayColor;
      //display color according to the angle between the camera direction and the normal of the surface
      //calculate the vector of camera position to the pixel position
      vec3 cameraAngle = cameraPosition - vPosition;
      float angle = dot(normalize(vNormal), normalize(cameraAngle));
      //grade the angle into 5 levels, and each level has a different color from pure white to pure black
      if (angle > 0.4) {
        displayColor = colorA;
      } else if (angle > 0.3) {
        displayColor = mix(colorA, colorB, 0.2);
      } else if (angle > 0.2) {
        displayColor = mix(colorA, colorB, 0.4);
      } else if (angle > 0.1) {
        displayColor = mix(colorA, colorB, 0.6);
      } else {
        displayColor = colorB;
      }
      // displayColor = mix(colorB, colorA, abs(angle));
      gl_FragColor = vec4(displayColor, 1);
    }
  `
});

function setupThree() {
  pane.addBinding(PARAMS, "test");
  pane.addBinding(PARAMS, "colorA");
  pane.addBinding(PARAMS, "colorB");

  // change the background color
  renderer.setClearColor("#aaaaaa");

  // add ambient light
  ambiLight = new THREE.AmbientLight("#000000");
  scene.add(ambiLight);

  // add point light
  light = getPointLight("#FFFFFF");
  scene.add(light);

  // add a small sphere for the light
  lightMesh = getBasicSphere();
  light.add(lightMesh);
  lightMesh.scale.set(10, 10, 10);

  // add meshes
  const cube1 = getPhongBox();
  cube1.position.set(0, -100, 0);
  cube1.scale.set(200, 100, 200);

  const cube2 = getPhongBox();
  cube2.position.set(0, 100, 0);
  cube2.scale.set(50, 300, 50);

  const ball = getPhongSphere();
  ball.scale.set(100, 100, 100);
  // change color
  // ball.material.color.set("#00FF00");
  // change transparency
  ball.material.transparent = true;
  ball.material.opacity = 0.75;

  sculpture = new THREE.Group();
  scene.add(sculpture);
  sculpture.add(cube1);
  sculpture.add(cube2);
  sculpture.add(ball);
}

function updateThree() {
  let angle = frame * 0.01;
  let radDist = 500;
  let x = cos(angle) * radDist;
  let y = 300;
  let z = sin(angle) * radDist;
  light.position.set(x, y, z);

  // updateCameraAngle();
  updateCameraPosition();
  // inkwashMaterial.uniforms.time.value = frame * 0.01;

  pane.refresh();
  if (PARAMS.test) {
    test();
  }
}

function test() {
  // console.log("test");
  // console.log(inkwashMaterial.uniforms.cameraAngle.value = camera.rotation.x);
  console.log(PARAMS.colorA);
  console.log(cameraDirection);



  // PARAMS.test = false;
}

function mousePressed() {

}

function updateCameraAngle() {
  //calculate the vector of current camera direction
  cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  //draw a line in the center of the world that represents the camera direction
  let lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setFromPoints([cameraDirection, new THREE.Vector3(0, 0, 0)]);
  let lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
  let line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);
  // inkwashMaterial.uniforms.cameraAngle.value = camera.rotation.x;
}

function updateCameraPosition() {
  inkwashMaterial.uniforms.cameraPosition.value = camera.position;
}

function getPhongBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshPhongMaterial({
  //   color: "#999999",
  //   shininess: 100
  // });
  const material = inkwashMaterial;
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getPhongSphere() {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  // const material = new THREE.MeshPhongMaterial({
  //   color: "#999999",
  //   shininess: 100
  // });
  const material = inkwashMaterial;
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getBasicSphere() {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: "#ffffff"
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getPointLight(color) {
  const light = new THREE.PointLight(color, 2, 0, 0.1); // ( color , intensity, distance (0=infinite), decay )
  return light;
}