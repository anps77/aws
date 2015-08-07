"use strict";

function Camera() {
	// Note: it is camera transformation. To make it view transformation invert it
	this.transformation = new Transformation();
	this.transformation = Transformation.newTranslation(2, 2, 5);
}

function Decorations() {
	this.inScene = [];
	this._generateXYZPlanes();
}

Decorations.prototype._generateXYZPlanes = function() {
	var sectionCount = 4;
	var faceAlpha = 0.05;
	var edgeAlpha = 0.95

	var pxy = Mesh.newPlane(null, new Vector(1, 0, 0), new Vector(0, 1, 0), sectionCount, sectionCount);
	pxy.material.faceColor = new Color(0.0, 0.0, 1.0, faceAlpha);
	pxy.material.edgeColor = new Color(0.0, 0.0, 1.0, edgeAlpha);
	this.inScene.push(pxy);
	
	var pyz = Mesh.newPlane(null, new Vector(0, 1, 0), new Vector(0, 0, 1), sectionCount, sectionCount);
	pyz.material.faceColor = new Color(1.0, 0.0, 0.0, faceAlpha);
	pyz.material.edgeColor = new Color(1.0, 0.0, 0.0, edgeAlpha);
	this.inScene.push(pyz);

	var pzx = Mesh.newPlane(null, new Vector(0, 0, 1), new Vector(1, 0, 0), sectionCount, sectionCount);
	pzx.material.faceColor = new Color(0.0, 1.0, 0.0, faceAlpha);
	pzx.material.edgeColor = new Color(0.0, 1.0, 0.0, edgeAlpha);
	this.inScene.push(pzx);
}

function Scene() {
	this.model = new Model();
	this.camera = new Camera();
	this.decorations = new Decorations();
}

