jQuery(document).ready(function() {

	function setupSurface() {

		// Define the curve
		var closedSpline = new THREE.CatmullRomCurve3( [
		    new THREE.Vector3( -60, -100,  60 ),
		    new THREE.Vector3( -60,   20,  60 ),
		    new THREE.Vector3( -60,  120,  60 ),
		    new THREE.Vector3(  60,   20, -60 ),
		    new THREE.Vector3(  60, -100, -60 )
		] );
		closedSpline.type = 'catmullrom';
		closedSpline.closed = true;

		// Set up settings for later extrusion
		var extrudeSettings = {
		    steps           : 100,
		    bevelEnabled    : false,
		    extrudePath     : closedSpline
		};

		// Define a triangle
		var pts = [], count = 3;
		for ( var i = 0; i < count; i ++ ) {
		    var l = 20;
		    var a = 2 * i / count * Math.PI;
		    pts.push( new THREE.Vector2 ( Math.cos( a ) * l, Math.sin( a ) * l ) );
		}
		var shape = new THREE.Shape( pts );

		var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

		var material = new THREE.MeshLambertMaterial({ color: 0xb00000, wireframe: false } );
		var mesh = new THREE.Mesh( geometry, material );

		scene.add(mesh)

	}

	function getRandomColor() {
	  var letters = '0123456789ABCDEF';
	  var color = '#';
	  for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
	  }
	  return color;
	}

	function generateTexture() {

		var size = 512;

		// create canvas
		canvas = document.createElement( 'canvas' );
		canvas.width = size;
		canvas.height = size;

		// get context
		var context = canvas.getContext( '2d' );

		// draw gradient
		context.rect( 0, 0, size, size );
		var gradient = context.createLinearGradient( 0, 0, size, size );
		gradient.addColorStop(0, getRandomColor()); 
		gradient.addColorStop(1, getRandomColor()); 
		context.fillStyle = gradient;
		context.fill();

		return canvas;

	}

	/**
	 * Inputs
	 **/

	var object = jQuery('#object');
	var rotation = jQuery('#rotation');
	var scaling = jQuery('#scaling');

	var translation = jQuery('#translation');
	var fog 		= jQuery('#fog');
	var light 		= jQuery('#light');
	var lightX 		= jQuery('#lightX');
	var lightY 		= jQuery('#lightY');
	var lightZ 		= jQuery('#lightZ');
	var distance 	= jQuery('#distance');
	var angle 		= jQuery('#angle');
	var penumbra 	= jQuery('#penumbra');
	var decay 		= jQuery('#decay');



	/**
	 * Scene & Skybox
	 **/

	var loader = new THREE.CubeTextureLoader();
	loader.setPath( 'textures/' );

	var textureCube = loader.load( [
		'skybox/xpos.png', 'skybox/xneg.png',
		'skybox/ypos.png', 'skybox/yneg.png',
		'skybox/zpos.png', 'skybox/zneg.png',
	] );

	var scene = new THREE.Scene();
	scene.background = textureCube;

	scene.fog = new THREE.FogExp2( 0xffffff, 0.0025 );

	var geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
	texture = THREE.ImageUtils.loadTexture( "textures/ground/1.jpg" );
	texture.wrapS = THREE.RepeatWrapping; 
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 4, 4 ); 

	setupSurface();

	var mat = new THREE.MeshLambertMaterial({ map : texture });
	
	var plane = new THREE.Mesh(geo, mat);
	plane.position.x = -50;
	plane.position.y = -50;
	plane.position.z = -50;

	scene.add(plane);

	plane.rotateX( - Math.PI / 2);

	console.log(scene);

	var camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 0.1, 1000 );
	var renderer = new THREE.WebGLRenderer();

	varcontrols = new THREE.OrbitControls( camera, renderer.domElement );

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	
	var texture = new THREE.Texture( generateTexture() );
	texture.needsUpdate = true; // important!

	var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true } )

	var obj = new THREE.Mesh( geometry, material );
	console.log(obj);
	scene.add( obj );


	window.spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 1, 2, 1 );

	spotLight.castShadow = true;

	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;

	spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 100;
	spotLight.shadow.camera.fov = 100;

	scene.add( spotLight );

	camera.position.z = 10;

	var scalingDir = 0.05;
	var dirX = 0.05, dirY = 0.06, dirZ = 0.01;

	var FrameID = false;

	var lightRotateX = 0, lightRotateY = 0, lightRotateZ = 0;

	var iter = 0;

	var animate = function (debug = false) {

		requestAnimationFrame( animate );

		spotLight.distance 	= distance.val();
		spotLight.angle 	= angle.val();
		spotLight.penumbra 	= penumbra.val();
		spotLight.decay 	= decay.val();

		if(++iter === 100) {
			var texture = new THREE.Texture( generateTexture() );
			texture.needsUpdate = true; // important!
			var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true } )

			obj.material = material;
			iter = 0;
		}

		scene.fog = null;
		if( fog.is(':checked') ) {
			scene.fog = new THREE.FogExp2( 0xffffff, 0.0025 );
		}

		scene.remove(spotLight);
		if(light.is(':checked')) {

			scene.add(spotLight)
			spotLight.position.x = lightX.val();
			spotLight.position.y = lightY.val();
			spotLight.position.z = lightZ.val();

		}

		if( rotation.is(':checked') ) {
			obj.rotation.x += 0.01;
			obj.rotation.y += 0.01;
		}

		if( scaling.is(':checked') ) {

			if(obj.scale.x < 0.5 || obj.scale.x > 3) {
				scalingDir *= -1;
			}

			obj.scale.x += scalingDir;
			obj.scale.y += scalingDir;
			obj.scale.z += scalingDir;

		}

		if( translation.is(':checked') ) {

			obj.position.x += dirX;
			obj.position.y += dirY;
			obj.position.z += dirZ;

			if(obj.position.x > 20 || obj.position.x < -20) {
				dirX *= -1;
			}
			if(obj.position.y > 20 || obj.position.y < -20) {
				dirY *= -1;
			}
			if(obj.position.z > 20 || obj.position.z < -20) {
				dirZ *= -1;
			}

		}

		renderer.render(scene, camera);
	};

	object.change(function() {
		cancelAnimationFrame(animate)

		scene.remove(obj)

		var texture = new THREE.Texture( generateTexture() );
		texture.needsUpdate = true; // important!

		var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true } )

		if( object.val() === 'cube' ) {

			geometry = new THREE.BoxGeometry( 1, 1, 1 );
			obj = new THREE.Mesh( geometry, material );

			scene.add( obj );

		}

		if( object.val() === 'tetrahedron' ) {

			geometry = new THREE.TetrahedronGeometry( 1, 0 );
			obj = new THREE.Mesh( geometry, material );

			scene.add( obj );

		}

		if( object.val() === 'sphere' ) {

			geometry = new THREE.SphereGeometry( 1, 0 );
			obj = new THREE.Mesh( geometry, material );

			scene.add( obj );

		}

		animate(true);		

	})

	animate();

});