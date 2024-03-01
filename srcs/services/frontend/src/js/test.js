import * as THREE from 'three';

// Crear una escena
const scene = new THREE.Scene();

// Crear una cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Crear un renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear una cuadrícula
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Animación
const animate = function () {
//   requestAnimationFrame(animate);

  // Rotar la cuadrícula
  gridHelper.rotation.x += 1.5;
  gridHelper.rotation.y += 0;

  renderer.render(scene, camera);
};

// Llamada inicial a la animación
animate();

// Crear una escena
// const scene = new THREE.Scene();

// // Crear una cámara
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(0, 0, 20); // Ajustar la posición Z para alejar la cámara

// // Crear un renderizador
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Crear una cuadrícula
// const gridHelper = new THREE.GridHelper(10, 10);
// scene.add(gridHelper);

// // Ajustar la posición de la cuadrícula para que esté en el frente
// gridHelper.position.set(0, 0, 0);

// // Añadir un fondo para simular el interior del cubo
// const cubeGeometry = new THREE.BoxGeometry(15, 15, 15);
// const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.BackSide });
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// scene.add(cube);

// // Animación
// const animate = function () {
// //   requestAnimationFrame(animate);

//   // Rotar la cuadrícula
//   gridHelper.rotation.x += 1.5;
//   gridHelper.rotation.y += 0;

//   renderer.render(scene, camera);
// };

// // Llamada inicial a la animación
// animate();