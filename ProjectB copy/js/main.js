// https://threejs.org/docs/index.html?q=light#api/en/lights/PointLight
// https://threejs.org/docs/index.html?q=phong#api/en/materials/MeshPhongMaterial
let PARAMS = {
  test: false,
  colorA: "#FFFFFF",
  colorB: "#000000",
  curveFactor: 0.5,
  transparent: false,
  depthTest: true,
}
const pane = new Pane();
let light, lightMesh;
let sculpture;
let cameraDirection;
let bear;
// const coefficientTexture = new THREE.TextureLoader().load("./assets/coefficientTexture.png");


//write a custom shader for the material
let inkwashMaterial = new THREE.ShaderMaterial({
  uniforms: {
    colorA: { type: "vec3", value: new THREE.Color(PARAMS.colorA) },
    colorB: { type: "vec3", value: new THREE.Color(PARAMS.colorB) },
    time: { type: "float", value: 0.0 },
    cameraPosition: { type: "vec3", value: new THREE.Vector3() },
    coefficientTexture: { type: "t", value: new THREE.TextureLoader().load("./assets/blank.png", function(texture) {
      texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
      // texture.repeat.set(2, 2);
    })},
    size: { type: "vec2", value: new THREE.Vector2(window.innerWidth/1, window.innerHeight/1) }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vNormal = normal;
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #include <common>

    uniform sampler2D coefficientTexture;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float time;
    uniform float cameraAngle;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform vec3 color;
    uniform vec2 size;

    void main() {
      vec3 displayColor;
      float noise = rand(vPosition.xy);
      vec3 cameraAngle = normalize(cameraPosition - vPosition);
      float angle = dot(normalize(vNormal), cameraAngle);
      displayColor = mix(colorA, colorB, 1.0 - abs(angle));

      // float noisedAngle = abs(angle)+ (noise - 0.5) * 0.08;
      // if (noisedAngle > 0.5) {
      //   displayColor = colorA;
      // } else if (noisedAngle > 0.4) {
      //   displayColor = mix(colorA, colorB, 0.2);
      // } else if (noisedAngle > 0.3) {
      //   displayColor = mix(colorA, colorB, 0.4);
      // } else if (noisedAngle > 0.2) {
      //   displayColor = mix(colorA, colorB, 0.6);
      // } else {
      //   displayColor = colorB;
      // }
      
      vec2 reflectUv = vUv - cameraAngle.xy * 0.5;
      vec4 textureColor = texture2D(coefficientTexture, gl_FragCoord.xy/size.xy);
      float r = clamp(displayColor.r + textureColor.r - 1.0, 0.0, 1.0)+ (rand(vPosition.xz) - 0.5) * 0.01;
      float g = clamp(displayColor.g + textureColor.g - 1.0, 0.0, 1.0)+ (rand(vPosition.xz) - 0.5) * 0.2;
      float b = clamp(displayColor.b + textureColor.b - 1.0, 0.0, 1.0)+ (rand(vPosition.yz) - 0.5) * 0.2;

      if (r > 0.5) {
        r = 0.9;
      } else if (r > 0.4) {
        r = 0.6;
      } else if (r > 0.3) {
        r = 0.2;
      } else if (r > 0.2) {
        r = 0.1;
      } else {
        r = 0.0;
      }

      if (g > 0.4) {
        g = 0.9;
      } else if (g > 0.2) {
        g = 0.75;
      } else if (g > 0.1) {
        g = 0.5;
      } else if (g > 0.05) {
        g = 0.25;
      } else {
        g = 0.0;
      }

      if (b > 0.4) {
        b = 0.9;
      } else if (b > 0.2) {
        b = 0.75;
      } else if (b > 0.1) {
        b = 0.5;
      } else if (b > 0.05) {
        b = 0.25;
      } else {
        b = 0.0;
      }
      // gl_FragColor = vec4( r,  g,  b, 1.0 - r);
      gl_FragColor = vec4(r, r, r, 1.0);
      // gl_FragColor = vec4(displayColor, 1.0);

    }
  `,
  side: THREE.DoubleSide,
  // wireframe: true,
  transparent: PARAMS.transparent,
  depthTest: PARAMS.depthTest,
});

function setupThree() {
  loadOBJ("assets/castle.obj");
  pane.addBinding(PARAMS, "test");
  pane.addBinding(PARAMS, "colorA");
  pane.addBinding(PARAMS, "colorB");
  pane.addBinding(PARAMS, "transparent");
  pane.addBinding(PARAMS, "depthTest");

  // change the background color
  renderer.setClearColor("#aaaaaa");

  // // add ambient light
  // ambiLight = new THREE.AmbientLight("#000000");
  // scene.add(ambiLight);

  // // add point light
  // light = getPointLight("#FFFFFF");
  // scene.add(light);

  // // add a small sphere for the light
  // lightMesh = getBasicSphere();
  // light.add(lightMesh);
  // lightMesh.scale.set(10, 10, 10);

  // add meshes
  const cube1 = getPhongBox();
  cube1.position.set(0, -100, 0);
  cube1.scale.set(200, 100, 200);

  const cube2 = getPhongBox();
  cube2.position.set(0, 100, 0);
  cube2.scale.set(50, 300, 50);

  const ball = getPhongSphere();
  ball.scale.set(100, 100, 100);

  const plane = getPlane();
  plane.position.set(0, 250, 0);
  plane.rotation.x = Math.PI / 2;
  // scene.add(plane);

  const torus = getTorus();
  torus.position.set(0, 250, 0);
  // scene.add(torus);

  sculpture = new THREE.Group();
  scene.add(sculpture);
  // sculpture.add(cube1);
  // sculpture.add(cube2);

  // sculpture.add(plane);
  // sculpture.add(torus);
  // sculpture.add(ball);

  //modify the plane make it a random terrain
  let vertices = plane.geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = noise(vertices[i] * 0.005, vertices[i + 1] * 0.005) * 150;
  }
  plane.material = inkwashMaterial;

}

function updateThree() {
  // let angle = frame * 0.01;
  // let radDist = 500;
  // let x = cos(angle) * radDist;
  // let y = 300;
  // let z = sin(angle) * radDist;
  // light.position.set(x, y, z);

  // updateCameraAngle();
  updateCameraPosition();
  // inkwashMaterial.uniforms.time.value = frame * 0.01;
  inkwashMaterial.transparent = PARAMS.transparent;
  inkwashMaterial.depthTest = PARAMS.depthTest;

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

function getTorus() {
  const geometry = new THREE.TorusGeometry(100, 50, 16, 100);
  const material = inkwashMaterial;
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getPlane() {
  const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(geometry, material);
  return plane;
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

function loadOBJ(filepath) {
  // load .obj file
  const loader = new OBJLoader(); // NOT! THREE.ObjectLoader();

  loader.load(
    // resource URL
    filepath,
    // onLoad callback

    // Here the loaded data is assumed to be an object
    function(obj) {
      // Add the loaded object to the scene
      bear = obj;
      for (let child of bear.children) {
        //child.material = new THREE.MeshBasicMaterial();
        child.material = inkwashMaterial;
      }
      // bear.scale.set(100, 100, 100);
      bear.position.set(100, 100, 100);
      scene.add(bear);
    },

    // onProgress callback
    function(xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function(err) {
      console.error('An error happened');
    }
  );
}