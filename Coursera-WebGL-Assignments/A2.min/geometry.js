"use strict";

function Vector(x, y)
{
    this.x = x;
    this.y = y;
}

Vector.prototype.subtract = function (otherVector) {
    return new Vector(this.x - otherVector.x, this.y - otherVector.y);
};

Vector.prototype.add = function (otherVector) {
    return new Vector(this.x + otherVector.x, this.y + otherVector.y);
};

Vector.prototype.divide = function (scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
};

Vector.prototype.multiply = function (scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
};

Vector.prototype.getLength = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getNormalized = function () {
    // TODO: what if getLength() < EPS?
    return this.divide(this.getLength());
};

function Point(radiusVector) {
    this.radiusVector = radiusVector;
}

Point.prototype.subtract = function (otherPointOrVector) {
    if (otherPointOrVector instanceof Point) {
        return this.radiusVector.subtract(otherPointOrVector.radiusVector);
    } else if (otherPointOrVector instanceof Vector) {
        return new Point(this.radiusVector.subtract(otherPointOrVector));
    }
};

Point.prototype.add = function (otherVector) {
    return new Point(this.radiusVector.add(otherVector));
};
