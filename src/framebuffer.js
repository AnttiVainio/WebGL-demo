"use strict";

function Framebuffer(gl, canvas) {
	let framebuffer = null;
	let framebufferTexture = null;
	let renderbuffer = null;

	// This framebuffer is not initially created and it has to be created by calling this update function
	// If the canvas size changes, this update function can be called again to create a new framebuffer with the proper size
	this.update = function() {
		// Delete any old framebuffer stuff
		if (framebuffer !== null) gl.deleteFramebuffer(framebuffer);
		if (framebufferTexture !== null) gl.deleteTexture(framebufferTexture);
		if (renderbuffer !== null) gl.deleteRenderbuffer(renderbuffer);

		// Create the framebuffer
		framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		framebuffer.width = canvas.width();
		framebuffer.height = canvas.height();

		// Create the texture for the framebuffer
		framebufferTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, framebufferTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width, framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebufferTexture, 0);

		// Create the depth buffer for the framebuffer
		renderbuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) alert("Problem while creating framebuffer");
		else console.log("Created new framebuffer " + canvas.width() + "px x " + canvas.height() + "px");
	}

	// Activate the framebuffer's texture to be used by shaders
	this.useTexture = function(id) {
		gl.activeTexture(gl.TEXTURE0 + id);
		gl.bindTexture(gl.TEXTURE_2D, framebufferTexture);
	}

	// Draw to this framebuffer next
	this.use = function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.viewport(0, 0, framebuffer.width, framebuffer.height);
	}

	// Draw to the visible canvas next
	this.drawToCanvas = function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, canvas.width(), canvas.height());
	}
}
