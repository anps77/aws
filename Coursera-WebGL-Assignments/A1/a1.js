"use strict";

// Hello there and thanks for your interest in my code :)
// Please note that this is a just a WebGL learning exercise and not an actual production code.

var canvas;
var gl;
var program;

var vertices = [];
var predefined = {
    triangle: [-0.5, -0.5, 0.0, 0.5, 0.5, -0.5],
    hello: [-0.9453125,-0.25390625,-0.94140625,0.51953125,-0.84765625,0.51953125,-0.93359375,-0.28125,-0.84375,-0.2734375,-0.84375,0.51171875,-0.83984375,0.21875,-0.6015625,0.22265625,-0.578125,0.1015625,-0.578125,0.09375,-0.83984375,0.10546875,-0.83203125,0.203125,-0.6171875,0.546875,-0.5859375,-0.24609375,-0.4609375,-0.2421875,-0.4609375,-0.2421875,-0.515625,0.5390625,-0.59765625,0.546875,-0.39453125,0.5390625,-0.36328125,-0.21484375,-0.265625,-0.2265625,-0.265625,-0.21484375,-0.3984375,0.546875,-0.3203125,0.53515625,-0.31640625,0.5390625,-0.0859375,0.52734375,-0.0859375,0.453125,-0.0859375,0.4453125,-0.30078125,0.4609375,-0.31640625,0.52734375,-0.28125,0.2421875,-0.1875,0.23828125,-0.171875,0.1328125,-0.171875,0.12109375,-0.2890625,0.21875,-0.28125,0.1328125,-0.25,-0.22265625,-0.07421875,-0.20703125,-0.08203125,-0.1171875,-0.09765625,-0.10546875,-0.24609375,-0.19140625,-0.25390625,-0.10546875,-0.03515625,0.53125,-0.0390625,-0.203125,0.04296875,-0.1953125,0.0546875,-0.19140625,0.015625,0.55078125,-0.02734375,0.5390625,0.1171875,0.5546875,0.125,-0.16796875,0.2109375,-0.171875,0.21484375,-0.15234375,0.1953125,0.5859375,0.1328125,0.5625,0.265625,0.203125,0.30078125,0.44140625,0.375,0.40625,0.30859375,0.453125,0.4140625,0.5859375,0.5,0.5546875,0.43359375,0.58984375,0.5625,0.578125,0.57421875,0.54296875,0.3828125,0.41796875,0.4609375,0.5234375,0.32421875,0.44921875,0.37109375,0.3671875,0.35546875,0.07421875,0.28515625,0.203125,0.2734375,0.1796875,0.3125,-0.08203125,0.39453125,-0.0859375,0.33203125,-0.09375,0.4375,-0.16015625,0.46484375,-0.11328125,0.4609375,-0.15625,0.48828125,-0.11328125,0.56640625,-0.11328125,0.57421875,-0.10546875,0.6640625,0.16015625,0.60546875,0.16015625,0.6640625,0.17578125,0.65625,0.48828125,0.60546875,0.4765625,0.578125,0.56640625,0.640625,0.5,0.59765625,0.49609375,0.6015625,0.43359375,0.61328125,0.19140625,0.6484375,0.1875,0.50390625,-0.08984375,0.578125,0.05859375,0.56640625,-0.1015625,0.74609375,0.62890625,0.9375,0.640625,0.828125,-0.0078125,0.82421875,-0.06640625,0.73046875,-0.19921875,0.9140625,-0.19140625]
};
var points = [];

var numTimesToSubdivide = 0;
var twistAmount = 0;

var bufferId;

var additionMode = -1; // -1: off, 0..2: on, current step

var animation = false;
var animationTick;

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{
    // check for end of recursion
    if ( count == 0 ) {
        triangle( a, b, c );
    }
    else {
        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // four new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );
    }
}

