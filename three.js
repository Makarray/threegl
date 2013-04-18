if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// important variables:
var trafficVelocity = new THREE.Vector3(-.4,0,0);
var trafficWidth = trafficHeight = 10;
var screenWidth = window.innerWidth,
	 screenHeight = window.innerHeight;
var score = 0,
	 paused = false;
var explosionHolder = new Array();
var explosionLives = new Array();





// @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();


document.bgColor = '#000000';
var renderer = Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000);

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

var worldWidth = unproject(window.innerWidth,window.innerHeight).x - 
					unproject(0,0).x;
var worldWidth = unproject(window.innerWidth,window.innerHeight).y - 
					unproject(0,0).y;

var pointLight = new THREE.PointLight( 0xFFFFFF );
pointLight.position.x = 20;
pointLight.position.y = 20;
pointLight.position.z = 20;
pointLight.distance = 200;
scene.add(pointLight);

var pointLight1 = new THREE.PointLight( 0xFFFFFF );
pointLight.position.x = -40;
pointLight.position.y = 20;
pointLight.position.z = 20;
pointLight.distance = 300;
scene.add(pointLight1);

var light_amb = new THREE.AmbientLight( 0x1f1f1f );
scene.add(light_amb);
/* Begin creating objects and rendering */

loader = new THREE.JSONLoader();
var shipMat, shipMesh, shipGeo,
	 shipLoaded = false;
loader.load("ship3.js", function(geo, mat) {
	shipMat = new THREE.MeshFaceMaterial(mat);
	shipGeo = geo;
	shipMesh = new THREE.Mesh(geo,shipMat);
	shipMesh.name = "Ship";
	scene.add(shipMesh);
	shipLoaded = true;
	},
	"./images/"
);

var geometry = new THREE.CubeGeometry(4,2,5);
var material = new THREE.MeshLambertMaterial( { color: 0x00aa00 });
var cube = new THREE.Mesh( geometry, material );
cube.moveVector = new THREE.Vector3(1,0,0);
cube.position.x = -20;
cube.width = 10;
cube.height = 10;
cube.visible = false;
scene.add(cube);


var lightsphere = new THREE.Mesh (
		new THREE.SphereGeometry(2,10,10),
		new THREE.MeshBasicMaterial( {color: 0xFFFFFF})
		);
lightsphere.position = pointLight.position;
scene.add(lightsphere);


/* ******************************************
 * Begin creating incomming objects
 * ******************************************/

var startTraffic = 12,
	 maxTraffic = 16;
	 trafficHolder = new Array();

for (iterator=0; iterator < startTraffic; iterator++) {
	var tX = Math.floor(iterator / 4.0) * (trafficHeight + 40) + gaussian(10, 60),
		tY = (iterator % 4) * trafficHeight - (13) ,
		tZ = cube.position.z;

	var tempCube = new THREE.Mesh(
			new THREE.CubeGeometry(trafficWidth, trafficHeight, trafficWidth),
			new THREE.MeshLambertMaterial( {color: 0x880000,
														transparent: true,
														opacity: 0.7}));

	tempCube.velocity = trafficVelocity;
	tempCube.position.set(tX, tY, tZ);
	trafficHolder.push(tempCube);
	scene.add(tempCube);
}

//********************************************
// Particle system goes here
function waitUntilMouse(){
	if (!mouseMoved){
		setTimeout(waitUntilMouse,200);
	}
}
//waitUntilMouse();

var particleCount = 2200,
	 particles = new THREE.Geometry(),
	 pMaterial = new THREE.ParticleBasicMaterial({
		color: 0x22FF44,
		size: 1,
		map: THREE.ImageUtils.loadTexture("images/particle.png"),
		blending: THREE.AdditiveBlending,
		transparent: true
	 });
//individual particles
for (var p = 0; p < particleCount; p++) {
	var pX = cube.position.x-4.5 + Math.random() * 2;
		pY = gaussian(.5,cube.position.y);
		pZ = gaussian(.5, cube.position.z);
		particle = new THREE.Vector3(pX, pY, pZ);
		particle.velocity = trafficVelocity.clone(),
		particle.lifeSpan = gaussian(20,60);
		particle.currentTick = 0;

	particles.vertices.push(particle);
}

