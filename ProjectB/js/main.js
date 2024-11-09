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
  fogColor: "#ffffff",
  fog: true,
  frame: frame,
  mountainHeight: 25,
}
const pane = new Pane();
const WORLD_HALF = 1000;
let light, lightMesh;
let sculpture;
let cameraDirection = new THREE.Vector3();
let cameraHeading = new THREE.Vector2();
let bear;
// const coefficientTexture = new THREE.TextureLoader().load("./assets/coefficientTexture.png");
let room;
let plane;
let globalXoffset = 0;
let globalYoffset = 0;
let images = [];
let imageGrp;


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
      gl_FragColor = vec4(baseColor, 0.8);
    }
  `,
  side: THREE.DoubleSide,
  wireframe: true,
  transparent: true,
  alphaTest: 0.1,
  depthTest: PARAMS.depthTest,
  // fog: true,
});

function setupThree() {
  loadGLTF("assets/andyroom.glb");
  loadOBJ("assets/gummy.obj");
  pane.addBinding(PARAMS, "test");
  pane.addBinding(PARAMS, "colorA");
  pane.addBinding(PARAMS, "colorB");
  pane.addBinding(PARAMS, "transparent");
  pane.addBinding(PARAMS, "depthTest");
  pane.addBinding(PARAMS, "wireframe");
  pane.addBinding(PARAMS, "colorNoise");
  // pane.addBinding(PARAMS, "frame");
  pane.addBinding(PARAMS, "fogColor");

  //limit the height of the mountain from 5 to 40
  pane.addBinding(PARAMS, "mountainHeight", { min: 0, max: 30 });


  // change the background color
  renderer.setClearColor(PARAMS.fogColor);
  //add fog to the scene
  // scene.fog = new THREE.Fog(PARAMS.fogColor, 1, 1000);
  //change the density of the fog
  // scene.fog.density = 100;

  // add ambient light
  ambiLight = new THREE.AmbientLight("#FFFFFF");
  scene.add(ambiLight);

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

  plane = getPlane();
  plane.position.set(0, 0, 0);
  // plane.rotation.x = Math.PI / 2;
  scene.add(plane);

  const torus = getTorus();
  torus.position.set(0, 250, 0);
  // scene.add(torus);

  sculpture = new THREE.Group();
  // scene.add(sculpture);
  // sculpture.add(cube1);
  // sculpture.add(cube2);
  sculpture.add(ball);
  // sculpture.add(plane);
  sculpture.add(torus);

  imageGrp = new THREE.Group();
  scene.add(imageGrp);

  // const image1 = getImage("assets/images/1.png");
  // images.add(image1);
  // image1.position.set(random(-9, -10), random(-4, -0), random(-3, -7));


  // const image2 = getImage("assets/images/2.png");
  // images.add(image2);
  // image2.position.set(random(-9, -10), random(-4, -0), random(-3, -7));

  // const image3 = getImage("assets/images/3.png");
  // images.add(image3);
  // image3.position.set(random(-9, -10), random(-4, -0), random(-3, -7));

  // const image4 = getImage("assets/images/4.png");
  // images.add(image4);
  // image4.position.set(random(-9, -10), random(-4, -0), random(-3, -7));

  // const image5 = getImage("assets/images/5.png");
  // images.add(image5);
  // image5.position.set(random(-9, -10), random(-4, -0), random(-3, -7));
  for (let i = 0; i < 5; i++) {
    images.push(new Image("assets/images/" + (i + 1) + ".png"));
  }
  inkwashMaterialRoom.needsUpdate = true;
}


function updateThree() {
  renderer.setClearColor(PARAMS.fogColor);
  // let angle = frame * 0.01;
  // let radDist = 500;
  // let x = cos(angle) * radDist;
  // let y = 300;
  // let z = sin(angle) * radDist;
  // light.position.set(x, y, z);
  for (let image of images) {
    // image.display();
    image.update();
  }

  updateCameraAngle();
  updateShader();
  camera.lookAt(new THREE.Vector3(-9, -4, -5));
  // inkwashMaterial.uniforms.time.value = frame * 0.01;

  let posArray = plane.geometry.attributes.position.array;

  let angle = camera.rotation.y;
  //make the offset always goes in the direction of the camera

  globalXoffset += cameraDirection.x * 0.001;
  globalYoffset += cameraDirection.z * 0.001;
  for (let i = 0; i < posArray.length; i += 3) {
    let x = posArray[i + 0];
    let y = posArray[i + 1];
    let z = posArray[i + 2];

    //get the angle of the camera, and make the noise value dependent on the angle

    let xOffset = (x + WORLD_HALF) * 0.003 + globalXoffset;
    let yOffset = (y + WORLD_HALF) * 0.003 + globalYoffset;
    let noiseValue = (noise(xOffset, yOffset) * (PARAMS.mountainHeight + 10)) ** 2;

    posArray[i + 2] = noiseValue; // update the z value.
    //swap the x and z values for a different effect
    // posArray[i + 2] = x;
    // posArray[i + 0] = noiseValue;
  }
  plane.geometry.computeVertexNormals();
  plane.geometry.attributes.position.needsUpdate = true;

  if (room !== undefined) {
    room.scale.set(10, 10, 10);
    // model.rotation.x += 0.01;
    // room.rotation.y += 0.01;
    room.position.y = 0;
    room.position.z = 0;
    //camera look at the room
    // camera.lookAt(room.position);
  }

  PARAMS.frame = frame;
  pane.refresh();
  if (PARAMS.test) {
    test();
  }
}


function test() {
  // console.log("test");
  // console.log(inkwashMaterial.uniforms.cameraAngle.value = camera.rotation.x);
  // console.log(PARAMS.colorA);
  // console.log(cameraDirection);
  // console.log(angle);
  // PARAMS.test = false;
}

function mousePressed() {

}

function updateCameraAngle() {
  //calculate the vector of current camera direction
  camera.getWorldDirection(cameraDirection);
  //calculate the angle of the camera direction


  //draw a line in the center of the world that represents the camera direction
  // let lineGeometry = new THREE.BufferGeometry();
  // lineGeometry.setFromPoints([cameraDirection, new THREE.Vector3(0, 0, 0)]);
  // let lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
  // let line = new THREE.Line(lineGeometry, lineMaterial);
  // scene.add(line);
  // inkwashMaterial.uniforms.cameraAngle.value = camera.rotation.x;
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
  const geometry = new THREE.PlaneGeometry(1200, 1200, 120, 120);
  const material = inkwashMaterial;
  //get a plane that is perpendicular to the y axis
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;
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
    function (obj) {
      // Add the loaded object to the scene
      bear = obj;
      for (let child of bear.children) {
        //child.material = new THREE.MeshBasicMaterial();
        child.material = inkwashMaterial;
      }
      bear.scale.set(100, 100, 100);
      bear.position.set(0, 0, 0);
      // scene.add(bear);
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
  const loader = new GLTFLoader();

  loader.load(
    // resource URL
    filepath,
    // onLoad callback

    // Here the loaded data is assumed to be an object
    function (gltfData) {
      // Add the loaded model to the scene
      room = gltfData.scene;
      console.log(room);

      //get material of glb file

      gltfData.scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.computeVertexNormals();
          child.material = inkwashMaterialRoom;
          // child.material.color.set("#FFFFFF");
          // child.castShadow = true;
          // child.receiveShadow = true;
        }
      });

      scene.add(room);

      gltfData.animations; // Array<THREE.AnimationClip>
      gltfData.scene; // THREE.Group
      gltfData.scenes; // Array<THREE.Group>
      gltfData.cameras; // Array<THREE.Camera>
      gltfData.asset; // Object
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
    this.mesh.position.set(random(-9, -10), random(-4, -0), random(-3, -7));
    this.position = this.mesh.geometry.attributes.position;
    imageGrp.add(this.mesh);
    this.random = random(0, 2*PI);
    this.randomSpd = random(1,2);
  }

  display() {
  }

  update() {

    this.position.needsUpdate = true;
    for (let i = 0; i < this.position.array.length; i += 3) {
      let x = this.position.array[i + 0];
      let y = this.position.array[i + 1];
      let z = this.position.array[i + 2];
      x += sin((frame + this.random) * 0.01) * 0.01;
      y += cos((frame + this.random) * 0.01) * 0.02;
      z += sin((frame + this.random) * 0.01) * 0.01;
      this.position.array[i + 0] = x;
      this.position.array[i + 1] = y;
      this.position.array[i + 2] = z;
    }
    this.random += this.randomSpd;
  }
}