function preparePoints() {
    points = [];
    for(var i = 0; i < Math.floor(vertices.length / 6); ++i) {
        divideTriangle(vertices.slice(i*6,i*6+2), vertices.slice(i*6+2,i*6+4), vertices.slice(i*6+4,i*6+6), numTimesToSubdivide);
    }
}

function render() {
    //alert(points);
    gl.clear( gl.COLOR_BUFFER_BIT );
    if(points.length > 0) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
        gl.uniform1f(gl.getUniformLocation(program, "twist"), twistAmount);
        gl.drawArrays( gl.TRIANGLES, 0, points.length );
    }
}

function preparePointsAndRender() {
    preparePoints();
    render();
}

window.onload = function() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 2*4*3*Math.pow(4, 5), gl.STATIC_DRAW ); // 2 components, 4 bytes each, 3 vertices per polygon, each subdivision (max 5) multiplies polygons by 4

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    vertices = predefined.triangle.slice();

    document.getElementById("slider-tesselation").onchange = function() {
        numTimesToSubdivide = event.srcElement.value;
        preparePointsAndRender();
    };

    document.getElementById("slider-twist").onchange = function() {
        if(!animation) {
            twistAmount = event.srcElement.value;
            preparePointsAndRender();
        }
    };

    document.getElementById("button-add-triangle").onclick = function() {
        if(additionMode == -1) {
            document.getElementById("span-triangle-addition-mode-info").innerHTML = "Triangle Addition Mode: on. Every three clicks on the canvas create a new triangle. Suggestion: set twist smount to zero for better experience.";
            additionMode = 0;
        } else {
            document.getElementById("span-triangle-addition-mode-info").innerHTML = "Triangle Addition Mode: off";
            additionMode = -1;
            vertices.length -= vertices.length % 3;
        }
    };

    document.getElementById("button-reset-triangles").onclick = function() {
        if(confirm("This will remove all the triangles. Continue?")) {
            vertices = [];
            additionMode = -1;
            preparePointsAndRender();
        }
    };

    document.getElementById("gl-canvas").onclick = function(e) {
        if(additionMode != -1) {
            var b = document.getElementById("gl-canvas").getBoundingClientRect();
            var x = e.clientX - b.left;
            var y = e.clientY - b.top;
            vertices.push(2 * x / 512 - 1, 1 - 2 * y / 512);
            additionMode = (additionMode + 1) % 3;
            preparePointsAndRender();
        }
    };

    document.getElementById("button-get-vertices").onclick = function() {
        alert(vertices);
    };

    document.getElementById("button-load-predefined").onclick = function() {
        var ss = document.getElementById("select-predefined");
        if(ss != null) {
            ss.remove();
            return;
        }

        var s = document.createElement("select");
        s.setAttribute("id", "select-predefined");
        s.onchange = function() {
            if(this.selectedIndex == 0) {
                return;
            }
            var k = this.options[this.selectedIndex].textContent;
            vertices = predefined[k].slice();
            additionMode = -1;
            preparePointsAndRender();
            this.remove();
        };
        var o0 = document.createElement("option");
        o0.textContent = "(Select)";
        s.appendChild(o0);
        for(var k in predefined) {
            var o = document.createElement("option");
            o.textContent = k;
            s.appendChild(o);
        }
        document.body.insertBefore(s, document.getElementById("gl-canvas"));
    };

    document.getElementById("button-twist-animate").onclick = function() {
        animation = !animation;
        if(animation) {
            animationTick = 0;
            var func = function func() {
                if(animation) {
                    twistAmount = document.getElementById("slider-twist").value * Math.cos(animationTick);
                    preparePointsAndRender();
                    animationTick += 3.14 / 50;
                    setTimeout(func, 40)
                }
            };
            setTimeout(func, 100);
        } else {
            twistAmount = document.getElementById("slider-twist").value;
            preparePointsAndRender();
        }
    };

    preparePointsAndRender();
};
