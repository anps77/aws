"use strict";

function CurveVertex(position, color, width) {
    this.position = position;
    this.color = color;
    this.width = width;
}

function LinearSpline() {
    this.vertices = [];
}

function Drawing() {
    this.linearSplines = [];
}

