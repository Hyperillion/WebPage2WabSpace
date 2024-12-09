// https://threejs.org/docs/index.html?q=light#api/en/lights/PointLight
// https://threejs.org/docs/index.html?q=phong#api/en/materials/MeshPhongMaterial
let PARAMS = {
  test: false,
  colorA: "#FFFFFF",
  colorB: "#000000",
  curveFactor: 0.5,
  transparent: false,
  depthTest: true,
  colorNoise: true,
  wireframe: false,
  fogColor: "#bababa",
  fog: true,
  frame: frame,
  mountainHeight: 0,
  fov: 75,
}
const pane = new Pane();
let controls;
const WORLD_HALF = 1000;
let light, lightMesh;
let sculpture;
let cameraDirection = new THREE.Vector3();
let cameraHeading = new THREE.Vector2();
let bear;
// const coefficientTexture = new THREE.TextureLoader().load("./assets/coefficientTexture.png");
let room, roomShadow;
let plane;
let globalXoffset = 0;
let globalYoffset = 0;
let images = [];
let imageGrp;
let movementSpeed = 0.1;
let sceneGroup = new THREE.Group();

let panemesh, panecontainer;
let hand1, hand2;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
const handModels = {
  left: null,
  right: null
};
let raycaster;
const intersected = [];
let tasksGroup = new THREE.Group();
let tasks = [];

let doneTasks = 0;
let waterHeight = 0;
let waterTargetHeight = 0;
let blackHeight = 0;
let blackTargetHeight = 0;

let mappedColorA = 255;


