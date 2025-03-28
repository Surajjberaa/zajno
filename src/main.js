import LocomotiveScroll from 'locomotive-scroll';
import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';
import gsap from 'gsap';

const locomotiveScroll = new LocomotiveScroll({
  smooth: true,
  lerp: 0.03, // Lower value = slower scroll
  multiplier: 0.3 // Lower value = slower scroll
});


function HideBrowserScrollbar() {
  let scrollHide = document.createElement("style");
  scrollHide.innerHTML = `body::-webkit-scrollbar {display: none;}`;
  document.head.appendChild(scrollHide);
}

HideBrowserScrollbar();

import * as THREE from 'three';

const scene = new THREE.Scene();
const distance = 5;
const fov = Math.atan((window.innerHeight / 2) / distance) * 2 * (180 / Math.PI); 
const camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 0.1, 1000 );
const canvas = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize( window.innerWidth, window.innerHeight );

const images = document.querySelectorAll('img');
const planes = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let mouseTimeout;
let isMouseMoving = false;

const smoothConfig = {
  duration: 0.8,
  ease: "power2.out"
};

images.forEach((image, index) => {
  const imgBounds = image.getBoundingClientRect();
  const texture = new THREE.TextureLoader().load(image.src);
  const geometry = new THREE.PlaneGeometry(imgBounds.width, imgBounds.height);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 }
    }
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(imgBounds.left - window.innerWidth /2 + imgBounds.width / 2, -imgBounds.top + window.innerHeight / 2 - imgBounds.height / 2, 0);
  planes.push(plane);
  scene.add(plane);
})

function updatePlanePositon(){
  planes.forEach((plane, index) => {
    const image = images[index]
    const imgBounds = image.getBoundingClientRect();
    plane.position.set(imgBounds.left - window.innerWidth /2 + imgBounds.width / 2, -imgBounds.top + window.innerHeight / 2 - imgBounds.height / 2, 0);
    
    // Update plane geometry to match image size
    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry(imgBounds.width, imgBounds.height);
  })
}

camera.position.z = distance;

function animateHover(plane, targetValue) {
  gsap.to(plane.material.uniforms.uHover, {
    value: targetValue,
    ...smoothConfig
  });
}

function animateMousePosition(plane, uv) {
  gsap.to(plane.material.uniforms.uMouse.value, {
    x: uv.x,
    y: uv.y,
    ease: "power2.out"
  });
}

window.addEventListener('mousemove', (event) => {
  clearTimeout(mouseTimeout);
  isMouseMoving = true;
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  planes.forEach(plane => {
    const intersects = raycaster.intersectObject(plane);
    if(intersects.length > 0 && isMouseMoving) {
      const intersection = intersects[0];
      animateMousePosition(plane, intersection.uv);
      animateHover(plane, 1);
    } else {
      animateHover(plane, 0);
    }
  });

  mouseTimeout = setTimeout(() => {
    isMouseMoving = false;
    planes.forEach(plane => {
      animateHover(plane, 0);
    });
  }, 700);
  console.log(isMouseMoving);
});

function animate() {
  requestAnimationFrame( animate );
  updatePlanePositon();
  renderer.render( scene, camera );
}
animate();

window.addEventListener('resize', function() {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = Math.atan((window.innerHeight / 2) / distance) * 2 * (180 / Math.PI);
  camera.updateProjectionMatrix();
  
  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Update uniforms
  planes.forEach(plane => {
    plane.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });
  
  // Update plane positions and geometries
  updatePlanePositon();
});
