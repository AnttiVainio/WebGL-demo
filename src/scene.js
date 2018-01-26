"use strict";

// A simple 3D vertex shader with perspective, camera and transformation matrices
// The transform matrix could scale, rotate and move the 3D object
const _3DVertexShader = `
	attribute vec4 a_position;
	uniform mat4 perspective;
	uniform mat4 camera;
	uniform mat4 transform;
	void main() {
		gl_Position = perspective * camera * transform * a_position;
	}
`;

// A fragment shader used with the 3D vertex shader
// Only sets a uniform color for the whole mesh
const _3DFragmentShader = `
	precision mediump float;
	uniform vec4 color;
	void main() {
		gl_FragColor = color;
	}
`;

// A simple 2D vertex shader that also supports texture coordinates
const _2DVertexShader = `
	attribute vec4 a_position;
	attribute vec2 a_texture;
	varying vec2 texCoord;
	void main() {
		texCoord = a_texture;
		gl_Position = a_position;
	}
`;

// A simple 2D fragment shader that supports texture coordinates
// Also separates the rgb channels by moving them a bit horizontally
const _2DFragmentShader = `
	precision mediump float;
	varying vec2 texCoord;
	uniform sampler2D texture1;
	void main() {
		gl_FragColor = vec4(
			texture2D(texture1, texCoord + vec2(-0.002, 0.0)).r,
			texture2D(texture1, texCoord + vec2( 0.0,  0.0)).g,
			texture2D(texture1, texCoord + vec2( 0.002, 0.0)).b,
			1.0);
	}
`;

// A 3 dimensional ring shape
// The vertex coordinates are generated based on the size values
function Ring(gl, shader, size1, size2) {
	const prec = 64;
	const positions = [];

	// Generate the vertex coordinates
	for (let part = 0; part < 4; part++) {
		const s1 = part === 3 ? size2 : size1;
		const s2 = part === 2 ? size1 : size2;
		const z1 = (part === 1 ? -1 : 1) * 0.05 * size2;
		const z2 = (part === 0 ? 1 : -1) * 0.05 * size2;
		for (let i = 0; i < prec; i++) {
			positions.push(Math.cos(i / (prec - 1.0) * 2.0 * Math.PI) * s1);
			positions.push(Math.sin(i / (prec - 1.0) * 2.0 * Math.PI) * s1);
			positions.push(z1);
			positions.push(1);
			positions.push(Math.cos(i / (prec - 1.0) * 2.0 * Math.PI) * s2);
			positions.push(Math.sin(i / (prec - 1.0) * 2.0 * Math.PI) * s2);
			positions.push(z2);
			positions.push(1);
		}
	}

	// Create an array buffer for drawing
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	const colors = [];
	for (let i = 0; i < 4 * 3; i++) colors.push(Math.random() * 0.8 + 0.2);

	// Draw the ring with different colors for each side
	this.draw = function() {
		shader.setAttribute("a_position", positionBuffer);
		shader.setUniform("color", colors.slice(0, 3).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, prec * 2);
		shader.setUniform("color", colors.slice(3, 6).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, prec * 2, prec * 2);
		shader.setUniform("color", colors.slice(6, 9).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, prec * 4, prec * 2);
		shader.setUniform("color", colors.slice(9, 12).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, prec * 6, prec * 2);
	}
}

// This structure consists of multiple rings that are "connected" to each other
// The structure also contains a box around everything
function Structure(gl, framebuffer, shader, amount) {
	// Create the rings
	const objects = [];
	for (let i = amount; i > 0; i--) objects.push(new Ring(gl, shader, i * 0.2, (i + 1) * 0.2));

	// The are the coordinates for the box
	const positions = [
		-1, -1, -1, 1,
		 1, -1, -1, 1,
		-1,  1, -1, 1,
		 1,  1, -1, 1,

		-1, -1,  1, 1,
		 1, -1,  1, 1,
		-1,  1,  1, 1,
		 1,  1,  1, 1,

		-1, -1, -1, 1,
		 1, -1, -1, 1,
		-1, -1,  1, 1,
		 1, -1,  1, 1,

		-1,  1, -1, 1,
		 1,  1, -1, 1,
		-1,  1,  1, 1,
		 1,  1,  1, 1,

		-1, -1, -1, 1,
		-1, -1,  1, 1,
		-1,  1, -1, 1,
		-1,  1,  1, 1,

		 1, -1, -1, 1,
		 1, -1,  1, 1,
		 1,  1, -1, 1,
		 1,  1,  1, 1,
	];

	// Create an array buffer for drawing the box
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	const colors = [];
	for (let i = 0; i < 6 * 3; i++) colors.push(Math.random() * 0.3);

	this.draw = function(rot, camera, perspectiveMat) {
		// Draw everything to the framebuffer
		framebuffer.use();
		shader.use(); // this is the 3D shader
		gl.enable(gl.DEPTH_TEST);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		shader.setUniform("camera", camera);
		shader.setUniform("perspective", perspectiveMat);
		shader.setUniform("transform", translate(scale(10), 0, 0, -4));

		// Draw the box with different colors for each side
		shader.setAttribute("a_position", positionBuffer);
		shader.setUniform("color", colors.slice(0, 3).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		shader.setUniform("color", colors.slice(3, 6).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);
		shader.setUniform("color", colors.slice(6, 9).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, 8, 4);
		shader.setUniform("color", colors.slice(9, 12).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, 12, 4);
		shader.setUniform("color", colors.slice(12, 15).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, 16, 4);
		shader.setUniform("color", colors.slice(15, 18).concat(1));
		gl.drawArrays(gl.TRIANGLE_STRIP, 20, 4);

		// Draw the rings, each with one additional rotation compared to the previous ring
		let mat = rotationY(rot * 0.5);
		for (let i = 0; i < amount; i++) {
			const fun = i % 2 === 0 ? rotationX : rotationY;
			mat = mat4Mult(fun(rot * (i * 0.75 + 1.0)), mat);
			shader.setUniform("transform", translate(mat, 0, 0, -4));
			objects[i].draw();
		}
	}
}

// A 2 dimensional box that fills the whole canvas
function FullscreenBox(gl, framebuffer, framebufferShader) {
	const positions = [
		-1, -1, 1, 1,
		 1, -1, 1, 1,
		-1,  1, 1, 1,
		 1,  1, 1, 1,
	];
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// These are the texture coordinates
	const texture = [
		0, 0,
		1, 0,
		0, 1,
		1, 1,
	];
	const textureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture), gl.STATIC_DRAW);

	this.draw = function() {
		// Draw to the visible canvas now
		framebuffer.drawToCanvas();
		framebufferShader.use(); // this is the 2D shader
		gl.disable(gl.DEPTH_TEST);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Draw the framebuffer texture to the canvas
		framebuffer.useTexture(0);
		framebufferShader.setUniform("texture1", 0);
		framebufferShader.setAttribute("a_position", positionBuffer);
		framebufferShader.setAttribute("a_texture", textureBuffer);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}
