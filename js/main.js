

let Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
    planetColour: 0xf98548,
    craterColour: 0xb31f64
};


// run function init() when whole dom has loaded

window.addEventListener('load', init, false);

function init() {
	// set up the scene, the camera and the renderer
	createScene();

	// add the lights
	createLights();

	// add the objects
	createCosmo()
	createPlanet()
    createWorldCraters()
    createSpots()

    // add mouse listener to
    // move dog left and right when mouse moves
	document.addEventListener('mousemove', handleMouseMove, false);
    // make dog jump when mouse click
    document.addEventListener('mousedown', handleMouseDown, false);
	
	// start a loop that will update the objects' positions and rerender the scene on each frame
	loop();
}


// Scene variables
let scene 
let camera 
let fieldOfView 
let aspectRatio 
let nearPlane 
let farPlane 
let screenHeight
let screenWidth 
let renderer
let container
let hemisphereLight
let shadowLight

// Object variables
let planetRadius = 26
let pi = Math.PI
let laneDistance = 1
let moveRotation = Math.asin(laneDistance/planetRadius)
let spehericalCorrection = planetRadius - Math.cos(moveRotation) * planetRadius
let planet 
let cosmo 
let crater 

// Game variables
let gameStatus = "paused"
let hasCollided = false
let startTime
let currentTime
let planetRollingSpeed = 0.008
let pathAngleValues = [pi/2 - Math.asin(laneDistance / planetRadius), pi / 2, pi / 2 + Math.asin(laneDistance / planetRadius)]
let nPathCraters = 60
let nWorldCraters = 60
let cratersInPath = []
let cratersCreated = []
let craterReleaseInterval = 1000
let lastCraterReleaseTime = 0
let spherical = new THREE.Spherical();
let scoreText = document.querySelector("#distValue")
let score = 0
let level = 1
let levelText = document.querySelector('#levelValue')
let gameOverText = document.querySelector('#game-over')
gameOverText.style.visibility = "hidden"




// Create scene
function createScene() {
    
	// Get the width and the height of the screen,
	screenHeight = window.innerHeight;
	screenWidth = window.innerWidth;

	// Create scene
	scene = new THREE.Scene();

	// Add fog effect to the scene for depth perception - Fog( color , near distance, far distance )
	scene.fog = new THREE.FogExp2(0xa21b8e, 0.1);

	
	// Create camera
	aspectRatio = screenWidth / screenHeight;
	fieldOfView = 60;
	nearPlane = 0.1;
	farPlane = 1000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	
	// Set position of the camera
	camera.position.z = 6.5;
	camera.position.y = 2.5;

    //Camera position to test
	// camera.position.z = 50;
	// camera.position.y = -5;
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		// Allow transparency to show the gradient background in the CSS
		alpha: true, 
		// Activate the anti-aliasing for smooth graphics

		antialias: true 
	});

    // Set renderer size to fit entire screen
	renderer.setSize(screenWidth, screenHeight);
	
	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	
	// Add the DOM element of the renderer to #world html
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	
	// Listen for screen resize
	window.addEventListener('resize', handleWindowResize, false);
}

// Handle screen resize
function handleWindowResize() {
	// update height and width of the renderer and the camera
	screenHeight = window.innerHeight;
	screenWidth = window.innerWidth;
	renderer.setSize(screenWidth, screenHeight);
	camera.aspect = screenWidth / screenHeight;
	camera.updateProjectionMatrix();
}

// Handle mouse click - dog jump
function handleMouseDown(event){
    if (gameStatus == "paused") {
        gameStatus = "playing"
        // Start timer to keep track of game
        startTime = new Date()
    }
    // else if (gameStatus == "gameOver") {
        
    // }
    else {
        cosmo.jump()
    }
  }

// Handle mouse movement - dog move left and right

function handleMouseMove(event) {
   cosmo.move(event.clientX)
}




function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(12, 6, -7);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -26;
	shadowLight.shadow.camera.right = 26;
	shadowLight.shadow.camera.top = 26;
	shadowLight.shadow.camera.bottom = -26;
	shadowLight.shadow.camera.near = 0.1;
	shadowLight.shadow.camera.far = 100;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

//OBJECTS

// Template to create Planet


class Planet {
	