var particleSystem = new THREE.ParticleSystem(
		particles, pMaterial);
particleSystem.position.z = cube.position.z;
particleSystem.sortParticles = true;
scene.add(particleSystem);



//begin background "stars"
var starCount = 3000,
	 starParticles = new THREE.Geometry(),
	 starMat = new THREE.ParticleBasicMaterial({
		 color: 0xffffff,
	 map: THREE.ImageUtils.loadTexture("images/particle.png"),
	 size: 1.5,
	 blending: THREE.AdditiveBlending,
	 transparent: true });
for (var p=0; p<starCount; p++){
	pX = gaussian(200,400);
	pY = gaussian(20,0);
	pZ = gaussian(5,-10);
	particle = new THREE.Vector3(pX,pY,pZ);
	particle.velocity = new THREE.Vector3(gaussian(.001,-.01));

	starParticles.vertices.push(particle);
}
var starSystem = new THREE.ParticleSystem(
		starParticles, starMat);
particleSystem.sortParticles = true;
scene.add(starSystem);


//Begin background particles
var bgColors = new Array();
var bgParticleCount = 400,
	 bgRows = 15,
	 bgCols = 80,
	 bgSize = 2,
	 bgPad = -.6,
	 bgParticles = new THREE.Geometry(),
	 bgpMaterial = new THREE.ParticleBasicMaterial({
		//color: 0xFFFFFF,
		size:bgSize,
		blending: THREE.AdditiveBlending,
		transparent: false,
		vertexColors: THREE.VertexColors
	 });
bgpMaterial.opacity = .2;

for (var r=0; r < bgRows; r++){
	for (var c=0; c < bgCols; c++){
		pX = (c*(bgSize + bgPad));
		pY = (r*(bgSize + bgPad));
		pZ = 0;
		particle = new THREE.Vector3(pX,pY,pZ);
		tempNum = Math.random() * .3 + .4;
		particleColor = new THREE.Color().setRGB(.1,tempNum,tempNum);
		particle.isAnimating = true;
		particle.currentFrame = 0;

		bgParticles.vertices.push(particle);
		bgParticles.colors.push(particleColor);
	}
}

var bgParticleSystem = new THREE.ParticleSystem(
	bgParticles, bgpMaterial);
bgParticleSystem.position.y = cube.position.y - (bgRows*(bgSize + bgPad))/2;
bgParticleSystem.position.x = cube.position.x - (bgCols*(bgSize + bgPad))/3;
bgParticleSystem.position.z = cube.position.z - 5;
//tempColor = trafficHolder[0].material.color
scene.add(bgParticleSystem);
bgGeometryClone = bgParticleSystem.geometry.clone();







var scoreText = "Score: " + score;
document.getElementById("scoreDiv");

camera.position.z = 30;


var timeToShoot = 0,
	 shotsOnScreen = 0,
	 shotCooldown = 0,
	 shotContainer = new Array();
var shotDirection = new THREE.Vector3(.5,0,0);
function shoot(){
	if (timeToShoot > 0 || shotsOnScreen > 0 || shotCooldown > 0)
		return;


//Begin shot particles

var shotCount = 400,
	 shotParticles = new THREE.Geometry(),
	 shotMaterial = new THREE.ParticleBasicMaterial({
		 color: 0xAA1111,
		 size : .2,
		 blending: THREE.AdditiveBlending,
		 transparent: true
	 });
for (var p = 0; p < shotCount; p++){
	particle = new THREE.Vector3(
			gaussian(.2, 0),
		  	gaussian(.2, 0),
		  	gaussian(.2, 0));
	vX = gaussian(.4,0);
	vY = gaussian(.4,0);
	vZ = gaussian(.4,0);
	particle.velocity = new THREE.Vector3(vX,vY,vZ);
	shotParticles.vertices.push(particle);
}

var shotParticleSystem = new THREE.ParticleSystem(
		shotParticles, shotMaterial);
shotParticleSystem.position.x = shipMesh.position.x + 3;
shotParticleSystem.position.y = shipMesh.position.y - 1;
scene.add(shotParticleSystem);
shotContainer.push(shotParticleSystem);
shotsOnScreen++;


}

