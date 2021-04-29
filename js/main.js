let Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};


// run function init() when whole dom has loaded

window.addEventListener('load', init, false);

function init() {
	// set up the scene, the camera and the renderer
	createScene();

	// add the lights
	createLights();

	// add the objects
	// createPlane();
	createSea();
	// createSky();

    //add the listener
	// document.addEventListener('mousemove', handleMouseMove, false);
	
	// start a loop that will update the objects' positions 
	// and render the scene on each frame
	loop();
}


// create scene
let scene = ""
let camera = ""
let fieldOfView = 0
let aspectRatio = 0
let nearPlane = 0
let farPlane = 0
let screenHeight = 0
let screenWidth = 0
let renderer = ""
let container = ""


function createScene() {
	// Get the width and the height of the screen,
	screenHeight = window.innerHeight;
	screenWidth = window.innerWidth;

	// Create scene
	scene = new THREE.Scene();

	// Add fog effect to the scene for depth perception - Fog( color , near distance, far distance )
	scene.fog = new THREE.Fog(0x322548, 100, 950);
	
	// Create camera
	aspectRatio = screenWidth / screenHeight;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	
	// Set position of the camera
	camera.position.x = 0;
	camera.position.z = 300;
	camera.position.y = 50;
	
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		// Allow transparency to show the gradient background in the CSS
		alpha: true, 
		// Activate the anti-aliasing for smooth graphics

		antialias: true 
	});

    	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setSize(screenWidth, screenHeight);
	
	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	
	// Add the DOM element of the renderer to the 
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	
	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	screenHeight = window.innerHeight;
	screenWidth = window.innerWidth;
	renderer.setSize(screenWidth, screenHeight);
	camera.aspect = screenWidth / screenHeight;
	camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;

function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}



// First let's define a Sea object :
class Sea {
	constructor () {

   
	// create the geometry (shape) of the cylinder;
	// the parameters are: 
	// radius top, radius bottom, height, number of segments on the radius, number of segments vertically
	var geom = new THREE.SphereGeometry(600,32,32);
	
	// rotate the geometry on the x axis
	// geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	
	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:true,
		opacity:.6,
		shading:THREE.FlatShading,
	});

	// To create an object in Three.js, we have to create a mesh 
	// which is a combination of a geometry and some material
	this.mesh = new THREE.Mesh(geom, mat);

	// Allow the sea to receive shadows
	this.mesh.receiveShadow = true; 
}
}

// Instantiate the sea and add it to the scene:

var sea;

function createSea(){
	sea = new Sea();

	// push it a little bit at the bottom of the scene
	sea.mesh.position.y = -600;

	// add the mesh of the sea to the scene
	scene.add(sea.mesh);
}



function loop(){
	// Rotate the propeller, the sea and the sky
	// airplane.propeller.rotation.x += 0.3;
	sea.mesh.rotation.x += .005;
	// sky.mesh.rotation.z += .01;

	// update the plane on each frame
	// updatePlane();
	
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}