    constructor () {
	    // create the geometry (shape) of the planet; Sphere
        let widthSegments = 60
        let heightSegments = 60
        

        let sandGeom = new THREE.SphereGeometry(planetRadius, widthSegments, heightSegments)
        let sandMat = new THREE.MeshPhongMaterial({
            color:Colors.planetColour,
            specular:0x000000,
            shininess:1,
            transparent:true,
            opacity:.5
        })

        let sand = new THREE.Mesh(sandGeom, sandMat)
        sand.receiveShadow = true

       

	    let groundGeom = new THREE.SphereGeometry(planetRadius - 0.02, widthSegments, heightSegments);
	
	    // rotate the geometry on the x axis
	    // geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	
	    // create the material 
	    let groundMat = new THREE.MeshBasicMaterial({
		    color:Colors.planetColour,
		    // transparent:true,
		    // opacity:.6,
		    // shading:THREE.FlatShading,
	    });
        	    // create mesh object
	    this.mesh = new THREE.Mesh(groundGeom, groundMat);

	    // Allow mesh to receive shadow
	    this.mesh.receiveShadow = false; 
        this.mesh.add(sand)


    }
    //     var vertexIndex;
	// var vertexVector= new THREE.Vector3();
	// var nextVertexVector= new THREE.Vector3();
	// var firstVertexVector= new THREE.Vector3();
	// var offset= new THREE.Vector3();
	// var currentTier=1;
	// var lerpValue=0.5;
	// var heightValue;
	// var maxHeight=0.07;
	// for(var j=1;j<heightSegments-2;j++){
	// 	currentTier=j;
	// 	for(var i=0;i<widthSegments;i++){
	// 		vertexIndex=(currentTier*widthSegments)+1;
	// 		vertexVector=geom.vertices[i+vertexIndex].clone();
	// 		if(j%2!==0){
	// 			if(i==0){
	// 				firstVertexVector=vertexVector.clone();
	// 			}
	// 			nextVertexVector=geom.vertices[i+vertexIndex+1].clone();
	// 			if(i==widthSegments-1){
	// 				nextVertexVector=firstVertexVector;
	// 			}
	// 			lerpValue=(Math.random()*(0.75-0.25))+0.25;
	// 			vertexVector.lerp(nextVertexVector,lerpValue);
	// 		}
	// 		heightValue=(Math.random()*maxHeight)-(maxHeight/2);
	// 		offset=vertexVector.clone().normalize().multiplyScalar(heightValue);
	// 		geom.vertices[i+vertexIndex]=(vertexVector.add(offset));
	// 	}
	// }

}

class Cosmo {
    constructor () {
        // holds action of object
        this.status = "running"
        this.runningCycle = 0
        this.lane = "center"
        // create object to hold parts
        this.mesh = new THREE.Object3D()
        this.mesh.name = "cosmo"
        this.mesh.rotation.y = Math.PI
        // this.mesh.position.z = -500
        // create torso
        let torsoGeom = new THREE.BoxGeometry(0.25,0.25,0.6)
        let torsoMat = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading})
        this.torso = new THREE.Mesh(torsoGeom, torsoMat)
        this.torso.castShadow = true;
        this.torso.receiveShadow = true;
        this.mesh.add(this.torso)

        // create front right leg
        let legFRGeom = new THREE.BoxGeometry(0.1,0.4,0.1)
        // shift origin to left
        legFRGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0.05,0,-0.05));
        let legFRMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading})
        this.legFR = new THREE.Mesh(legFRGeom, legFRMat)
        this.legFR.position.x = 0.125
        this.legFR.position.y = -0.2
        this.legFR.position.z = 0.3
        this.legFR.castShadow = true;
        this.legFR.receiveShadow = true;
        this.torso.add(this.legFR)

        // create front left leg
        this.legFL = this.legFR.clone()
        this.legFL.position.x = - this.legFR.position.x - 0.1
        this.legFL.castShadow = true;
        this.legFL.receiveShadow = true;
        this.torso.add(this.legFL)

        // create back right leg
        this.legBR = this.legFR.clone()
        this.legBR.position.z = -0.225
        this.legBR.castShadow = true;
        this.legBR.receiveShadow = true;
        this.torso.add(this.legBR)

        // create back left leg
        this.legBL = this.legFL.clone()
        this.legBL.position.z = -0.225
        this.legBL.castShadow = true;
        this.legBL.receiveShadow = true;
        this.torso.add(this.legBL)

        // create head
        let headGeom = new THREE.BoxGeometry(0.15,0.15,0.25)
        let headMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading})
        this.head = new THREE.Mesh(headGeom, headMat)
        this.head.position.x = 0
        this.head.position.y = 0.2
        this.head.position.z = 0.375
        this.head.castShadow = true;
        this.head.receiveShadow = true;
        this.torso.add(this.head)

        // create tail
        let tailGeom = new THREE.BoxGeometry(0.04, 0.3, 0.04 )
        let tailMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading})
        this.tail = new THREE.Mesh(tailGeom, tailMat)
        this.tail.position.y = 0.2
        this.tail.position.z = -0.25
        this.tail.rotation.x = -pi /8
        this.torso.add(this.tail)
    }

    // Method for jumping
    jump() {
    // dont do anything if already jumping
        if (this.status == "jumping") {
            return
        }
        this.status = "jumping"
        this.mesh.position.y += 1
        let _this = this
        setTimeout(function(){
            _this.mesh.position.y -= 1
            _this.status = "running"
        }, 500)
    console.log(cosmo.status)
    }

    // Move Object left and right based on mouse
    move(mousePosition) {
        
        if (this.status == "jumping" || gameStatus == "paused") {
            return
        }
        else if (mousePosition < screenWidth/3 && this.lane == "center") {
            this.mesh.position.x -= laneDistance
            this.mesh.position.y -= spehericalCorrection
            this.mesh.rotation.z = -moveRotation
            this.lane = "left"
            console.log("moving left")
        }
        else if (mousePosition > screenWidth/3 && this.lane == "left") {
            this.mesh.position.x += laneDistance
            this.mesh.position.y += spehericalCorrection 
            this.mesh.rotation.z = 0
            this.lane = "center"
            console.log("moving back to center")
        }
        else if (mousePosition > 2 * screenWidth/3 && this.lane == "center") {
            this.mesh.position.x += laneDistance
            this.mesh.rotation.z = moveRotation
            this.mesh.position.y -= spehericalCorrection 
            this.lane = "right"
            console.log("moving right")
        }
        else if ((mousePosition > screenWidth/3) && (mousePosition < 2 * screenWidth/3) && (this.lane == "right")) {
            this.mesh.position.x = 0
            this.mesh.position.y += spehericalCorrection 
            this.mesh.rotation.z = 0
            this.lane = "center"
            console.log("moving from right to center")
        }
    }
}

