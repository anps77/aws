"use strict";

function DataModel(theMesh) {
    this.tesselation = {
        recursionCount: 0
    };
    this.twist = {
        thetaDegrees: 0,
        animation: false,
        centerFollowsMouse: false
    };
    this.mesh = {
        editMode: false,
        theMesh: theMesh
    };
    this.display = {
        solid: true,
        wireframe: false,
        fractal: false,
        textured: false,
        blended: false
    };
    this.events = new EventEmitter("change");
}

DataModel.prototype.setMesh = function(theMesh) {
    this.mesh.theMesh = theMesh;

    this.events.emit("change");
};

DataModel.prototype.loadFromGui = function() {
    this.tesselation.recursionCount = +$("#input-tesselation-recursion-count").val();
    this.twist.thetaDegrees = +$("#input-twist-theta-degrees").val();
    this.twist.animation = $("#input-twist-animation").is(':checked');
    this.twist.centerFollowsMouse = $("#input-twist-center-follows-mouse").is(':checked');
    this.mesh.editMode = $("#input-mesh-edit-mode").is(':checked');
    this.display.solid = $("#input-display-solid").is(':checked');
    this.display.wireframe = $("#input-display-wireframe").is(':checked');
    this.display.fractal = $("#input-display-fractal").is(':checked');
    this.display.textured = $("#input-display-textured").is(':checked');
    this.display.blended = $("#input-display-blended").is(':checked');

    this.events.emit("change");
};

DataModel.prototype.applyToGui = function() {
    $("#input-tesselation-recursion-count").val(this.tesselation.recursionCount);
    $("#input-twist-theta-degrees").val(this.twist.thetaDegrees);
    $("#input-twist-animation").prop('checked', this.twist.animation);
    $("#input-twist-center-follows-mouse").prop('checked', this.twist.centerFollowsMouse);
    $("#input-mesh-edit-mode").prop('checked', this.mesh.editMode);
    $("#input-display-solid").prop('checked', this.display.solid);
    $("#input-display-wireframe").prop('checked', this.display.wireframe);
    $("#input-display-fractal").prop('checked', this.display.fractal);
    $("#input-display-textured").prop('checked', this.display.textured);
    $("#input-display-blended").prop('checked', this.display.blended);
};


