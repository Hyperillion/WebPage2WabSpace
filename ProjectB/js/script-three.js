console.log("three.js Version: " + THREE.REVISION);

let scene, camera, renderer, container;
// let controls;
let time, frame = 0;
let stats;

function initThree() {
  scene = new THREE.Scene();

  const fov = 95;
  const aspectRatio = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 5000;
  camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
  camera.position.z = 0;
  camera.position.y = -5;
  camera.position.x = -10;
  //make camera look straight at the front
  // camera.lookAt(0, 0, 0);
  // camera.position.z = 0;

  //change camera pivot

  // const pivot = new THREE.Object3D();
  // scene.add(pivot);
  // pivot.add(camera);
  // pivot.position.set(-9, -4, -5);

  // camera.position.z = 0;
  // camera.position.y = 0;
  // camera.position.x = 8;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);

  // controls = new OrbitControls(camera, renderer.domElement);

  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.domElement);

  setupThree(); // *** 

  renderer.setAnimationLoop(animate);
}

function animate() {
  stats.update();
  time = performance.now();
  frame++;

  updateThree(); // ***

  renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});