function destroyCubes(){

	shotCooldown--;

	for (f=0; f < shotContainer.length; f++){
		tempSystem = shotContainer[f];

		shotHits = new Array();
		for (var t=0; t < trafficHolder.length; t++){

			var worldSystem = new THREE.Vector3().getPositionFromMatrix(tempSystem.matrixWorld);
			var worldCube = new THREE.Vector3().getPositionFromMatrix(trafficHolder[t].matrixWorld);

			
			if (Math.abs(worldSystem.x - worldCube.x) < 5 &&
				(Math.abs(worldSystem.y - worldCube.y) < 5)){

				var tempShotGeo = new THREE.CubeGeometry(10,10,10,10,10,10);
				for (var geo = 0; geo < tempShotGeo.vertices.length; geo++)
					tempShotGeo.vertices[geo].velocity = new THREE.Vector3(
							gaussian(.2,-.2),
							gaussian(.1,0),
							gaussian(.1,0));
				var tempShotMat = new THREE.ParticleBasicMaterial({
					color: 0xFF1111,
					size: 0.2,
					 opacity: .7,
					 transparent: true,
					blending: THREE.AdditiveBlending
				});
				var tempExplosion = new THREE.ParticleSystem(tempShotGeo,tempShotMat);
				tempExplosion.position = trafficHolder[t].position.clone();
				console.log(tempExplosion);
				scene.add(tempExplosion);
				explosionHolder.push(new THREE.ParticleSystem(tempShotGeo,tempShotMat));
				explosionLives.push(60);


				scene.remove(tempSystem);
				shotsOnScreen--;
				shotCooldown = 30;
				score += 20;
				shotContainer.splice(f,1);
				trafficHolder[t].position.x = gaussian(30,150);
				f--;
				break;
			} else {
				tempSystem.flagRemoval=false;
				trafficHolder[t].flagRemoval=false;
			}

		}
	}
}



function gameOver(){

	var scorediv = document.getElementById("scoreDiv");
	scorediv.innerHTML = "Score:" + score.toString();
	document.body.innerHTML = scorediv;





}


/* ******************************
 * Animation Loop
 * ******************************/
//we'll be checking for collisions every animation so make the caster once

var raycaster = new THREE.Raycaster();
	 nextDirection = new THREE.Vector3();
var frameWait = 3;
var hasModified = false;
var lifeFrame = 0;
var lifeCooldown = 0;



var lifeCur = bgCols;
var frameLife = 0,
	 lifeFrames = 120;
var isAnimatingLife = false;
var animateUntilCol = 0,
	 deadCols = 0;
function animLife(isDone){

	if (lifeCooldown <= 0)
		return;

	if (deadCols >= bgCols-1 ) { 
		gameOver;
		return;
	}

	animateUntilCol++
		if (animateUntilCol >= bgCols - deadCols) animateUntilCol = bgCols - deadCols;
	lifeCooldown--;
	if (lifeCooldown ==0){
		shipMat.transparent = false;
		shipMat.needsUpdate = true;
	}

	for (var c = 0; c < animateUntilCol && c < bgCols; c ++){
		for (var r = 0; r < bgRows; r++){
			tempVector = bgParticleSystem.geometry.vertices[c + r*bgCols];
			if (tempVector.currentFrame < lifeFrames){
				tempVector.y += Math.sin((tempVector.currentFrame/lifeFrames) * 2 * Math.PI) / 4;
				tempNum = Math.random() * .3 + .4;
				tempColor = new THREE.Color().setRGB(.1,tempNum,tempNum);
				bgParticleSystem.geometry.colors[c + r*bgCols] = tempColor;
			}

			tempVector.currentFrame++;
			if (c+r >= bgRows * bgCols){
			  	isAnimatingLife = false;
			}
		}
	}

	bgParticleSystem.geometry.verticesNeedUpdate = true;
	bgParticleSystem.geometry.colorsNeedUpdate = true;

	//begin wobbling ship
	
	if (shipMesh.wobble <= lifeFrames - 90 ){
		shipMesh.wobble += .1
		shipMesh.rotation.x = Math.sin(shipMesh.wobble) * Math.PI/4.2;
	} else{
		shipMesh.rotation.x = 0;
	}


}


