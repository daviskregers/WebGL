jQuery(document).ready(function() {

	var object = jQuery('#object');
	var rotation = jQuery('#rotation');
	var scaling = jQuery('#scaling');
	var translation = jQuery('#translation');

	var texture = new THREE.TextureLoader().load( "./sky.jpg" );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 4, 4 );

	var scene = new THREE.Scene();
	scene.background = texture;

	console.log(scene);

	var camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 0.1, 1000 );
	var renderer = new THREE.WebGLRenderer();

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var obj = new THREE.Mesh( geometry, material );
	console.log(obj);
	scene.add( obj );


	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 1, 2, 1 );

	spotLight.castShadow = true;

	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;

	spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 100;
	spotLight.shadow.camera.fov = 100;

	scene.add( spotLight );

	camera.position.z = 10;

	var scalingDir = 0.001;
	var dirX = 0.05, dirY = 0.06, dirZ = 0.01;

	var FrameID = false;

	var animate = function (debug = false) {

		if(debug === true) {
			console.log(obj)
			console.log(light)
			console.log(light2)
		}

		requestAnimationFrame( animate );

		if( rotation.is(':checked') ) {
			obj.rotation.x += 0.01;
			obj.rotation.y += 0.01;
		}

		if( scaling.is(':checked') ) {

			if(obj.scale.x < 0.5 || obj.scale.x > 1.5) {
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

			if(obj.position.x > 5 || obj.position.x < -5) {
				dirX *= -1;
			}
			if(obj.position.y > 5 || obj.position.y < -5) {
				dirY *= -1;
			}
			if(obj.position.z > 5 || obj.position.z < -5) {
				dirZ *= -1;
			}

		}

		renderer.render(scene, camera);
	};

	object.change(function() {
		cancelAnimationFrame(animate)

		scene.remove(obj)

		if( object.val() === 'cube' ) {

			geometry = new THREE.BoxGeometry( 1, 1, 1 );
			material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			obj = new THREE.Mesh( geometry, material );

			scene.add( obj );

		}

		if( object.val() === 'pyramid' ) {

			geometry = new THREE.TetrahedronGeometry( 1, 0 );
			material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			obj = new THREE.Mesh( geometry, material );

			scene.add( obj );

		}

		if( object.val() === 'sphere' ) {

			geometry = new THREE.SphereGeometry( 1, 0 );
			material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
			obj = new THREE.Mesh( geometry, material );

			scene.add( obj );

		}

		animate(true);		

	})

	animate();

});