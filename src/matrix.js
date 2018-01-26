"use strict";

function vec3Normalized(v) {
	const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	return [v[0] / l, v[1] / l, v[2] / l];
}

function vec3Cross(v1, v2) {
	return [
		v1[1] * v2[2] - v1[2] * v2[1],
		v1[2] * v2[0] - v1[0] * v2[2],
		v1[0] * v2[1] - v1[1] * v2[0],
	];
}

function mat4Mult(m1, m2) {
	return [
		m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12],
		m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13],
		m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14],
		m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15],
		m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12],
		m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13],
		m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14],
		m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15],
		m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12],
		m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13],
		m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14],
		m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15],
		m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12],
		m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13],
		m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14],
		m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15],
	];
}

function identity() {
	return [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1,
	];
}

// Creates a perspective projection matrix
function perspective(fovRadians, aspect, near, far) {
	const f = 1.0 / Math.tan(0.5 * fovRadians);
	const rangeInv = 1.0 / (near - far);
	return [
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (near + far) * rangeInv, -1,
		0, 0, near * far * rangeInv * 2, 0,
	];
}

// Returns a camera matrix, similar as the GLU function gluLookAt
// e* is the location of the eye
// c* is the spot the eye is looking at
// u* is the vector pointing upwards
function lookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
	const f = vec3Normalized([cx - ex, cy - ey, cz - ez]);
	const up = vec3Normalized([ux, uy, uz]);
	const s = vec3Normalized(vec3Cross(f, up));
	const u = vec3Cross(s, f);
	return [
		s[0], u[0], -f[0], 0,
		s[1], u[1], -f[1], 0,
		s[2], u[2], -f[2], 0,
		-cx * s[0] - cy * s[1] - cz * s[2], -cx * u[0] - cy * u[1] - cz * u[2], cx * f[0] + cy * f[1] + cz * f[2], 1,
	];
}

function rotationX(rot) {
	return [
		1, 0, 0, 0,
		0, Math.cos(rot), Math.sin(rot), 0,
		0, -Math.sin(rot), Math.cos(rot), 0,
		0, 0, 0, 1,
	];
}
function rotationY(rot) {
	return [
		Math.cos(rot), 0, -Math.sin(rot), 0,
		0, 1, 0, 0,
		Math.sin(rot), 0, Math.cos(rot), 0,
		0, 0, 0, 1,
	];
}
function rotationZ(rot) {
	return [
		Math.cos(rot), Math.sin(rot), 0, 0,
		-Math.sin(rot), Math.cos(rot), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1,
	];
}

function scale(s) {
	return [
		s,0,0,0,
		0,s,0,0,
		0,0,s,0,
		0,0,0,1,
	];
}

function translate(mat, x, y, z) {
	// Create a new matrix, don't modify the original one
	mat = mat.slice();
	mat[12] += x;
	mat[13] += y;
	mat[14] += z;
	return mat;
}