//write a custom shader for the material
let inkwashMaterial = new THREE.ShaderMaterial({
  uniforms: {
    colorA: { type: "vec3", value: new THREE.Color(PARAMS.colorA) },
    colorB: { type: "vec3", value: new THREE.Color(PARAMS.colorB) },
    time: { type: "float", value: 0.0 },
    cameraPosition: { type: "vec3", value: new THREE.Vector3() },
    coefficientTexture: {
      type: "t", value: new THREE.TextureLoader().load("./assets/coefficientTexture6.png", function (texture) {
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        // texture.repeat.set(2, 2);
      })
    },
    size: { type: "vec2", value: new THREE.Vector2(window.innerWidth / 1, window.innerHeight / 1) },
    colorNoise: { type: "bool", value: false },
    fogColor: { type: "vec3", value: new THREE.Color(PARAMS.fogColor) },
    fogNear: { type: "float", value: 1.0 }, // Use default values if undefined
    fogFar: { type: "float", value: 1000.0 }  // Use default values if undefined
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      //rotated the vNormal by 90 degrees on the y axis
      vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #include <common>

    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    uniform sampler2D coefficientTexture;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float time;
    uniform float cameraDist;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform vec3 color;
    uniform vec2 size;
    uniform bool colorNoise;
    vec3 baseColor;
    float r;
    float g;
    float b;

    void main() {
      vec3 displayColor;
      float noise = rand(vPosition.xy);
      //rotate the camera angle by 90 degrees on y axis

      vec3 cameraDist = normalize(cameraPosition - vPosition);
      float angle = dot(normalize(vNormal), cameraDist);
      displayColor = mix(colorA, colorB, 1.0 - abs(angle));

      vec2 reflectUv = vUv - cameraDist.xy * 0.5;
      vec4 textureColor = texture2D(coefficientTexture, gl_FragCoord.xy/size.xy);
      r = clamp(displayColor.r + textureColor.r - 0.75, 0.0, 1.0);
      g = clamp(displayColor.g + textureColor.g - 0.75, 0.0, 1.0);
      b = clamp(displayColor.b + textureColor.b - 0.75, 0.0, 1.0);

      if (colorNoise) {
        g += (rand(vPosition.xz) - 0.5) * 0.2;
        b += (rand(vPosition.yz) - 0.5) * 0.2;
      }

      if (r > 0.4) {
        r = 0.9;
      } else if (r > 0.2) {
        r = 0.75;
      } else if (r > 0.1) {
        r = 0.5;
      } else if (r > 0.0) {
        r = 0.25;
      } else {
        r = 0.0;
      }

      if (g > 0.4) {
        g = 0.9;
      } else if (g > 0.2) {
        g = 0.75;
      } else if (g > 0.1) {
        g = 0.5;
      } else if (g > 0.0) {
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
      } else if (b > 0.0) {
        b = 0.25;
      } else {
        b = 0.0;
      }

      baseColor = vec3(r, g, b);

      float distance = length(cameraPosition - vPosition);

      baseColor = mix(baseColor, fogColor, distance/800.0);
      gl_FragColor = vec4(baseColor, 1.0);
    }
  `,
  side: THREE.DoubleSide,
  wireframe: PARAMS.wireframe,
  transparent: PARAMS.transparent,
  depthTest: PARAMS.depthTest,
  fog: true,
  // shading: THREE.FlatShading,
});

//write a custom shader for the material
let inkwashMaterialRoom = new THREE.ShaderMaterial({
  uniforms: {
    colorA: { type: "vec3", value: new THREE.Color(PARAMS.colorA) },
    colorB: { type: "vec3", value: new THREE.Color(PARAMS.colorB) },
    time: { type: "float", value: 0.0 },
    cameraPosition: { type: "vec3", value: new THREE.Vector3() },
    coefficientTexture: {
      type: "t", value: new THREE.TextureLoader().load("./assets/coefficientTexture6.png", function (texture) {
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        // texture.repeat.set(2, 2);
      })
    },
    size: { type: "vec2", value: new THREE.Vector2(window.innerWidth / 1, window.innerHeight / 1) },
    colorNoise: { type: "bool", value: false },
    fogColor: { type: "vec3", value: new THREE.Color(PARAMS.fogColor) }, // Explicitly assign fog color
    fogNear: { type: "float", value: 1.0 }, // Use default values if undefined
    fogFar: { type: "float", value: 1000.0 },  // Use default values if undefined
    waterHeight: { type: "float", value: 0.0 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      //rotated the vNormal by 90 degrees on the y axis
      vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #include <common>

    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    uniform sampler2D coefficientTexture;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float time;
    uniform float cameraDist;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform vec3 color;
    uniform vec2 size;
    uniform bool colorNoise;
    uniform float waterHeight;
    vec3 baseColor;
    float r;
    float g;
    float b;

    void main() {
      vec3 displayColor;
      float noise = rand(vPosition.xy);
      //rotate the camera angle by 90 degrees on y axis

      vec3 cameraDist = normalize(cameraPosition - vPosition);
      float angle = dot(normalize(vNormal), cameraDist);
      displayColor = mix(colorA, colorB, 1.0 - abs(angle));

      vec2 reflectUv = vUv - cameraDist.xy * 0.5;
      vec4 textureColor = texture2D(coefficientTexture, gl_FragCoord.xy/size.xy);
      r = clamp(displayColor.r + textureColor.r - 0.75, 0.0, 1.0);
      g = clamp(displayColor.g + textureColor.g - 0.75, 0.0, 1.0);
      b = clamp(displayColor.b + textureColor.b - 0.75, 0.0, 1.0);

      if (colorNoise) {
        g += (rand(vPosition.xz) - 0.5) * 0.2;
        b += (rand(vPosition.yz) - 0.5) * 0.2;
      }

      if (r > 0.4) {
        r = 0.9;
      } else if (r > 0.2) {
        r = 0.75;
      } else if (r > 0.1) {
        r = 0.5;
      } else if (r > 0.0) {
        r = 0.25;
      } else {
        r = 0.0;
      }

      if (g > 0.4) {
        g = 0.9;
      } else if (g > 0.2) {
        g = 0.75;
      } else if (g > 0.1) {
        g = 0.5;
      } else if (g > 0.0) {
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
      } else if (b > 0.0) {
        b = 0.25;
      } else {
        b = 0.0;
      }

      baseColor = vec3(r, g, b);
      float distance = length(cameraPosition - vPosition);
      baseColor = mix(baseColor, fogColor, distance/800.0);

      if (vPosition.y >= waterHeight) {
        gl_FragColor = vec4(baseColor, 0.1);
      }else{
        gl_FragColor = vec4(vec3(0, 0, 0), 1.0);
      }
    }
  `,
  side: THREE.DoubleSide,
  wireframe: true,
  transparent: true,
  alphaTest: 0.1,
  depthTest: PARAMS.depthTest,
  // fog: true,
});

let inkwashMaterialRoomShadow = new THREE.ShaderMaterial({
  uniforms: {
    colorA: { type: "vec3", value: new THREE.Color(PARAMS.colorA) },
    colorB: { type: "vec3", value: new THREE.Color(PARAMS.colorB) },
    time: { type: "float", value: 0.0 },
    cameraPosition: { type: "vec3", value: new THREE.Vector3() },
    coefficientTexture: {
      type: "t", value: new THREE.TextureLoader().load("./assets/coefficientTexture6.png", function (texture) {
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        // texture.repeat.set(2, 2);
      })
    },
    size: { type: "vec2", value: new THREE.Vector2(window.innerWidth / 1, window.innerHeight / 1) },
    colorNoise: { type: "bool", value: false },
    fogColor: { type: "vec3", value: new THREE.Color(PARAMS.fogColor) }, // Explicitly assign fog color
    fogNear: { type: "float", value: 1.0 }, // Use default values if undefined
    fogFar: { type: "float", value: 1000.0 },  // Use default values if undefined
    waterHeight: { type: "float", value: 0.0 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      //rotated the vNormal by 90 degrees on the y axis
      vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #include <common>

    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    uniform sampler2D coefficientTexture;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float time;
    uniform float cameraDist;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform vec3 color;
    uniform vec2 size;
    uniform bool colorNoise;
    uniform float waterHeight;
    vec3 baseColor;
    float r;
    float g;
    float b;

    void main() {
      vec3 displayColor;
      float noise = rand(vPosition.xy);
      //rotate the camera angle by 90 degrees on y axis

      vec3 cameraDist = normalize(cameraPosition - vPosition);
      float angle = dot(normalize(vNormal), cameraDist);
      displayColor = mix(colorA, colorB, 1.0 - abs(angle));

      vec2 reflectUv = vUv - cameraDist.xy * 0.5;
      vec4 textureColor = texture2D(coefficientTexture, gl_FragCoord.xy/size.xy);
      r = clamp(displayColor.r + textureColor.r - 0.75, 0.0, 1.0);
      g = clamp(displayColor.g + textureColor.g - 0.75, 0.0, 1.0);
      b = clamp(displayColor.b + textureColor.b - 0.75, 0.0, 1.0);

      if (colorNoise) {
        g += (rand(vPosition.xz) - 0.5) * 0.2;
        b += (rand(vPosition.yz) - 0.5) * 0.2;
      }

      if (r > 0.4) {
        r = 0.9;
      } else if (r > 0.2) {
        r = 0.75;
      } else if (r > 0.1) {
        r = 0.5;
      } else if (r > 0.0) {
        r = 0.25;
      } else {
        r = 0.0;
      }

      if (g > 0.4) {
        g = 0.9;
      } else if (g > 0.2) {
        g = 0.75;
      } else if (g > 0.1) {
        g = 0.5;
      } else if (g > 0.0) {
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
      } else if (b > 0.0) {
        b = 0.25;
      } else {
        b = 0.0;
      }

      baseColor = vec3(r, g, b);
      float distance = length(cameraPosition - vPosition);
      baseColor = mix(baseColor, fogColor, distance/800.0);

      if (vPosition.y >= waterHeight) {
        gl_FragColor = vec4(baseColor, 0.0);
      }else{
        gl_FragColor = vec4(vec3(0, 0, 0), 1.0);
      }
    }
  `,
  side: THREE.DoubleSide,
  wireframe: false,
  transparent: true,
  alphaTest: 0.1,
  depthTest: PARAMS.depthTest,
  // fog: true,
});

function setupThree() {
  setupWebXR();

  room = loadGLTF("assets/andyroom.glb");
  room1 = loadGLTFShadow("assets/andyroom.glb");
  // scene.add(room);
  // loadOBJ("assets/gummy.obj");
  const terrain = pane.addFolder({
    title: 'terrain',
  });
  const shader = pane.addFolder({
    title: 'shader',
  });
  const cameraFolder = pane.addFolder({
    title: 'camera',
  });
  const dev = pane.addFolder({
    title: 'dev',
  });

  dev.addBinding(PARAMS, "test");
  shader.addBinding(PARAMS, "colorA");
  shader.addBinding(PARAMS, "colorB");
  shader.addBinding(PARAMS, "fogColor");
  shader.addBinding(PARAMS, "transparent");
  shader.addBinding(PARAMS, "depthTest");
  shader.addBinding(PARAMS, "wireframe");
  shader.addBinding(PARAMS, "colorNoise");
  // pane.addBinding(PARAMS, "frame");
  //limit the height of the mountain from 5 to 40
  terrain.addBinding(PARAMS, "mountainHeight", { min: 0, max: 30 });
  cameraFolder.addBinding(PARAMS, "fov", { min: 0, max: 180 });

  controls = new MapControls(camera, renderer.domElement);
  controls.minDistance = 0;
  controls.maxDistance = 100;
  // controls.distance = 0;
  // controls.minPolarAngle = -Math.PI / 2;
  // controls.maxPolarAngle = Math.PI;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.panSpeed = 1;
  controls.zoomSpeed = 0.15;
  controls.listenToKeyEvents(window);
  controls.keys = {
    LEFT: 'KeyA', //left arrow
    UP: 'KeyW', // up arrow
    RIGHT: 'KeyD', // right arrow
    BOTTOM: 'KeyS' // down arrow
  }
  // window.listenToKeyEvents = true;

  // change the background color
  renderer.setClearColor(PARAMS.fogColor);

  // add ambient light
  ambiLight = new THREE.AmbientLight("#FFFFFF");
  sceneGroup.add(ambiLight);

  plane = getPlane();
  plane.position.set(0, 10, 0);
  // plane.rotation.x = Math.PI / 2;
  sceneGroup.add(plane);

  sculpture = new THREE.Group();

  imageGrp = new THREE.Group();
  sceneGroup.add(imageGrp);

  for (let i = 0; i < 5; i++) {
    tasks.push(new Image("assets/images/" + (i + 1) + ".png"));
  }
  inkwashMaterialRoom.needsUpdate = true;


  //XR contents
  raycaster = new THREE.Raycaster();
  scene.add(tasksGroup);

  buildTasks();

  const sessionInit = {
    requiredFeatures: [],
    optionalFeatures: ['hand-tracking', 'depth-sensing'],
    depthSensing: { 'usagePreference': ['gpu-optimized'], 'dataFormatPreference': [] }
  };

  document.body.appendChild(XRButton.createButton(renderer, sessionInit));

  // controllers
  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelectStart);
  controller1.addEventListener('selectend', onSelectEnd);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelectStart);
  controller2.addEventListener('selectend', onSelectEnd);
  scene.add(controller2);

  // buildHands();

  const controllerGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

  const line = new THREE.Line(controllerGeometry);
  line.name = 'line';
  line.scale.z = 5;

  controller1.add(line.clone());
  controller2.add(line.clone());

  scene.add(sceneGroup);
}

function updateThree() {
  controls.update();
  renderer.setClearColor(PARAMS.fogColor);
  // let angle = frame * 0.01;
  // let radDist = 500;
  // let x = cos(angle) * radDist;
  // let y = 300;
  // let z = sin(angle) * radDist;
  // light.position.set(x, y, z);
  for (let task of tasks) {
    task.update();
    if (task.alive == false) {
      task.mesh.position.x = Math.random() * 4 - 2;
      task.mesh.position.y = Math.random() * 2;
      task.mesh.position.z = Math.random() * 4 - 2;
      task.alive = true;
      task.mesh.visible = true;
    }
  }

  // camera.position.z --;
  updateCameraAngle();
  updateShader();
  cameraControls();
  // camera.lookAt(new THREE.Vector3(-9, -4, -5));
  // inkwashMaterial.uniforms.time.value = frame * 0.01;

  let posArray = plane.geometry.attributes.position.array;

  let angle = camera.rotation.y;
  //make the offset always goes in the direction of the camera

  // globalXoffset += cameraDirection.x * 0.001;
  // globalYoffset += cameraDirection.z * 0.001;
  globalXoffset += 0.01;
  globalYoffset += 0.01;
  for (let i = 0; i < posArray.length; i += 3) {
    let x = posArray[i + 0];
    let y = posArray[i + 1];
    let z = posArray[i + 2];

    //get the angle of the camera, and make the noise value dependent on the angle

    let xOffset = (x * 2 + WORLD_HALF) * 0.5 + globalXoffset;
    let yOffset = (y * 2 + WORLD_HALF) * 0.5 + globalYoffset;
    // let noiseValue = (noise(xOffset, yOffset) * (PARAMS.mountainHeight + 10)) ** 2;
    let noiseValue = (noise(xOffset, yOffset) * 0.5);

    posArray[i + 2] = noiseValue + 9.85 - waterHeight; // update the z value.
    //swap the x and z values for a different effect
    // posArray[i + 2] = x;
    // posArray[i + 0] = noiseValue;
  }
  plane.geometry.computeVertexNormals();
  plane.geometry.attributes.position.needsUpdate = true;

  //XR space
  cleanIntersected();

  intersectObjects(controller1);
  intersectObjects(controller2);

  waterControl();

  let mappedColorA = safeMap(waterHeight, camera.position.y/2, camera.position.y, 255, 0);
  mappedColorA = Math.round(constrain(mappedColorA, 0, 255));
  let hex = mappedColorA.toString(16).padStart(2, "0");
  PARAMS.colorA = "#FF" + hex + hex;

  PARAMS.frame = frame;
  pane.refresh();
  if (PARAMS.test) {
    test();
  }
}

function safeMap(value, start1, stop1, start2, stop2) {
  if (start1 === stop1) {
    return start2; // Default to the lower output range
  }
  return map(value, start1, stop1, start2, stop2);
}

function waterControl() {
  if (camera.position.y < 1) {
    blackTargetHeight = 0;
  }
  
  if (blackTargetHeight <= 2.7) {
    blackTargetHeight -= 0.001;
  }else{
    blackTargetHeight = 5.0;
  }
  waterTargetHeight += 0.002;

  if (doneTasks > 0) {
    waterTargetHeight -= 0.4;
    blackTargetHeight += 0.2;
    doneTasks -= 1;
  }
  waterTargetHeight = clamp(waterTargetHeight, 0.3, camera.position.y);
  blackTargetHeight = clamp(blackTargetHeight, 0, 5.0);

  waterHeight = lerp(waterHeight, waterTargetHeight, 0.03);
  blackHeight = lerp(blackHeight, blackTargetHeight, 0.01);
}

function buildTasks() {
  for (let i = 0; i < 5; i++) {
    tasks.push(new Image("assets/images/" + (i % 5 + 1) + ".png"));

    tasks[i].mesh.position.x = Math.random() * 4 - 2;
    tasks[i].mesh.position.y = Math.random() * 2;
    tasks[i].mesh.position.z = Math.random() * 4 - 2;

    tasks[i].mesh.rotation.x = Math.random() * 2 * Math.PI;
    tasks[i].mesh.rotation.y = Math.random() * 2 * Math.PI;
    tasks[i].mesh.rotation.z = Math.random() * 2 * Math.PI;

    // tasks[i].mesh.scale.setScalar(Math.random() + 0.5);
    // tasksGroup.add(object);
  }
}

function buildHands() {
  const controllerModelFactory = new XRControllerModelFactory();
  const handModelFactory = new XRHandModelFactory();

  // Hand 1
  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
  scene.add(controllerGrip1);

  hand1 = renderer.xr.getHand(0);
  hand1.userData.currentHandModel = 0;
  scene.add(hand1);

  handModels.left = [
    // handModelFactory.createHandModel(hand1, 'boxes'),
    // handModelFactory.createHandModel(hand1, 'spheres'),
    handModelFactory.createHandModel(hand1, 'mesh')
  ];

  const leftHandModel = handModels.left[0];
  leftHandModel.visible = 0 == 0;
  hand1.add(leftHandModel);

  hand1.addEventListener('pinchend', function () {
    // handModels.left[this.userData.currentHandModel].visible = false;
    // this.userData.currentHandModel = (this.userData.currentHandModel + 1) % 3;
    // handModels.left[this.userData.currentHandModel].visible = true;
  });

  // Hand 2
  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
  scene.add(controllerGrip2);

  hand2 = renderer.xr.getHand(1);
  hand2.userData.currentHandModel = 0;
  scene.add(hand2);

  handModels.right = [
    handModelFactory.createHandModel(hand2, 'mesh')
  ];

  const rightHandModel = handModels.right[0];
  rightHandModel.visible = 0 == 0;
  hand2.add(rightHandModel);

  hand2.addEventListener('pinchend', function () {
    // handModels.right[this.userData.currentHandModel].visible = false;
    // this.userData.currentHandModel = (this.userData.currentHandModel + 1) % 3;
    // handModels.right[this.userData.currentHandModel].visible = true;
  });
}

function onSelectStart(event) {
  const controller = event.target;
  const intersections = getIntersections(controller);
  if (intersections.length > 0) {
    const intersection = intersections[0];
    const object = intersection.object;
    // object.material.emissive.b = 1;
    object.userData.selected = true;
    // console.log(object.userData.selected);
    controller.attach(object);
    controller.userData.selected = object;
    doneTasks += 1;
  }
  controller.userData.targetRayMode = event.data.targetRayMode;
}

function onSelectEnd(event) {
  const controller = event.target;
  if (controller.userData.selected !== undefined) {
    const object = controller.userData.selected;
    // object.material.emissive.b = 0;
    object.userData.selected = false;
    object.visible = false;
    tasksGroup.attach(object);
    controller.userData.selected = undefined;
  }
}

function getIntersections(controller) {
  controller.updateMatrixWorld();
  raycaster.setFromXRController(controller);
  return raycaster.intersectObjects(tasksGroup.children, false);
}

function intersectObjects(controller) {
  // Do not highlight in mobile-ar
  if (controller.userData.targetRayMode === 'screen') return;
  // Do not highlight when already selected
  if (controller.userData.selected !== undefined) return;
  const line = controller.getObjectByName('line');
  const intersections = getIntersections(controller);

  if (line === undefined) return;
  if (intersections === undefined) return;

  if (intersections.length > 0) {
    const intersection = intersections[0];
    const object = intersection.object;
    // object.material.emissive.r = 1;
    intersected.push(object);
    line.scale.z = intersection.distance;
  } else {
    line.scale.z = 5;
  }
}

function cleanIntersected() {
  while (intersected.length) {
    const object = intersected.pop();
  }
}


function test() {
  // console.log("test");
  console.log(waterHeight)
}

function mousePressed() {

}

function cameraControls() {
  //if press space camera will move up
  if (keyIsDown(32)) {
    camera.position.y += 0.1;
  }
  //if press control camera will move down
  if (keyIsDown(17)) {
    camera.position.y -= 0.1;
  }
  //change camera fov according to PARAMS.fov
  camera.fov = PARAMS.fov;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  //make camera look at the center of the world
  // camera.lookAt(0, 0, 0);
}


function updateCameraAngle() {
  //calculate the vector of current camera direction
  camera.getWorldDirection(cameraDirection);
}

function updateShader() {
  inkwashMaterial.uniforms.cameraPosition.value = camera.position;
  inkwashMaterial.transparent = PARAMS.transparent;
  inkwashMaterial.depthTest = PARAMS.depthTest;
  inkwashMaterial.wireframe = PARAMS.wireframe;
  inkwashMaterial.uniforms.colorNoise.value = PARAMS.colorNoise;
  inkwashMaterial.uniforms.colorA.value = new THREE.Color(PARAMS.colorA);
  inkwashMaterial.uniforms.colorB.value = new THREE.Color(PARAMS.colorB);
  inkwashMaterial.uniforms.fogColor.value = new THREE.Color(PARAMS.fogColor);

  inkwashMaterialRoom.uniforms.cameraPosition.value = camera.position;
  inkwashMaterialRoom.transparent = PARAMS.transparent;
  inkwashMaterialRoom.depthTest = PARAMS.depthTest;
  inkwashMaterialRoom.wireframe = !PARAMS.wireframe;
  inkwashMaterialRoom.uniforms.waterHeight.value = blackHeight;

  inkwashMaterialRoomShadow.uniforms.cameraPosition.value = camera.position;
  inkwashMaterialRoomShadow.depthTest = PARAMS.depthTest;
  inkwashMaterialRoomShadow.wireframe = PARAMS.wireframe;
  inkwashMaterialRoomShadow.uniforms.waterHeight.value = blackHeight;
}

function getImage(url) {
  const geometry = new THREE.PlaneGeometry(7.2, 4.5);
  geometry.rotateY(Math.PI / 2);
  const texture = new THREE.TextureLoader().load(url);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getTorus() {
  const geometry = new THREE.TorusGeometry(100, 50, 16, 100);
  const material = inkwashMaterial;
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getPlane() {
  const geometry = new THREE.PlaneGeometry(10, 10, 120, 120);
  const material = inkwashMaterial;
  //get a plane that is perpendicular to the y axis
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;
  return plane;
}

function getPhongBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = inkwashMaterial;
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getPhongSphere() {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
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

function loadGLTFShadow(filepath) {
  // load .glft file
  let gltfModel;
  const loader = new GLTFLoader();

  loader.load(
    // resource URL
    filepath,
    // onLoad callback
    function (gltfData) {
      // Add the loaded model to the scene
      gltfModel = gltfData.scene;
      console.log(gltfModel);

      // Set material of glb file
      gltfData.scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.computeVertexNormals();
          child.material = inkwashMaterialRoomShadow;
        }
      });
      // Scale the model
      gltfModel.position.set(0, 1.3, 0);
      gltfModel.scale.set(1, 1, 1);
      sceneGroup.add(gltfModel);
      return gltfModel;

      // gltfData.animations; // Array<THREE.AnimationClip>
      // gltfData.scene; // THREE.Group
      // gltfData.scenes; // Array<THREE.Group>
      // gltfData.cameras; // Array<THREE.Camera>
      // gltfData.asset; // Object
    },

    // onProgress callback
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function (err) {
      console.error('An error happened');
    }
  );
}

function loadGLTF(filepath) {
  // load .glft file
  let gltfModel;
  const loader = new GLTFLoader();

  loader.load(
    // resource URL
    filepath,
    // onLoad callback
    function (gltfData) {
      // Add the loaded model to the scene
      gltfModel = gltfData.scene;
      console.log(gltfModel);

      // Set material of glb file
      gltfData.scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.computeVertexNormals();
          child.material = inkwashMaterialRoom;
        }
      });
      // Scale the model
      gltfModel.position.set(0, 1.3, 0);
      gltfModel.scale.set(1, 1, 1);
      sceneGroup.add(gltfModel);
      return gltfModel;

      // gltfData.animations; // Array<THREE.AnimationClip>
      // gltfData.scene; // THREE.Group
      // gltfData.scenes; // Array<THREE.Group>
      // gltfData.cameras; // Array<THREE.Camera>
      // gltfData.asset; // Object
    },

    // onProgress callback
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function (err) {
      console.error('An error happened');
    }
  );
}

class Image {
  constructor(url) {
    this.mesh = getImage(url);
    this.mesh.position.set(random(-0.9, -1.1), random(0.8, 1.4), random(-0.2, -0.8));
    this.position = this.mesh.geometry.attributes.position;
    this.mesh.userData.selected = false;
    this.mesh.scale.set(0.1, 0.1, 0.1);
    tasksGroup.add(this.mesh);
    this.random = random(0, 2 * PI);
    this.randomSpd = random(1, 2);
    this.alive = true;
  }

  display() {
  }

  update() {
    this.position.needsUpdate = true;

    if (this.mesh.visible == false) {
      this.alive = false;
    }

    if (!this.mesh.userData.selected) {
      // Get the current position of the mesh
      const meshPosition = this.mesh.position;

      // Compute the direction vector from the mesh to the camera
      const direction = new THREE.Vector3().subVectors(camera.position, meshPosition).normalize();

      // Calculate the distance between the mesh and the camera
      const distance = meshPosition.distanceTo(camera.position);

      // If the distance is greater than 2, move the mesh towards the camera
      if (distance > 0.8 && camera.position.y > 0.2) {
        const speed = 0.01; // Adjust speed of movement
        meshPosition.addScaledVector(direction, speed);

        // Rotate the mesh to face the camera
        this.mesh.lookAt(camera.position);
        this.mesh.rotateY(-PI / 2);
      }

      // Apply floating animation
      for (let i = 0; i < this.position.array.length; i += 3) {
        let x = this.position.array[i + 0];
        let y = this.position.array[i + 1];
        let z = this.position.array[i + 2];
        x += Math.sin((frame + this.random) * 0.01) * 0.01;
        y += Math.cos((frame + this.random) * 0.01) * 0.02;
        z += Math.sin((frame + this.random) * 0.01) * 0.01;
        this.position.array[i + 0] = x;
        this.position.array[i + 1] = y;
        this.position.array[i + 2] = z;
      }

      this.random += this.randomSpd;

      // Prevent the mesh from going below waterHeight
      if (this.mesh.position.y < blackHeight) {
        this.mesh.position.y = blackHeight;
      }
    }
  }
}

function larger(a, b) {
  if (a > b) {
    return a;
  } else {
    return b;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}