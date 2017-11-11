window.webgl = {

	init: function() {

		this.canvas = document.getElementById('canvas');
        this.gl = this.canvas.getContext('experimental-webgl');
        this.angle = 0;
        this.scale = 1;
        this.scaleDir = 0;

        this.rotationEl = document.getElementById('rotation');
        this.scalingEl = document.getElementById('scaling');
        this.translationEl = document.getElementById('translation');
        this.speedEl = document.getElementById('speed');
        this.colorEl = document.getElementById('color');

        this.drEl = document.getElementById('dr');
        this.dgEl = document.getElementById('dg');
        this.dbEl = document.getElementById('db');


        this.speed = parseFloat(this.speedEl.value);

        this.rangeX = [-1, 1];
        this.rangeY = [-1, 1];
        this.dirX   = -1;
        this.dirY   = -1;
        this.dx  	= 0;
        this.dy  	= 0;

        this.r = 0;
        this.g = 0;
        this.b = 0;

        this.dirR = 1;
        this.dirG = 1;
        this.dirB = 1;

        this.ddr = parseFloat(this.drEl.value);
		this.ddg = parseFloat(this.dgEl.value);
		this.ddb = parseFloat(this.dbEl.value);

        var self = this;

        setTimeout(function(){ self.loop() }, this.speed);

	},

	loop: function() {

		this.rotationEnabled = this.rotationEl.checked;
    	this.scalingEnabled = this.scalingEl.checked;
    	this.translationEnabled = this.translationEl.checked;
    	this.speed = parseFloat(this.speedEl.value);
    	this.colorEnabled = this.colorEl.checked;

    	this.dr = parseFloat(this.drEl.value);
		this.dg = parseFloat(this.dgEl.value);
		this.db = parseFloat(this.dbEl.value);

        this.defineGeometry();
        this.shaders();
        this.draw();

        var self = this;
        setTimeout(function(){ self.loop() }, this.speed);

	},

	defineGeometry: function() {

		this.vertices = [
			-0.20, 0.25, 
			-0.25, -0.20, 
			0.0, -0.25,
		];

		// transformations

		if(this.rotationEnabled === true) {

			for(var i = 0; i <= Math.ceil(this.vertices.length / 2) + 1; i+=2 ) {

				var x = this.vertices[i], y = this.vertices[i+1];

				this.vertices[i]   = x * Math.cos(this.angle) - y * Math.sin(this.angle);
				this.vertices[i+1] = x * Math.sin(this.angle) + y * Math.cos(this.angle);

			}

		}

		if(this.scalingEnabled === true) {

			for(var i = 0; i < this.vertices.length; i++) {
				this.vertices[i] *= this.scale;
			}

		}

		if(this.translationEnabled === true) {

			for(var i = 0; i <= Math.ceil(this.vertices.length / 2) + 1; i+=2 ) {

				this.vertices[i]   =  this.vertices[i] + this.dx;
				this.vertices[i+1] =  this.vertices[i+1] + this.dy;
			}

			var xi = 0, yi = 0;
			for(var i = 0; i <= Math.ceil(this.vertices.length / 2) + 1; i+=2 ) {
				var x = this.vertices[i], y = this.vertices[i+1];

				if (
					( this.dirX < 0 && x < this.vertices[xi] ) ||
					( this.dirX > 0 && x > this.vertices[xi] )
				 ) {
						xi = i;
				}

				if (
					( this.dirY < 0 && y < this.vertices[yi] ) ||
					( this.dirY > 0 && y > this.vertices[yi] )
				 ) {
						yi = i+1;
				}

			}

			if(this.vertices[xi] < this.rangeX[0] + 0.02 || this.vertices[xi] > this.rangeX[1] - 0.02) {
				this.dirX = -1 * this.dirX;
			}

			if(this.vertices[yi] < this.rangeY[0] + 0.02 || this.vertices[yi] > this.rangeY[1] - 0.02) {
				this.dirY = -1 * this.dirY;
			}

			this.dx += this.dirX * 0.01;
			this.dy += this.dirY * 0.01;

		}

		if(this.colorEnabled) {

			this.r += this.ddr;
			this.g += this.ddg;
			this.b += this.ddb;

			if(this.r < 0.01 || this.r > 0.99) { this.dirR *= -1 }
			if(this.g < 0.01 || this.g > 0.99) { this.dirG *= -1 }
			if(this.b < 0.01 || this.b > 0.99) { this.dirB *= -1 }

			this.ddr = this.dirR * this.dr;
			this.ddg = this.dirG * this.dg;
			this.ddb = this.dirB * this.db;

        }

		this.vertexBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);


	},

	shaders: function() {

		this.vertCode =
			'attribute vec2 coordinates;' + 
			'void main(void) {' + ' gl_Position = vec4(coordinates,0.0, 1.0);' + '}';

		this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(this.vertShader, this.vertCode);
		this.gl.compileShader(this.vertShader);

		this.fragCode = 'void main(void) {' + 'gl_FragColor = vec4('+this.r+', '+this.g+', '+this.b+', 1.0);' + '}';
		this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(this.fragShader, this.fragCode);
		this.gl.compileShader(this.fragShader);

		this.shaderProgram = this.gl.createProgram();

		this.gl.attachShader(this.shaderProgram, this.vertShader); 
		this.gl.attachShader(this.shaderProgram, this.fragShader);
		this.gl.linkProgram(this.shaderProgram);
		this.gl.useProgram(this.shaderProgram);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.coord = this.gl.getAttribLocation(this.shaderProgram, "coordinates");
		this.gl.vertexAttribPointer(this.coord, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.coord);

	},

	draw: function() {

		this.gl.clearColor(0.5, 0.5, 0.5, 0.9);
		this.gl.enable(this.gl.DEPTH_TEST); 
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);

		this.angle += 0.1;

		if(this.scaleDir === 0) {
			this.scale -= 0.05;
			if(this.scale < 0.1) {
				this.scaleDir = 1;
			}	
		}
		else {

			this.scale += 0.05;
			if(this.scale >= 1) {
				this.scaleDir = 0;
			}
        
		}

	}

}