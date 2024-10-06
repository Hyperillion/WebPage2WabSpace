let container;
let camera, renderer;
let controls;
let cube, sphere;

const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc768c3,  // Base color (white in this case)
    emissive: 0xc768c3,  // Color of light emission
    emissiveIntensity: 0.3,  // Intensity of emission
    transparent: true,
    opacity: 0.5,
    transmission: 0.6,
    metalness: 0,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.9
});

const light = new THREE.DirectionalLight(0xffffff, 1);

const scene = new THREE.Scene();


initThree()

function initThree() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    nearClippingPlane = 0.1;
    farClippingPlane = 1000;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('threeContainer');
    container.appendChild(renderer.domElement);
    control = new OrbitControls(camera, renderer.domElement);

    setupThree();
}

function setupThree() {
    scene.background = new THREE.Color(0x007acc);

    camera.position.z = 5;
    cube1 = getCube(1, 1, 1);
    cube1.position.x = -1;
    scene.add(cube1);
    cube2 = getCube(1, 1, 1);
    cube2.position.x = 1;
    scene.add(cube2);

    line = getLine();
    scene.add(line);

    light.position.set(0, 5, 10);
    scene.add(light);
    // sphere = getSphere();
    // scene.add(sphere);
    // sphere.position.z = 5;
    updateThree();
}

function updateThree() {
    // draw();
    renderer.setAnimationLoop(animate);
}

function animate() {
    cube1.position.z += 0.01;
    cube2.position.z += 0.01;
    console.log(line.points[0]);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    // camera.position.z += 0.01;
    // sphere.rotation.z++;
    renderer.render(scene, camera);
}


function getLine() {
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const points = [];
    points.push(new THREE.Vector3(-1, 0, 0));
    // points.push(new THREE.Vector3(0, 1, 0));
    points.push(new THREE.Vector3(1, 0, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    return line;
}

function getCube(width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshNormalMaterial({
        color: 0x00ffff,
        // wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, glassMaterial);
    return mesh;
}

function getSphere() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

class Building {
    constructor() {
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
}


window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});