class Crater {
    constructor () {
        this.mesh = new THREE.Object3D()
        let craterGeom = new THREE.CylinderGeometry( 0.5, 0.8, 0.7, 40 )
        let craterMat = new THREE.MeshLambertMaterial({color:Colors.craterColour})
        this.crater = new THREE.Mesh(craterGeom, craterMat)
        this.mesh.add(this.crater)
        // this.mesh.position.y = planetRadius
    }
}

class Spots {
    constructor() {
        this.mesh = new THREE.Object3D()
        let spotGeom = new THREE.CylinderGeometry( 7, 7, 0.7, 40 )
        let spotMat = new THREE.MeshLambertMaterial({color:Colors.craterColour})
        this.spot = new THREE.Mesh(spotGeom, spotMat)
        this.mesh.add(this.spot)

    }
}


// Instantiate Planet and add to scene



function createPlanet(){
	planet = new Planet();

	// push it a little bit at the bottom of the scene
	planet.mesh.position.y = -24;
    // rotate planet so that craters can be added easily - spherical coordinates work around
    planet.mesh.rotation.z = pi /2;
	// add the mesh of the sea to the scene
	scene.add(planet.mesh);
}

function createSpots() {
    planetSpots = new Spots()
    planetSpots.mesh.position.y = planetRadius
}

