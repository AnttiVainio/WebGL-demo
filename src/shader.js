"use strict";

// Load the shader from a string containing the source code
function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}
	alert(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

// Link the shader program using the given vertex and fragment shaders
function createProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return program;
	}
	alert(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

// Keep track of the currently used shader so that it can be disabled when another shader is activated
let currentShader = null;

function Shader(gl, vertexShaderSource, fragmentShaderSource) {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	const program = createProgram(gl, vertexShader, fragmentShader);

	const attributes = {};
	const uniforms = {};

	// This will also disable the previously used shader
	this.use = function() {
		if (currentShader !== null) currentShader.disable();
		gl.useProgram(program);
		for (const attr in attributes) {
			if (attributes.hasOwnProperty(attr)) gl.enableVertexAttribArray(attributes[attr][0]);
		}
		currentShader = this;
	}

	// Disable the vertex attrib arrays of this shader
	this.disable = function() {
		for (const attr in attributes) {
			if (attributes.hasOwnProperty(attr)) gl.disableVertexAttribArray(attributes[attr][0]);
		}
	}

	// size is the number of coordinates given for each vertex
	this.addAttribute = function(name, size) {
		attributes[name] = [gl.getAttribLocation(program, name), size];
	}
	this.setAttribute = function(name, buffer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(attributes[name][0], attributes[name][1], gl.FLOAT, false, 0, 0);
	}

	this.addUniform = function(name, type) {
		uniforms[name] = [gl.getUniformLocation(program, name), type];
	}
	this.setUniform = function(name, value) {
		switch (uniforms[name][1]) {
			case "int": gl.uniform1i(uniforms[name][0], value); break;
			case "vec4": gl.uniform4fv(uniforms[name][0], value); break;
			case "mat4": gl.uniformMatrix4fv(uniforms[name][0], false, value); break;
		}
	}
}