var explosionHolder = new Array();
var noiseWait = 5;
function animate() {
	if (paused){
	setTimeout(100,requestAnimFrame(animate));
	return;
	}
	lastMouse--;
	score++;
	trafficVelocity.x -= .0001;

	if (shipLoaded && !hasModified){
		shipMesh.position = cube.position;
		shipMesh.position.x -= 3;
		shipMesh.rotation.y = Math.PI / 2;
		hasModified = true;
	}

	var pCount = particleCount;
	while (pCount--) {
		var particle = particles.vertices[pCount];

		if (particle.currentTick > particle.lifeSpan) {
		particle.x = gaussian(.2,cube.position.x-2.4);
		particle.y = gaussian(.5,cube.position.y);
		particle.velocity.x = -.2;
		particle.currentTick = 0;
		}

		particle.add(particle.velocity);
		particle.currentTick++;
	}

	//flag changes to particles
	particleSystem.geometry.verticesNeedUpdate = true;

	//animate stars
	var starC = starCount;
	while (starC--){
		var particle = starSystem.geometry.vertices[starC];
		particle.x += particle.velocity.x;
		particle.velocity.x -= gaussian(.0002,.0005);

		if (particle.x < -90){
			particle.x = gaussian(10,300);
			particle.velocity.x = gaussian(.0005,-.001);

		}
	}
	starSystem.geometry.verticesNeedUpdate = true;

	//explosions
	for (var i=0; i < explosionHolder.length; i++){
		tempExplode = explosionHolder[i];
		explosionLives[i]--;
		console.log(tempExplode);
		tempExplode.position.x -= 1;
		for (var s=0; s < tempExplode.geometry.vertices.length; s++){

			part = tempExplode.geometry.vertices[s];

			part.x += part.velocity.x;
			part.y += part.velocity.y;
			part.z += part.velocity.z;


		}
		if (explosionLives[i] <= 0) {
			//tempExplode.geometry.vertices.splice(0,99999);
			//scene.remove(tempExplode);
			//explosionHolder.splice(i,1);
			//explosionLives.splice(i,1);
			//i--;
			tempExplode.position.y = 300;
		} 
		tempExplode.geometry.verticesNeedUpdate = true;
		
	}




	//animate shots

	for (var i=0; i < shotContainer.length;i++){
		var tempSystem = shotContainer[i];
		for (var p=0; p < shotContainer[i].geometry.vertices.length; p++){
				tempParticle = tempSystem.geometry.vertices[p];

				if (tempParticle.x <= 400){
					tempParticle.x += Math.sin(tempParticle.velocity.x++)/8;
					tempParticle.y += Math.sin(tempParticle.velocity.y++)/8;
					tempParticle.z += Math.sin(tempParticle.velocity.z++)/8;
				}
		}
	if (tempSystem.position.x > 100){
		scene.remove(tempSystem);
		shotsOnScreen--;
		shotCooldown = 0;
		shotContainer.splice(i,1);
		i--;

	}
	tempSystem.position.sub(trafficVelocity);
	tempSystem.geometry.verticesNeedUpdate = true;
	
	}


	//make dead columns have "white noise"
	noiseWait--;
	
	if (noiseWait <= 0){
		for (var c = bgCols - deadCols; c < bgCols; c++){
			for (var r = 0; r < bgRows; r++){
				var tempColor = Math.random() * .7;
				tempColor = new THREE.Color().setRGB(tempColor, tempColor, tempColor);
				bgParticleSystem.geometry.colors[c + r*bgCols] = tempColor;
			}
		}

		noiseWait = 5;
		bgParticleSystem.geometry.colorsNeedUpdate = true;
	}

	//animate traffic
	var tCount = trafficHolder.length;
	while (tCount--) {
		var tempCube = trafficHolder[tCount];

		if (tempCube.position.x < -60){
			tempCube.position.x = gaussian(trafficWidth,80);
		} else {

			for (var rayIndex=0; rayIndex < 5; rayIndex++){
				posX = tempCube.position.x;
				posY = (tempCube.position.y+(trafficHeight/2.0)) - (rayIndex)*(trafficHeight/4.0);
				posZ = tempCube.position.z;
				tempPos = new THREE.Vector3(posX,posY,posZ);
				raycaster.set(tempPos,trafficVelocity.clone());
				collision = raycaster.intersectObject(cube,false);
				if (collision.length > 0 && collision[0].distance <= trafficWidth/2){
					if (lifeCooldown <= 0){
					  	isAnimatingLife = true;
						lifeCooldown = lifeFrames + 200;
						for (var i=0; i< bgRows * bgCols; i++)
							bgParticleSystem.geometry.vertices[i].currentFrame = 0;
						animateUntilCol = 0;
						deadCols+=10;
						shipMesh.wobble = 0;
						shipMat.transparent = true;
						shipMat.opacity = .4;
						shipMat.needsUpdate = true;
					}
				}
			}
		}

		tempCube.position.add(tempCube.velocity);
	}


	if (shipLoaded) shipMesh.scale.set(.3,.5,.5);

  renderer.render(scene, camera);
  requestAnimFrame(animate);
	destroyCubes();
	animLife();
}
requestAnimFrame(animate);