function createCosmo(){
    cosmo = new Cosmo();
    // cosmo.mesh.scale.set(.005,.005,.005)

    let cosmoPositionZ = 4.5
    cosmo.mesh.position.y = -planetRadius + 2.35 + Math.sqrt(Math.pow(planetRadius,2) - Math.pow(cosmoPositionZ,2))
    // cosmo.mesh.position.y = 2;
    console.log( Math.sqrt(Math.pow(planetRadius,2) - Math.pow(cosmoPositionZ,2)))
    cosmo.mesh.position.z = cosmoPositionZ
    let positionAngle = Math.asin(cosmoPositionZ/planetRadius)
    cosmo.mesh.rotation.x = positionAngle
    
    scene.add(cosmo.mesh);
  }


  function addCraterToPath() {
      let newCrater
      for (let i = 0; i < nPathCraters; i++) {
            newCrater = new Crater()
            cratersCreated.push(newCrater.mesh)
            // console.log(newCrater.mesh)
        }
      if (cratersCreated.length == 0) return;
      let addCrater = cratersCreated.pop()
      addCrater.visible = true
      cratersInPath.push(addCrater)
      let randomPath = Math.floor(Math.random() * 3)
      
      // phi controls the lane 
      let phi = pathAngleValues[randomPath]
      // theta controls how far back in the sphere the crater is added on
       
      let theta = - planet.mesh.rotation.x + 4
   
      spherical.set( planetRadius, phi, theta )
      console.log("adding craters")
    //   spherical.set( planetRadius-0.3, pathAngleValues[randomPath], - planet.mesh.rotation.x -4 );
      addCrater.position.setFromSpherical( spherical );
    //   let rollingPlanetVector = planet.mesh.position.clone().normalize();
    //   let craterVector = addCrater.position.clone().normalize();
    //   addCrater.quaternion.setFromUnitVectors(craterVector,rollingPlanetVector);
    //   addCrater.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;

      let vec = addCrater.position.clone();
      let axis = new THREE.Vector3(0,1,0);
      addCrater.quaternion.setFromUnitVectors(axis, vec.clone().normalize());

    //   clock.start()
      planet.mesh.add(addCrater);
      
    startTime = new Date()
    }

  // add craters outside path for effect  
  function createWorldCraters(){
    
    let worldAngles = []
    for (let i = 0; i < nWorldCraters; i++) {   
        let newCrater = new Crater
        let pathAngle = Math.asin(laneDistance / planetRadius) + 0.1
        let randomRightAngle = (pi / 2 + pathAngle) + (Math.random() * 0.1)

        let randomLeftAngle = (pi / 2 - pathAngle) - (Math.random() * 0.1)
        worldAngles = [randomLeftAngle, randomRightAngle]
        // worldAngles = [pi + pathAngle, (2 * pi) - pathAngle]
        let randomPlacement = Math.floor(Math.random() * 2)
        
        // phi controls left or right placement
        let phi = worldAngles[randomPlacement]
        // theta places craters evenly around whole planet
        let theta = (2 * pi / nWorldCraters) * i
        spherical.set( planetRadius, phi, theta )
        newCrater.mesh.position.setFromSpherical( spherical );
        
        let vec = newCrater.mesh.position.clone();
        let axis = new THREE.Vector3(0,1,0);
        newCrater.mesh.quaternion.setFromUnitVectors(axis, vec.clone().normalize());
        newCrater.mesh.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
        // // //   clock.start()
 
        planet.mesh.add(newCrater.mesh);
    }
  }

// Remove craters outside of game play
function removeCrater() {
    let subjectCrater
    let craterPos = new THREE.Vector3()
    let cratersToRemove = []
    cratersInPath.forEach ( (element, index) => {
        subjectCrater = cratersInPath[index]
        craterPos.setFromMatrixPosition( subjectCrater.matrixWorld )
		if(craterPos.z > 6 && subjectCrater.visible){//gone out of our view zone
			cratersToRemove.push(subjectCrater)
        }
    })
    cratersToRemove.forEach( ( element, index ) => {
		subjectCrater = cratersToRemove[ index ];
		let fromWhere = cratersInPath.indexOf(subjectCrater);
		cratersInPath.splice(fromWhere,1);
		cratersCreated.push(subjectCrater);
		subjectCrater.visible=false;
		console.log("remove crater");
    })
}


// Game Play

// Check for collision with crater
function collisionCheck(){
    let subjectCrater
    let craterPos = new THREE.Vector3()
    let cratersToRemove = []
    cratersInPath.forEach ( (element, index) => {
        subjectCrater = cratersInPath[index]
        craterPos.setFromMatrixPosition( subjectCrater.matrixWorld )
        if ( craterPos.distanceTo(cosmo.mesh.position) <= 1){
            console.log("collided")
            hasCollided = true
            gameStatus = "gameOver"
            gameOverText.style.visibility = "visible"

        }
    })
}

function loop(){
	// Rotate the propeller, the sea and the sky
	// airplane.propeller.rotation.x += 0.3;
    
    if (gameStatus == "playing") {
        planet.mesh.rotation.x += planetRollingSpeed;
        
  
	// sky.mesh.rotation.z += .01;

	// update the plane on each frame
	// updatePlane()
    currentTime = new Date()
    let elapsedTime = currentTime - startTime
//    console.log(elapsedTime)
        if (elapsedTime > craterReleaseInterval) {
            // console.log(planet.mesh.rotation.x)
            addCraterToPath()
        }
        collisionCheck()
        removeCrater()
        score += 1
        // console.log(score)
        scoreText.innerText = score

        // Make game more difficult as level increases

        switch (score) {
            case 500:
                level = 2
                craterReleaseInterval /= 2
                break;
            case 1000:
                level = 3
                craterReleaseInterval /= 2
                break;
            case 1500:
                level = 4
                craterReleaseInterval /= 2
                break;
            case 2000:
                level = 5
                craterReleaseInterval /= 2
                break;
          }
          levelText.innerText = level
    }
    
	
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
    
}

//