document.bgColor = '#000000';
var renderer = new THREE.WebGLRenderer();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

/* Begin creating objects and rendering */

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshLambertMaterial( { color: 0x00aa00 });
var cube = new THREE.Mesh( geometry, material );
scene.add(cube);

var pointLight = new THREE.PointLight( 0xFFFFFF );
pointLight.position.x = 0.5;
pointLight.position.y = 0.5;
pointLight.position.z = 3;
scene.add(pointLight);

var lightsphere = new THREE.Mesh (
		new THREE.SphereGeometry(.2,10,10),
		new THREE.MeshBasicMaterial( {color: 0xFFFFFF})
		);
lightsphere.position = pointLight.position;
scene.add(lightsphere);

camera.position.z = 5;
renderer.render(scene, camera);

/* ******************************
 * Event Handlers
 * ******************************/
function mouseMove(e){
	//cube.position.x = (e.clientX / document.innerWidth);
	alert ((e.clientX / window.innerWidth) *2 -1);
	alert (cube.position.x);
}
function mouseClick(e){
	cube.position.x = (e.clientX / window.innerWidth) * 2 - 1;
	cube.position.y = -(e.clientY / window.innerHeight) * 2 + 1;
}
//document.addEventListener("mousemove",mouseMove, false);
document.addEventListener("click",mouseClick, false);
/* ******************************
 * Render function 
 * *****************************/
function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}
render();