function gaussian(stdDev, mean){
	i = Math.random() * 2 -1 + Math.random() * 2 - 1 + Math.random() * 2 - 1 +
		Math.random() * 2 - 1;
	i = i * stdDev + mean;
	return i;
}


/* ******************************
 * Event Handlers
 * ******************************/
var tempDown = 0;
tempDown.x = 0;
tempDown.y = 0;
var called = false;
function onDown(e){
	tempDown = 1;
	tempDown.x = e.clientX;
	tempDown.y = e.clientY;
}

function onUp(e){
	tempDown = 0;
	tempDown.x = null;
	tempDown.y = null;
}

function mouseClick(e){
	if (tempDown && !called){
		called = true;
	}
	else if (!tempDown && called){
		called = false;
	}
}

function unproject(x,y){
	var projector = new THREE.Projector

	var vector = new THREE.Vector3(
		(x  / window.innerWidth ) * 2 - 1,
		-(y / window.innerHeight ) * 2 + 1,
		0 );

	projector.unprojectVector( vector, camera );
	var dir = vector.sub( camera.position ).normalize();
	var ray = new THREE.Raycaster( camera.position, dir );
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	return pos;
}

var mouseMoved = false;
var lastMouse = 0;
var lastX = lastY = -9999;
var cubeCaster = new THREE.Raycaster();
var collisionCaught = false,
	 unfinishedCollision = false;
function mouseMove(e){

	if (paused || lastMouse > 0 || (lastX = e.clientX && lastY == e.clientY)) return;
	var now = e.timeStamp;

	lastMouse=1;
	cube.position.y = unproject(e.clientX,e.clientY).y;
	if (cube.position.y < -19) cube.position.y = -19;
	if (cube.position.y >19) cube.position.y =19;

	if (lifeCooldown > 0 || unfinishedCollision) return;

	for (var i=0;i<cube.geometry.vertices.length;i++){
		cubeCaster.set(unproject(e.clientX,e.clientY),
				cube.geometry.vertices[i].clone().add(cube.position).sub(cube.position));
		collideArray = cubeCaster.intersectObjects(trafficHolder,true);

		if (collideArray.length > 0){
			for (var j = 0; j < collideArray.length; j++){
				if (collideArray[j].distance <
						cube.position.distanceTo(cube.geometry.vertices[i].add(cube.position))){
					if (lifeCooldown <= 0 && !collisionCaught){
						collisionCaught = true;
					  	isAnimatingLife = true;
						lifeCooldown = lifeFrames + 200;
						for (var i=0; i< bgRows * bgCols; i++)
							bgParticleSystem.geometry.vertices[i].currentFrame = 0;
						animateUntilCol = 0;
						deadCols+=10;
						shipMesh.wobble = 0;
						unfinishedCollision = false;
					}
				}
			}
		}
	}

	collisionCaught = false;
	bgParticleSystem.position.y = cube.position.y - (bgRows * (bgSize+bgPad))/2;
	mouseMoved = true;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onClick(e){
	if (paused) return;
	shoot();
}
function pauseGame(e){
	paused = !paused;
}

document.addEventListener("mousemove",mouseMove, false);
document.onkeypress = pauseGame;
window.addEventListener("resize", onWindowResize, false);
window.addEventListener("click", onClick, false);
//make sure there is no curosor
document.onselectstart = function() {
	return false;
};
/* ******************************
 * Render function 
 * *****************************/
function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}
//render();
