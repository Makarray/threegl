var renderer = new THREE.WebGLRenderer();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

/* Begin creating objects and rendering */

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00});
var cube = new THREE.Mesh( geometry, material );

scene.add(cube);

camera.position.z = 5;
renderer.render(scene, camera);


function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}
render();
